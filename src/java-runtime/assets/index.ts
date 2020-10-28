// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import "../../assets/vscode.scss";
import "bootstrap/js/src/tab";
import bytes = require("bytes");
import * as ReactDOM from "react-dom";
import { JavaRuntimeEntry, JdkData, ProjectRuntimeEntry } from "../types";
import { JdkAcquisitionPanel, JdkAcquisitionPanelProps } from "./jdk.acquisition";
import * as React from "react";
import { ProjectRuntimePanel } from "./projectRuntimePanel";
import { JdkInstallationPanel } from "./jdk.installation";
import { ConfigureLSPanel } from "./jdk.ls";

window.addEventListener("message", event => {
  if (event.data.command === "applyJdkInfo") {
    applyJdkInfo(event.data.jdkInfo);
  } else if (event.data.command === "showJavaRuntimeEntries") {
    console.log(event);
    showJavaRuntimeEntries(event.data.entries);
  }
});

let jdkEntries: JavaRuntimeEntry[];
let projectRuntimes: ProjectRuntimeEntry[];
function showJavaRuntimeEntries(entries: {
  javaRuntimes: JavaRuntimeEntry[];
  projectRuntimes: ProjectRuntimeEntry[];
}) {
  jdkEntries = entries.javaRuntimes;
  projectRuntimes = entries.projectRuntimes;
  render();
}

let jdkData: JdkData;

function applyJdkInfo(jdkInfo: any) {
  let binary = jdkInfo.binaries[0];
  let downloadLink = binary.installer_link || binary.binary_link;
  let encodedLink = `command:java.helper.openUrl?${encodeURIComponent(JSON.stringify(downloadLink))}`;

  jdkData = {
    name: jdkInfo.release_name,
    os: binary.os,
    arch: binary.architecture,
    size: bytes(binary.binary_size, { unitSeparator: " " }),
    downloadLink: encodedLink
  };

  render();
}

function render() {
  const props: JdkAcquisitionPanelProps = {
    jdkEntries: jdkEntries,
    projectRuntimes: projectRuntimes,
    jdkData: jdkData,
    onRequestJdk: requestJdkInfo
  };

  ReactDOM.render(React.createElement(JdkAcquisitionPanel, props), document.getElementById("jdkAcquisitionPanel"));
  ReactDOM.render(React.createElement(ProjectRuntimePanel, props), document.getElementById("projectRuntimePanel"));
  ReactDOM.render(React.createElement(ConfigureLSPanel, props), document.getElementById("configureLsPanel"));
  ReactDOM.render(React.createElement(JdkInstallationPanel, {data: jdkData, onRequestJdk: requestJdkInfo}, null ), document.getElementById("jdkInstallationPanel"));
}


render();

declare function acquireVsCodeApi(): any;
const vscode = acquireVsCodeApi();

function requestJdkInfo(jdkVersion: string, jvmImpl: string) {
  vscode.postMessage({
    command: "requestJdkInfo",
    jdkVersion: jdkVersion,
    jvmImpl: jvmImpl
  });
}

export function udpateJavaHome(entry: JavaRuntimeEntry) {
  entry.usedByLS = true;
  vscode.postMessage({
    command: "updateJavaHome",
    javaHome: entry.path
  });
}

export function updateRuntimePath(sourceLevel: string, runtimePath: string) {
  vscode.postMessage({
    command: "updateRuntimePath",
    sourceLevel,
    runtimePath
  });
}
