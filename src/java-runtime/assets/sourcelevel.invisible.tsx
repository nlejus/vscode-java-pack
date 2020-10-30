import * as React from "react";
import * as _ from "lodash";
import { JDKEntry, RuntimeEntry } from "../types";
import { setDefaultRuntime } from "./vscode.api";

interface Props {
  jdks: JDKEntry[];
  defaultJDK: string;
}

export class InvisibleProjectsRuntimePanel extends React.Component<Props, {}> {
  render() {
    const { jdks, defaultJDK } = this.props;
    console.log(this.props);
    const change = this.change;
    return (
      <div className="row">
        <div className="col">
          <div className="row sourcelevel">
            <div className="col">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <label className="input-group-text" htmlFor="invisible">Default JDK:</label>
                </div>
                <select className="custom-select" id="invisible" defaultValue={defaultJDK} onChange={change}>
                  <option key="placeholder" hidden disabled>-- Select --</option>
                  {jdks.map(jdk => (
                    <option key={jdk.name} value={jdk.fspath} >{jdk.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  change = (event) => {
    const { value } = event.target;
    const targetJdk = this.props.jdks.find(jdk => jdk.fspath === value);
    setDefaultRuntime(targetJdk.fspath, targetJdk.majorVersion);
  }
}

// function change(event) {
//   const { value } = event.target;
//   setDefaultRuntime(value);
// }
