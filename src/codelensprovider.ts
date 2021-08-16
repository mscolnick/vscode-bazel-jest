import * as vscode from "vscode";
import { Instruction } from "./instruction";
import { Parser } from "./parser/parser";

export class CodeLensProvider implements vscode.CodeLensProvider {
  constructor(private readonly languageServer: Parser) {}

  public get selector(): vscode.DocumentSelector {
    return [
      {
        language: "typescript",
        scheme: "file",
        pattern: "**/*.{spec,test}.{ts,tsx}",
      },
      {
        language: "typescriptreact",
        scheme: "file",
        pattern: "**/*.{spec,test}.{ts,tsx}",
      },
    ];
  }

  public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
    const testSpecs = await this.languageServer.getTestSpecs(document.getText(), document, token);
    console.log("# testSpecs", testSpecs.length);

    const lenses = testSpecs.flatMap((spec) => {
      if (spec.specFilter) {
        return [
          new vscode.CodeLens(spec.range, { title: "Run Test", command: "bazel-jest.runTest", arguments: [spec, Instruction.Test] }),
          new vscode.CodeLens(spec.range, { title: "Watch Test", command: "bazel-jest.runTest", arguments: [spec, Instruction.Watch] }),
          new vscode.CodeLens(spec.range, { title: "Update Snapshots", command: "bazel-jest.runTest", arguments: [spec, Instruction.UpdateSnapshots] }),
        ];
      } else {
        return [
          new vscode.CodeLens(spec.range, { title: "Run All Tests", command: "bazel-jest.runTest", arguments: [spec, Instruction.Test] }),
          new vscode.CodeLens(spec.range, { title: "Watch All Tests", command: "bazel-jest.runTest", arguments: [spec, Instruction.Watch] }),
          new vscode.CodeLens(spec.range, { title: "Update Snapshots", command: "bazel-jest.runTest", arguments: [spec, Instruction.UpdateSnapshots] }),
        ];
      }
    });

    return lenses;
  }
}
