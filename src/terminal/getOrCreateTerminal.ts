import * as vscode from "vscode";

export function getOrCreateTerminal(workspace: vscode.WorkspaceFolder): vscode.Terminal {
  const terminal = vscode.window.terminals.find((terminal) => terminal.name === "Bazel Jest");
  if (terminal) {
    return terminal;
  }

  return vscode.window.createTerminal({ name: "Bazel Jest", cwd: workspace.uri.path, shellPath: "/bin/bash" });
}
