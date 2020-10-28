import * as path from "path";

export function sourceLevelDisplayName(ver: string | number) {
  if (!ver) {
    return "";
  }

  if (ver === "1.5" || ver === 5) {
    return "J2SE-1.5";
  }

  return `JavaSE-${ver}`;
}

export function sourceLevelMajorVersion(level: string): number {
  if (!level) {
    return 0;
  }

  let version = level.replace(/^.*-/, ""); // remove "JaveSE-"
  // Ignore "1." prefix for legacy Java versions
  if (version.startsWith("1.")) {
    version = version.substring(2);
  }

  // look into the interesting bits now
  const regexp = /\d+/g;
  const match = regexp.exec(version);
  let javaVersion = 0;
  if (match) {
    javaVersion = parseInt(match[0], 10);
  }
  return javaVersion;
}

export function isSamePath(a: string, b: string) {
  return path.relative(a, b) === "";
}
