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
          <h3 className="font-weight-light">Maven/Gradle Projects</h3>
          <p>
            <b>Source level</b> of your project is managed by Maven/Gradle.
          </p>
          <p>pom.xml:</p>
          <blockquote>
            <code>
              <span>&lt;properties&gt;</span><br />
              <span>&nbsp;&nbsp;&lt;maven.compiler.source&gt;1.8&lt;/maven.compiler.source&gt;</span><br />
              <span>&nbsp;&nbsp;&lt;maven.compiler.target&gt;1.8&lt;/maven.compiler.target&gt;</span><br />
              <span>&lt;/properties&gt;</span>
            </code>
          </blockquote>

          <p>build.gradle:</p>
          <blockquote>
            <code>
              <span>sourceCompatibility = 1.8</span><br />
              <span>targetCompatibility = 1.8</span><br />
            </code>
          </blockquote>

          <p>You can specify corresponding JDK for each source level</p>
          {sourceLevelEntries.map(entry => (<SourceLevelRuntimePanel entry={entry} jdks={jdks} />))}
        </div>

        <div className="col">
          <h3 className="font-weight-light">Projects without build tools</h3>
          <p>
            TBD: Descriptions
            </p>
          <InvisibleProjectsRuntimePanel entry={invisibleProjectEntry} />
        </div>
      </div>
    </div>
  );
}
