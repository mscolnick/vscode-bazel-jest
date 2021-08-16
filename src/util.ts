// copied from https://github.com/firsttris/vscode-jest-runner/blob/master/src/util.ts
export function escapeRegExp(s: string): string {
  const escapedString = s.replace(/[.*+?^${}<>()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  return escapedString.replace(/\\\(\\\.\\\*\\\?\\\)/g, "(.*?)"); // should revert the escaping of match all regex patterns.
}

export function findFullTestName(selectedLine: number, children: any[]): string {
  if (!children) {
    return "";
  }
  for (const element of children) {
    if (element.type === "describe" && selectedLine === element.start.line) {
      return resolveTestNameStringInterpolation(element.name);
    }
    if (element.type !== "describe" && selectedLine >= element.start.line && selectedLine <= element.end.line) {
      return resolveTestNameStringInterpolation(element.name);
    }
  }
  for (const element of children) {
    const result = findFullTestName(selectedLine, element.children);
    if (result) {
      return resolveTestNameStringInterpolation(element.name) + " " + result;
    }
  }
  return "";
}

function resolveTestNameStringInterpolation(s: string): string {
  const variableRegex = /(\${?[A-Za-z0-9_]+}?|%[psdifjo#%])/gi;
  const matchAny = "(.*?)";
  return s.replace(variableRegex, matchAny);
}
