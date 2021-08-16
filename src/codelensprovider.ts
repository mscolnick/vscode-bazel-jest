import { parse, ParsedNode } from "jest-editor-support";
import * as vscode from "vscode";
import { CodeLens, Range } from "vscode";
import { Instruction } from "./instruction";
import { escapeRegExp, findFullTestName } from "./util";
import { TestSpec } from "./utils/spec";

function getTestsBlocks(parsedNode: ParsedNode, parseResults: ParsedNode[]): CodeLens[] {
  const codeLens: CodeLens[] = [];

  parsedNode.children?.forEach((subNode) => {
    codeLens.push(...getTestsBlocks(subNode, parseResults));
  });

  const range = new Range(parsedNode.start.line - 1, parsedNode.start.column, parsedNode.end.line - 1, parsedNode.end.column);

  if (parsedNode.type === "expect") {
    return [];
  }

  const fullTestName = escapeRegExp(findFullTestName(parsedNode.start.line, parseResults));

  codeLens.push(
    new CodeLens(range, {
      title: "Run Test",
      command: "bazel-jest.runTest",
      arguments: [new TestSpec(fullTestName, range), Instruction.Test],
    }),
    new CodeLens(range, {
      title: "Watch Test",
      command: "bazel-jest.runTest",
      arguments: [new TestSpec(fullTestName, range), Instruction.Watch],
    }),
    new CodeLens(range, {
      title: "Update Snapshots",
      command: "bazel-jest.runTest",
      arguments: [new TestSpec(fullTestName, range), Instruction.UpdateSnapshots],
    }),
  );

  return codeLens;
}

export class CodeLensProvider implements vscode.CodeLensProvider {
  public selector: vscode.DocumentSelector = {
    pattern: "**/*.{spec,test}.{ts,tsx,js,jsx}",
  };

  public async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
    try {
      const text = document.getText();
      const parseResults = parse(document.fileName, text).root.children ?? [];
      const codeLens: CodeLens[] = [];
      parseResults.forEach((parseResult) => codeLens.push(...getTestsBlocks(parseResult, parseResults)));
      return codeLens;
    } catch (e) {
      // Ignore error and keep showing Run/Debug buttons at same position
      console.error("bazel-jest cannot parse code-lens", e);
      return [];
    }
  }
}
