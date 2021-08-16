import * as path from "path";
import * as ts from "typescript";
import { CancellationToken, Position, Range, TextDocument } from "vscode";
import { TestSpec } from "./spec";
import { walk } from "./walk";

export class Parser {
  public async getTestSpecs(src: string, document: TextDocument, token: CancellationToken): Promise<TestSpec[]> {
    const relativePath = path.relative(process.cwd(), document.uri.path);
    const srcFile = ts.createSourceFile("tmp.ts", src, ts.ScriptTarget.Latest, true);
    const specs: TestSpec[] = [];

    walk(srcFile, (node) => {
      if (token.isCancellationRequested) {
        return true;
      }

      if (!ts.isCallExpression(node)) {
        return false;
      }

      const children = node.getChildren();
      const identifier = children.find((child) => {
        return child.kind === ts.SyntaxKind.Identifier;
      });

      if (!identifier) {
        return false;
      }

      // We only care about functions named describe/it/test
      const callName = identifier.getText();
      if (!(callName === "describe" || callName === "it" || callName === "test")) {
        return false;
      }

      let describeName: string | undefined;
      const syntaxList = children.find((child) => {
        return child.kind === ts.SyntaxKind.SyntaxList;
      });

      if (!syntaxList) {
        return false;
      }

      const describeNameNode = syntaxList.getChildAt(0);
      if (describeNameNode.kind === ts.SyntaxKind.StringLiteral) {
        describeName = describeNameNode.getText();
      }
      if (describeName) {
        describeName = describeName.substring(1, describeName.length - 1).trim();
      }

      const { line: startLine, character: startCharacter } = srcFile.getLineAndCharacterOfPosition(node.getStart());
      const startPosition = new Position(startLine, startCharacter);
      const { line: endLine, character: endCharacter } = srcFile.getLineAndCharacterOfPosition(node.getEnd());
      const endPosition = new Position(endLine, endCharacter);
      specs.push(new TestSpec(relativePath, describeName, new Range(startPosition, endPosition), document));

      return false;
    });

    if (token.isCancellationRequested) {
      return [];
    }

    return specs;
  }
}
