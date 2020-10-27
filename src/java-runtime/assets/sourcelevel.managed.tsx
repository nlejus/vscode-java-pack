import { link } from "fs";
import * as React from "react";
import { JDKEntry, RuntimeEntry } from "../types";

interface Props {
  entry: RuntimeEntry;
  jdks: JDKEntry[]
}

export class SourceLevelRuntimePanel extends React.Component<Props, {}> {

  render() {
    const { projects, sourcelevel, runtimePath } = this.props.entry;
    return (
      <div className="row">
        <div className="col">
          <div className="row sourcelevel">
            <div className="col">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <label className="input-group-text" htmlFor="invisible">{sourcelevel}:</label>
                </div>
                <select className="custom-select" name="jdk-for" id={sourcelevel}>
                  {this.props.jdks.map(jdk => (
                    <option value={jdk.path}>{jdk.name}</option>
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
