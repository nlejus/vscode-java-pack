import * as _ from "lodash";
import * as path from "path";
import * as React from "react";
import { JavaRuntimeEntry, ProjectRuntimeEntry } from "../types";
import { InvisibleProjectsRuntimePanel } from "./sourcelevel.invisible";
import { SourceLevelRuntimePanel } from "./sourcelevel.managed";

export const ProjectRuntimePanel = (props: {
  jdkEntries: JavaRuntimeEntry[];
  projectRuntimes: ProjectRuntimeEntry[];
}) => {
  const { jdkEntries, projectRuntimes } = props;
  console.log(props);
  const invisibleProjectEntry = {
    sourcelevel: "JavaSE-1.8",
    runtimePath: "fakepath",
    projects: [
      { name: "invisible_1", rootPath: "path1" },
      { name: "invisible_2", rootPath: "path2" },
    ]
  };

  const sourceLevelEntries = projectRuntimes && _.uniqBy(projectRuntimes.map(p => ({ sourceLevel: p.sourceLevel, runtimePath: p.runtimePath })), "sourceLevel");
  console.log(sourceLevelEntries);
  // const sourceLevelEntries = [{
  //   sourcelevel: "JavaSE-1.8",
  //   runtimePath: "fakepath",
  //   projects: [
  //     { name: "Maven-1.8", rootPath: "path1" },
  //     { name: "Gradle-1.8", rootPath: "path2" },
  //   ]
  // },
  // {
  //   sourcelevel: "JavaSE-11",
  //   runtimePath: "fakepath",
  //   projects: [
  //     { name: "Maven-11", rootPath: "path1" },
  //     { name: "Gradle-11", rootPath: "path2" },
  //   ]
  // }];

  const jdks = jdkEntries.map(e => ({
    name: path.basename(e.path),
    fspath: e.path,
    majorVersion: e.version,
    version: e.version
  }));

  const invisibleProject = projectRuntimes.find(p => p.rootPath.endsWith("jdt.ls-java-project") || p.rootPath.endsWith("jdt.ls-java-project/"));
  const defaultSourceLevel = invisibleProject && invisibleProject.sourceLevel;
  return (
    <div className="col">
      <div className="row mb-3">
        <div className="col">
          <h3 className="font-weight-light">Maven/Gradle Projects</h3>
          <p>
            You can specify Java version for Maven/Gradle projects. For example,
          </p>
          <p>In <code>pom.xml</code> of a Maven project:</p>
          <blockquote>
            <code>
              <span>&lt;properties&gt;</span><br />
              <span>&nbsp;&nbsp;&lt;maven.compiler.source&gt;1.8&lt;/maven.compiler.source&gt;</span><br />
              <span>&nbsp;&nbsp;&lt;maven.compiler.target&gt;1.8&lt;/maven.compiler.target&gt;</span><br />
              <span>&lt;/properties&gt;</span>
            </code>
          </blockquote>

          <p>In <code>build.gradle</code> of a Gradle project:</p>
          <blockquote>
            <code>
              <span>sourceCompatibility = 1.8</span><br />
              <span>targetCompatibility = 1.8</span><br />
            </code>
          </blockquote>

          <p>Below, you can specify which JDK to use for corresponding Java versions.</p>
          {sourceLevelEntries.map(entry => (<SourceLevelRuntimePanel entry={entry} jdks={jdks} />))}
        </div>

        <div className="col">
          <h3 className="font-weight-light">Projects without build tools</h3>
          <p>
            For .java files not managed by build tools like Maven/Gradle, a default SDK is used.
          </p>
          <InvisibleProjectsRuntimePanel jdks={jdks} defaultSourceLevel={defaultSourceLevel} />
        </div>
      </div>
    </div>
  );
}
