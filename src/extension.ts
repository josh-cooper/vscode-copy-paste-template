import * as vscode from "vscode";

type ReplacementKeys = "filePath" | "startLine" | "endLine" | "text";

function formatText(replacements: { [key in ReplacementKeys]?: string }):
  | string
  | undefined {
  const template = vscode.workspace
    .getConfiguration("copy-paste-template")
    .get("template") as string | undefined;

  if (!template) {
    vscode.window.showInformationMessage("No template found in settings");
    return;
  }

  let formattedText = template;
  Object.keys(replacements).forEach((placeholder) => {
    const regex = new RegExp(`(?<!\\\\)\\{${placeholder}\\}`, "g");
    formattedText = formattedText.replace(
      regex,
      replacements[placeholder as ReplacementKeys] || ""
    );
  });
  return formattedText;
}

function removeRootIndentation(text: string): string {
  const lines = text.split("\n");

  // Find the smallest amount of leading whitespace on any line
  const rootIndentation = lines.reduce((minIndentation, line) => {
    if (line.trim() === "") return minIndentation; // Ignore lines that only contain whitespace
    const match = line.match(/^(\s*)/);
    const leadingWhitespace = match ? match[0].length : 0;
    return Math.min(minIndentation, leadingWhitespace);
  }, Infinity);

  // Remove the root indentation from every line
  const unindentedLines = lines.map((line) => line.slice(rootIndentation));

  return unindentedLines.join("\n");
}

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "copy-paste-template" is now active!'
  );

  let copySelectionCommand = vscode.commands.registerCommand(
    "copy-paste-template.copySelection",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No editor is active");
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);

      const filePath = editor.document.uri.fsPath;
      const relativeFilePath = vscode.workspace.asRelativePath(filePath);

      const startLine = selection.start.line + 1;
      const endLine = selection.end.line + 1;

      const removeRootIndentationSetting = vscode.workspace
        .getConfiguration("copy-paste-template")
        .get("removeRootIndentation");

      const undentedText = removeRootIndentationSetting
        ? removeRootIndentation(text)
        : text;

      const formattedText = formatText({
        filePath: relativeFilePath,
        startLine: startLine.toString(),
        endLine: endLine.toString(),
        text: undentedText,
      });

      if (formattedText) {
        vscode.env.clipboard.writeText(formattedText);
      }
    }
  );

  let copyFileCommand = vscode.commands.registerCommand(
    "copy-paste-template.copyFile",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No editor is active");
        return;
      }

      const text = editor.document.getText();

      const filePath = editor.document.uri.fsPath;
      const relativeFilePath = vscode.workspace.asRelativePath(filePath);

      const formattedText = formatText({
        filePath: relativeFilePath,
        text: text,
      });

      if (formattedText) {
        vscode.env.clipboard.writeText(formattedText);
      }
    }
  );

  context.subscriptions.push(copySelectionCommand, copyFileCommand);
}

export function deactivate() {}
