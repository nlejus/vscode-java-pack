// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as React from "react";
import { JavaRuntimeEntryPanel } from "./jdk.entries";
import { JdkInstallationPanel, JdkRquestHandler } from "./jdk.installation";
import { JavaRuntimeEntry, JdkData, ProjectRuntimeEntry } from "../types";

export interface JdkAcquisitionPanelProps {
  jdkEntries: JavaRuntimeEntry[];
  projectRuntimes: ProjectRuntimeEntry[];
  jdkData: JdkData;
  onRequestJdk: JdkRquestHandler;
}

export const JdkAcquisitionPanel = (props: JdkAcquisitionPanelProps) => {
  return (
    <div className="col">
      <div className="row mb-3">
        <div className="col">
          <h3 className="font-weight-light">Detected JDKs</h3>
          <p>
            Java Language Server requires version 11 or later to launch. Detected JDKs are listed below:
          </p>
          <div className="card">
            <div className="card-body">
              <JavaRuntimeEntryPanel data={props.jdkEntries} projectRuntimes={props.projectRuntimes} />
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <h3 className="font-weight-light">Install</h3>
          <p>
            To download and install JDK, follow the links below:
          </p>
          <div className="card">
            <div className="card-body">
              <JdkInstallationPanel data={props.jdkData} onRequestJdk={props.onRequestJdk} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
