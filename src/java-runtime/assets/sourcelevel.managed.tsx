import * as path from "path";
import * as React from "react";
import { JDKEntry, ProjectRuntimeEntry, RuntimeEntry } from "../types";
import { isSamePath, sourceLevelDisplayName, sourceLevelMajorVersion } from "../utils/misc";

interface Props {
  entry: RuntimeEntry;
  jdks: JDKEntry[];
}

export class SourceLevelRuntimePanel extends React.Component<Props, {}> {

  render() {
    const { sourceLevel, runtimePath } = this.props.entry;
    return (
      <div className="row">
        <div className="col">
          <div className="row sourcelevel">
            <div className="col">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <label className="input-group-text" htmlFor="invisible">{sourceLevelDisplayName(sourceLevel)}:</label>
                </div>
                <select className="custom-select" name="jdk-for" id={sourceLevel}>
                  {/* TODO: sometimes runtimePath is undefined, e.g. LS use 11, project use 14 but without configuring java.configuarion.runtimes,
                  maybe an empty option should be provided. */}
                  {this.props.jdks.filter(jdk => jdk.majorVersion >= sourceLevelMajorVersion(sourceLevel)).map(jdk => (
                    isSamePath(jdk.fspath, runtimePath)?
                      <option selected value={jdk.fspath}>{jdk.name}</option>
                      : <option value={jdk.fspath}>{jdk.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
