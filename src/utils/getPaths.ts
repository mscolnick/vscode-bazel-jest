import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

interface Paths {
  bazelWorkspaceDir: string;
  bazelPackageBuildDir: string;
  bazelPackagePath: string;
  pathToFile: string;
  fileName: string;
}

export function getPaths(document: vscode.TextDocument): Paths {
  const bazelWorkspaceDir = findFolderWithFileMatching(path.dirname(document.uri.path), "WORKSPACE");
  const bazelPackageBuildDir = findFolderWithFileMatching(path.dirname(document.uri.path), "BUILD");
  const bazelPackagePath = "//" + path.relative(bazelWorkspaceDir, bazelPackageBuildDir);
  const pathToFile = path.relative(bazelWorkspaceDir, document.uri.path);

  return {
    bazelWorkspaceDir: bazelWorkspaceDir,
    bazelPackageBuildDir: bazelPackageBuildDir,
    bazelPackagePath: bazelPackagePath,
    pathToFile,
    fileName: path.basename(document.fileName),
  };
}

function findFolderWithFileMatching(currentDirectory: string, file: "BUILD" | "WORKSPACE"): string {
  try {
    if (fs.existsSync(path.join(currentDirectory, file))) {
      return currentDirectory;
    }
    return findFolderWithFileMatching(path.dirname(currentDirectory), file);
  } catch (err) {
    console.error(err);
    return "";
  }
}
