// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as cp from "child_process";
import * as _ from "lodash";
import * as path from "path";
import * as request from "request-promise-native";
import * as vscode from "vscode";
import { getExtensionContext, loadTextFromFile } from "../utils";
import { findJavaHomes, JavaRuntime } from "./findJavaRuntime";
import { JavaRuntimeEntry, ProjectRuntimeEntry } from "./types";
import architecture = require("arch");

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

const isWindows = process.platform.indexOf("win") === 0;
const JAVAC_FILENAME = path.join("bin", "javac" + (isWindows ? ".exe" : ""));
const JAVA_FILENAME = path.join("bin", "java" + (isWindows ? ".exe" : ""));

// Taken from https://github.com/Microsoft/vscode-java-debug/blob/7abda575111e9ce2221ad9420330e7764ccee729/src/launchCommand.ts

function parseMajorVersion(content: string): number {
  let regexp = /version "(.*)"/g;
  let match = regexp.exec(content);
  if (!match) {
    return 0;
  }
  let version = match[1];
  // Ignore '1.' prefix for legacy Java versions
  if (version.startsWith("1.")) {
    version = version.substring(2);
  }

  // look into the interesting bits now
  regexp = /\d+/g;
  match = regexp.exec(version);
  let javaVersion = 0;
  if (match) {
    javaVersion = parseInt(match[0], 10);
  }
  return javaVersion;
}

async function getJavaVersion(javaHome: string | undefined): Promise<number> {
  if (!javaHome) {
    return Promise.resolve(0);
  }

  return new Promise<number>((resolve, reject) => {
    cp.execFile(path.resolve(javaHome, JAVA_FILENAME), ["-version"], {}, (err, stdout, stderr) => {
      resolve(parseMajorVersion(stderr));
    });
  });
}

export async function validateJavaRuntime() { // TODO: revisit
  const entries = (await findJavaRuntimeEntries()).javaRuntimes;
  // Java LS uses the first non-empty path to locate the JDK
  const currentPathIndex = entries.findIndex(entry => !_.isEmpty(entry.path));
  if (currentPathIndex !== -1) {
    return entries[currentPathIndex].isValid;
  }

  return _.some(entries, entry => entry.isValid);
}

export async function findJavaRuntimeEntries(): Promise<{
  javaRuntimes: JavaRuntimeEntry[],
  projectRuntimes: ProjectRuntimeEntry[]
}> {
  if (!javaHomes) {
    javaHomes = await findJavaHomes();
  }
  const entries = javaHomes;
  const javaHomeForLS = vscode.workspace.getConfiguration("java").get("home"); // TODO: revisit

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
  }
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
