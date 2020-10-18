// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.


import * as _ from "lodash";
import * as path from "path";
import * as request from "request-promise-native";
import * as vscode from "vscode";
import { getExtensionContext, loadTextFromFile } from "../utils";
import { findJavaHomes, getJavaVersion, JavaRuntime } from "./findJavaRuntime";
import architecture = require("arch");
import { checkJavaRuntime } from "./upstreamApi";
import { JavaRuntimeEntry, ProjectRuntimeEntry } from "./types";

let javaRuntimeView: vscode.WebviewPanel | undefined;
let javaHomes: JavaRuntime[];

export async function javaRuntimeCmdHandler(context: vscode.ExtensionContext, operationId: string) {
  if (javaRuntimeView) {
    javaRuntimeView.reveal();
    return;
  }

  javaRuntimeView = vscode.window.createWebviewPanel("java.runtime", "Configure Java Runtime", {
    viewColumn: vscode.ViewColumn.One,
  }, {
    enableScripts: true,
    enableCommandUris: true,
    retainContextWhenHidden: true
  });

  await initializeJavaRuntimeView(context, javaRuntimeView, onDidDisposeWebviewPanel);
}

function onDidDisposeWebviewPanel() {
  javaRuntimeView = undefined;
}

async function initializeJavaRuntimeView(context: vscode.ExtensionContext, webviewPanel: vscode.WebviewPanel, onDisposeCallback: () => void) {
  webviewPanel.iconPath = vscode.Uri.file(path.join(context.extensionPath, "logo.lowres.png"));
  const resourceUri = context.asAbsolutePath("./out/assets/java-runtime/index.html");
  webviewPanel.webview.html = await loadTextFromFile(resourceUri);

  context.subscriptions.push(webviewPanel.onDidDispose(onDisposeCallback));
  context.subscriptions.push(webviewPanel.webview.onDidReceiveMessage(async (e) => {
    if (e.command === "requestJdkInfo") {
      let jdkInfo = await suggestOpenJdk(e.jdkVersion, e.jvmImpl);
      applyJdkInfo(jdkInfo);
    } else if (e.command === "updateJavaHome") {
      const { javaHome } = e;
      await vscode.workspace.getConfiguration("java").update("home", javaHome);
      findJavaRuntimeEntries().then(data => {
        showJavaRuntimeEntries(data);
      });
    } else if (e.command === "updateRuntimePath") {
      const {sourceLevel, runtimePath} = e;
      const runtimes = vscode.workspace.getConfiguration("java").get<any[]>("configuration.runtimes") || [];
      const target = runtimes.find(r => r.name === sourceLevel);
      if (target) {
        target.path = runtimePath;
      } else {
        runtimes.push({
          name: sourceLevel,
          path: runtimePath
        });
      }
      await vscode.workspace.getConfiguration("java").update("configuration.runtimes", runtimes, vscode.ConfigurationTarget.Global);
      findJavaRuntimeEntries().then(data => {
        showJavaRuntimeEntries(data);
      });
    }
  }));

  function applyJdkInfo(jdkInfo: any) {
    webviewPanel.webview.postMessage({
      command: "applyJdkInfo",
      jdkInfo: jdkInfo
    });
  }

  function showJavaRuntimeEntries(entries: {
    javaRuntimes: JavaRuntimeEntry[];
    projectRuntimes: ProjectRuntimeEntry[];
  }) {
    webviewPanel.webview.postMessage({
      command: "showJavaRuntimeEntries",
      entries: entries,
    });
  }

  suggestOpenJdk().then(jdkInfo => {
    applyJdkInfo(jdkInfo);
  });

  findJavaRuntimeEntries().then(data => {
    showJavaRuntimeEntries(data);
  });
}

export class JavaRuntimeViewSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    if (javaRuntimeView) {
      javaRuntimeView.reveal();
      webviewPanel.dispose();
      return;
    }

    javaRuntimeView = webviewPanel;
    initializeJavaRuntimeView(getExtensionContext(), webviewPanel, onDidDisposeWebviewPanel);
  }
}

export async function validateJavaRuntime() {
  // TODO:
  // option a) should check Java LS exported API for java_home
  // * option b) use the same way to check java_home as vscode-java
  try {
    const upstreamJavaHome = await checkJavaRuntime();
    if (upstreamJavaHome) {
      const version = await getJavaVersion(upstreamJavaHome);
      if (version && version >= 11) {
        return true;
      }
    }
  } catch (error) {
  }
  return false;
}

export async function findJavaRuntimeEntries(): Promise<{
  javaRuntimes: JavaRuntimeEntry[],
  projectRuntimes: ProjectRuntimeEntry[]
}> {
  if (!javaHomes) {
    javaHomes = await findJavaHomes();
  }
  const entries = javaHomes;
  const javaHomeForLS = await checkJavaRuntime();

  const projectRuntimes = await getProjectRuntimes();
  const javaRuntimeEntries = entries.map(elem => ({
    name: "name",
    path: elem.home,
    version: elem.version,
    type: elem.sources.join(","),
    usedByLS: elem.home === javaHomeForLS
  })).sort((a, b) => b.version - a.version);
  return {
    javaRuntimes: javaRuntimeEntries,
    projectRuntimes: projectRuntimes
  };
}

async function getProjectRuntimes(): Promise<ProjectRuntimeEntry[]> {
  const ret: ProjectRuntimeEntry[] = [];
  const javaExt = vscode.extensions.getExtension("redhat.java");
  if (javaExt && javaExt.isActive && vscode.workspace.workspaceFolders) {
    const SOURCE_LEVEL_KEY = "org.eclipse.jdt.core.compiler.source";
    const VM_INSTALL_PATH = "org.eclipse.jdt.ls.core.vm.location";
    for (const wf of vscode.workspace.workspaceFolders) {
      const projectRoot = wf.uri.toString();
      try {
        const settings: any = await javaExt.exports.getProjectSettings(projectRoot, [SOURCE_LEVEL_KEY, VM_INSTALL_PATH]);
        ret.push({
          name: wf.name,
          rootPath: projectRoot,
          runtimePath: settings[VM_INSTALL_PATH],
          sourceLevel: settings[SOURCE_LEVEL_KEY]
        });
      } catch (error) {
        // ignore
      }
    }
  }
  return ret;
}

export async function suggestOpenJdk(jdkVersion: string = "openjdk11", impl: string = "hotspot") {
  let os: string = process.platform;
  if (os === "win32") {
    os = "windows";
  } else if (os === "darwin") {
    os = "mac";
  } else {
    os = "linux";
  }

  let arch = architecture();
  if (arch === "x86") {
    arch = "x32";
  }

  return await request.get({
    uri: `https://api.adoptopenjdk.net/v2/info/releases/${jdkVersion}?openjdk_impl=${impl}&arch=${arch}&os=${os}&type=jdk&release=latest`,
    json: true
  });
}
