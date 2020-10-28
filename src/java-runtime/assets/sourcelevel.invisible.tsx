import * as React from "react";
import * as _ from "lodash";
import { JDKEntry, RuntimeEntry } from "../types";
import { sourceLevelDisplayName } from "../utils/misc";

interface Props {
  jdks: JDKEntry[];
  defaultSourceLevel: string;
}

export class InvisibleProjectsRuntimePanel extends React.Component<Props, {}> {
  render() {
    const { jdks, defaultSourceLevel } = this.props;
    console.log(this.props);
    const possibleLevels = _.uniq(jdks.map(jdk => jdk.majorVersion.toString()));
    return (
      <div className="row">
        <div className="col">
          <div className="row sourcelevel">
            <div className="col">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <label className="input-group-text" htmlFor="invisible">Default SDK:</label>
                </div>
                <select className="custom-select" id="invisible">
                  {possibleLevels.map(lvl => (
                    lvl === defaultSourceLevel ?
                      <option selected value={lvl}>{sourceLevelDisplayName(lvl)}</option>
                      : <option value={lvl}>{sourceLevelDisplayName(lvl)}</option>
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
