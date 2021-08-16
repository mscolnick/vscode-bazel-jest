import * as vscode from "vscode";

export interface ExtensionConfig {
  extraArgs: string;
}

export function loadConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration();
  const extraArgs = config.get<string>("bazel-jest.extraArgs");

  return {
    extraArgs: extraArgs ?? "--test_output=errors",
  };
}
