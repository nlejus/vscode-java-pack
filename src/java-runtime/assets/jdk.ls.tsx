import { JavaRuntimeEntry } from "../types";
import { isSamePath } from "../utils/misc";
import * as React from "react";

export interface ConfigureLSPanelProps {
  jdkEntries: JavaRuntimeEntry[];
}

export const ConfigureLSPanel = (props: ConfigureLSPanelProps) => {
  const jdks = props.jdkEntries.map(e => ({
    name: e.path,
    fspath: e.path,
    majorVersion: e.version,
    version: e.version,
    usedByLS: e.usedByLS
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
            <select className="custom-select" id="ls">
              {jdks.filter(jdk => jdk.majorVersion >= 11).map(jdk => (
                jdk.usedByLS ?
                  <option selected value={jdk.fspath}>{jdk.fspath}</option>
                  : <option value={jdk.fspath}>{jdk.fspath}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <p>
        Note that, this JDK doesn't have to be the one your project is run with.
        {/* Todo: below link doesn't work */}
        For example, you can still <a href="#configure-runtime-tab" >configure</a> to run your projects with Java 8.
      </p>
    </div>
  );
};
