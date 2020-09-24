// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as React from "react";
import { JavaRuntimeEntry } from "../types";
import * as _ from "lodash";
import { udpateJavaHome } from ".";

const MIN_JDK_VERSION: number = 11;

export interface JavaRuntimeEntryPanelProps {
  data: JavaRuntimeEntry[];
}

export const JavaRuntimeEntryPanel = (props: JavaRuntimeEntryPanelProps | undefined) => {
  const isLoading = _.isEmpty(props && props.data);

  if (isLoading) {
    return (<div className="spinner-border spinner-border-sm" role="status">
      <span className="sr-only">Loading...</span>
    </div>);
  }

  const entryData = (props && props.data) || [];
  const currentIndex = entryData.findIndex(entry => !!entry.path);
  let errorIndex = -1;
  if (currentIndex !== -1 && !entryData[currentIndex].isValid) {
    errorIndex = currentIndex;
  }

  const entries = entryData.map((entry, index) => {
    let badgeClasses = ["badge", "badge-pill"];
    if (!entry.version || entry.version < MIN_JDK_VERSION) {
      badgeClasses.push("badge-danger");
    } else {
      badgeClasses.push("badge-success");
    }

    return (
      <tr key={index}>
        <th scope="row">{index + 1}</th>
        <td>
          {!entry.path && <em>{"<Empty>"}</em>}
          {entry.path}
          &nbsp;
          {/* {index === currentIndex && <span className={badgeClasses.join(" ")}>Current</span>} */}
          {/* {entry.path && !entry.isValid && <span className="badge badge-pill badge-secondary" title={entry.hint}>Invalid</span>} */}
          {entry.path && entry.hint && <div><em className={errorIndex === index ? "text-danger" : "text-warning"}>{entry.hint}</em></div>}
        </td>
        <td>
          {entry.version}
        </td>
        <td>
          {entry.usedByLS && <span className={badgeClasses.join(" ")}>In Use</span>}
          {!entry.usedByLS && entry.version >= MIN_JDK_VERSION && <a href="#" onClick={()=>udpateJavaHome(entry)} >Use</a>}
        </td>
        <td>
          {entry.isRuntime && <span className={badgeClasses.join(" ")}>In Use</span>}
        </td>
      </tr>
    );
  });

  const hasValidJdk = _.some(entryData, entry => entry.version >= MIN_JDK_VERSION);
  let message = ``;
  if (!hasValidJdk) {
    message = "⚠️ No JDK installation was detected. Please follow the links below to download and install one.";
  }

  return (
    <div className="table-responsive">
      <table className="table table-borderless table-hover table-sm mb-0">
        <caption className="pb-0">
          {message ? message : <div>If you change any of the entries above, you need to <a href="command:workbench.action.reloadWindow">reload</a> VS Code to make them effective.</div>}
        </caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Path</th>
            <th scope="col">Version</th>
            <th scope="col">LS</th>
            <th scope="col"><a href="command:workbench.action.openSettings?%22java.configuration.runtime%22">Project</a></th>
          </tr>
        </thead>
        <tbody>
          {entries}
        </tbody>
      </table>
    </div>
  );
};
