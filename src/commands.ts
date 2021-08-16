import * as vscode from "vscode";
import { loadConfig } from "./config";
import { Instruction } from "./instruction";
import { TestSpec } from "./parser/spec";
import { getOrCreateTerminal } from "./terminal/getOrCreateTerminal";
import { getPaths } from "./utils/getPaths";

export function runTestsInFile(editor: vscode.TextEditor, instruction = Instruction.Watch): void {
  // Document and Workspace.
  const document = editor.document;
  const workspace = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspace) {
    return;
  }

  // Terminal.
  const terminal = getOrCreateTerminal(workspace);
  terminal.show(true);

  // Paths
  const paths = getPaths(document);

  // Run command
  runBazel(workspace, instruction, paths.bazelPackagePath, `--runTestsByPath=${paths.pathToFile}`);
}

export function runTestFromCodeLens(editor: vscode.TextEditor, spec: TestSpec, instruction: Instruction): void {
  // Workspace.
  const document = spec.document;
  const workspace = vscode.workspace.getWorkspaceFolder(editor.document.uri);
  if (!workspace) {
    return;
  }

  // Paths
  const paths = getPaths(document);

  // Run command
  runBazel(workspace, instruction, paths.bazelPackagePath, `--testNamePattern='${spec.specFilter}'`);
}

function runBazel(workspace: vscode.WorkspaceFolder, instruction: Instruction, bazelPackagePath: string, testFilter: string) {
  // Terminal.
  const terminal = getOrCreateTerminal(workspace);
  terminal.show(true);

  // Build command
  const config = loadConfig();
  const bazelCommand = instruction === Instruction.Watch ? "ibazel run" : instruction === Instruction.UpdateSnapshots ? "bazel run" : "bazel test";
  const bazelTarget = instruction === Instruction.UpdateSnapshots ? "jest_test.updateSnap" : "jest_test";
  const bazelOptions = config.extraArgs;
  const consoleCommand = `${bazelCommand} ${bazelOptions} ${bazelPackagePath}:${bazelTarget} --test_arg="${testFilter}"`;

  terminal.sendText(consoleCommand, true);
}
