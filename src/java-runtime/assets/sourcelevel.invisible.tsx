import * as React from "react";
import { RuntimeEntry } from "../types";

interface Props {
  entry: RuntimeEntry;
}

export class InvisibleProjectsRuntimePanel extends React.Component<Props, {}> {
  render() {
    const { projects } = this.props.entry;
    const possibleLevels = [
      "JavaSE-1.8",
      "JavaSE-11",
      "JavaSE-14",
    ];
    return (
      <div className="row">
        <div className="col">
          <div className="row sourcelevel">
            <div className="col">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <label className="input-group-text" htmlFor="invisible">Source Level:</label>
                </div>
                <select className="custom-select" id="invisible">
                  {possibleLevels.map(lvl => (
                    <option value={lvl}>{lvl}</option>
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
