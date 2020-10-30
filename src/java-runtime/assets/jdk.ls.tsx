import { JavaRuntimeEntry } from "../types";
import * as React from "react";
import { udpateJavaHome } from "./vscode.api";

export interface ConfigureLSPanelProps {
  jdkEntries: JavaRuntimeEntry[];
  javaDotHome?: string;
  javaHomeError?: any;
}

export class ConfigureLSPanel extends React.Component<ConfigureLSPanelProps, {}> {

  render() {
    const { jdkEntries, javaHomeError, javaDotHome } = this.props;
    if (!jdkEntries) {
      return (
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      );
    }

    const jdks = jdkEntries.map(e => ({
      name: e.path,
      fspath: e.path,
      majorVersion: e.version,
      version: e.version,
    }));

    return (
      <div className="col">
        <h3 className="font-weight-light">Java Language Server</h3>
        <p>
          Language Server requires JDK 11+ to launch.
      </p>
        <div className="row sourcelevel">
          <div className="col">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="ls">JDK for Language Server:</label>
              </div>
              <select className="custom-select" id="ls" onChange={change} defaultValue={javaDotHome}>
                { javaHomeError && <option key="placeholder" hidden disabled selected>-- Select --</option> }
                {jdks.filter(jdk => jdk.majorVersion >= 11).map(jdk => (
                  <option key={jdk.fspath} value={jdk.fspath}>{jdk.fspath}</option>
                ))}
              </select>
            </div>
            {javaHomeError !== undefined && (<div className="text-danger">{javaHomeError}</div>)}
          </div>
        </div>
        <p>
          Note that, this JDK doesn't have to be the one your project is run with.
        {/* Todo: below link doesn't work */}
        For example, you can still configure to run your projects with Java 8.
      </p>
      </div>
    );
  }
}

function change(event) {
  const { value } = event.target;
  udpateJavaHome(value);
}
