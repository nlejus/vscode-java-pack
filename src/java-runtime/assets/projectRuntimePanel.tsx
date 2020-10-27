import * as React from "react";
import { InvisibleProjectsRuntimePanel } from "./sourcelevel.invisible";
import { SourceLevelRuntimePanel } from "./sourcelevel.managed";

export const ProjectRuntimePanel = (props) => {
  const invisibleProjectEntry = {
    sourcelevel: "JavaSE-1.8",
    runtimePath: "fakepath",
    projects: [
      { name: "invisible_1", rootPath: "path1" },
      { name: "invisible_2", rootPath: "path2" },
    ]
  };

  const sourceLevelEntries = [{
    sourcelevel: "JavaSE-1.8",
    runtimePath: "fakepath",
    projects: [
      { name: "Maven-1.8", rootPath: "path1" },
      { name: "Gradle-1.8", rootPath: "path2" },
    ]
  },
  {
    sourcelevel: "JavaSE-11",
    runtimePath: "fakepath",
    projects: [
      { name: "Maven-11", rootPath: "path1" },
      { name: "Gradle-11", rootPath: "path2" },
    ]
  }];

  const jdks = [
    {
      name: "AdoptOpenJDK-11.0.10",
      path: "jdk-path-1",
      version: "full-v",
      majorVersion: 11
    },
    {
      name: "OpenJDK-1.8.0_265",
      path: "jdk-path-1",
      version: "full-v",
      majorVersion: 8
    }
  ];
  return (
    <div className="col">
      <div className="row mb-3">
        <div className="col">
          <h3 className="font-weight-light">Invisible Projects</h3>
          <p>
            Java Language Server requires version 11 or later to launch. Detected JDKs are listed below:
            </p>
          <InvisibleProjectsRuntimePanel entry={invisibleProjectEntry} />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <h3 className="font-weight-light">Managed Projects</h3>
          <p>
            Java Language Server requires version 11 or later to launch. Detected JDKs are listed below:
            </p>
          {sourceLevelEntries.map(entry => (<SourceLevelRuntimePanel entry={entry} jdks={jdks} />))}
        </div>
      </div>
    </div>
  );
}


// export const ProjectRuntimePanel = (props) => {
//   const invisibleProjects = []; // TODO
//   return (
//     <div className="col">
//       <div className="row mb-3">
//         <div className="col">
//           <h3 className="font-weight-light">Invisible Projects</h3>
//           <p>
//             Java Language Server requires version 11 or later to launch. Detected JDKs are listed below:
//           </p>
//           <div className="card">
//             <div className="card-body">
//               <JavaRuntimeEntryPanel data={props.jdkEntries} projectRuntimes={props.projectRuntimes} />
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="row mb-3">
//         <div className="col">
//           <h3 className="font-weight-light">Install</h3>
//           <p>
//             To download and install JDK, follow the links below:
//           </p>
//           <div className="card">
//             <div className="card-body">
//               <JdkInstallationPanel data={props.jdkData} onRequestJdk={props.onRequestJdk} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
