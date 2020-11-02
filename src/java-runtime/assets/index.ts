// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import "../../assets/vscode.scss";
import "bootstrap/js/src/tab";
import bytes = require("bytes");
import * as ReactDOM from "react-dom";
import { JavaRuntimeEntry, JdkData, ProjectRuntimeEntry } from "../types";
import { JdkAcquisitionPanel } from "./jdk.acquisition";
import * as React from "react";
import { ProjectRuntimePanel } from "./projectRuntimePanel";
import { JdkInstallationPanel } from "./jdk.installation";
import { ConfigureLSPanel } from "./jdk.ls";
import { requestJdkInfo } from "./vscode.api";
import * as $ from "jquery";

window.addEventListener("message", event => {
  if (event.data.command === "applyJdkInfo") {
    applyJdkInfo(event.data.jdkInfo);
  } else if (event.data.command === "showJavaRuntimeEntries") {
    console.log(event);
    showJavaRuntimeEntries(event.data.args);
  }
});

let jdkEntries: JavaRuntimeEntry[] | undefined;
let projectRuntimes: ProjectRuntimeEntry[] | undefined;
let javaHomeError: any;
function showJavaRuntimeEntries(args: {
  javaRuntimes?: JavaRuntimeEntry[];
  projectRuntimes?: ProjectRuntimeEntry[];
  javaHomeError?: string
}) {
  jdkEntries = args.javaRuntimes;
  projectRuntimes = args.projectRuntimes;
  javaHomeError = args.javaHomeError;
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
  const props = {
    jdkEntries: jdkEntries,
    projectRuntimes: projectRuntimes,
    jdkData: jdkData,
    onRequestJdk: requestJdkInfo,
    javaHomeError
  };

  if (javaHomeError) {
    ($("#configure-ls-tab") as any).tab("show");
  }

  ReactDOM.render(React.createElement(ConfigureLSPanel, props), document.getElementById("configureLsPanel"));
  ReactDOM.render(React.createElement(JdkAcquisitionPanel, props), document.getElementById("jdkAcquisitionPanel"));
  ReactDOM.render(React.createElement(ProjectRuntimePanel, props), document.getElementById("projectRuntimePanel"));
  ReactDOM.render(React.createElement(JdkInstallationPanel, { data: jdkData, onRequestJdk: requestJdkInfo }, null), document.getElementById("jdkInstallationPanel"));

  $("a.navigation").click(e => {
    ($($(e.target).attr("href") || "") as any).tab("show");
  });

}

render();

