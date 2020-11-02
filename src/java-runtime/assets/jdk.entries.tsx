// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as React from "react";
import { JavaRuntimeEntry, ProjectRuntimeEntry } from "../types";
import * as _ from "lodash";

export interface JavaRuntimeEntryPanelProps {
  data?: JavaRuntimeEntry[];
  projectRuntimes?: ProjectRuntimeEntry[];
}

interface RuntimeEntry {
  sourceLevel: string;
  runtimePath: string;
  projects: string[];
}

export const JavaRuntimeEntryPanel = (props: JavaRuntimeEntryPanelProps | undefined) => {
  const isLoading = _.isEmpty(props && props.data);

  if (isLoading) {
    return (<div className="spinner-border spinner-border-sm" role="status">
      <span className="sr-only">Loading...</span>
    </div>);
  }

  const entryData = (props && props.data) || [];
  const projectRuntimes = (props && props.projectRuntimes) || [];
  const runtimes: RuntimeEntry[] = [];
  for (const entry of projectRuntimes) {
    const runtime = runtimes.find(r => r.sourceLevel === entry.sourceLevel);
    if (runtime) {
      runtime.projects.push(entry.name);
    } else {
      runtimes.push({
        sourceLevel: entry.sourceLevel,
        runtimePath: entry.runtimePath,
        projects: [entry.name]
      });
    }
  }

  const entries = entryData.map((entry, index) => {
    return (
      <tr key={index}>
        <th scope="row">{index + 1}</th>
        <td>
          {entry.fspath}
        </td>
        <td>
          {entry.majorVersion}
        </td>
      </tr>
    );
  });

  return (
    <div className="table-responsive">
      <table className="table table-borderless table-hover table-sm mb-0">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Path</th>
            <th scope="col">Version</th>
          </tr>
        </thead>
        <tbody>
          {entries}
        </tbody>
      </table>
    </div>
  );
};
