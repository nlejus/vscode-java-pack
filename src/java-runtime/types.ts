// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

export interface JavaRuntimeEntry {
  name: string;
  path: string | undefined;
  type: string;
  version?: number;
  actionUri?: string;
  isValid?: boolean;
  hint?: string;
}

export interface JdkData {
  os: string;
  arch: string;
  name: string;
  size: string;
  downloadLink: string;
}

export interface ProjectRuntimeEntry {
  name: string;
  rootPath: string;
  runtimePath: string;
  sourceLevel: string;
}

export interface RuntimeEntry {
  sourceLevel: string;
  runtimePath: string;
  projects?: { name: string, rootPath: string }[];
}

export interface JDKEntry {
  name: string;
  fspath: string;
  version: string;
  majorVersion: number;
}
