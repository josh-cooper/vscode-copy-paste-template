import * as vscode from "vscode";

type ReplacementKey =
  | "filePath"
  | "range"
  | "text"
  | "startLine"
  | "startChar"
  | "endLine"
  | "endChar";

export function getConfiguration(key: string): string | undefined {
  return vscode.workspace
    .getConfiguration("copy-paste-template")
    .get<string>(key);
}

export function replacePlaceholder(
  template: string,
  placeholder: string,
  value: string
): string {
  // Ensure escaped placeholders are not replaced
  const regex = new RegExp(`(?<!\\\\){${placeholder}}`, "g");
  return template.replace(regex, value);
}

export function formatString(
  template: string,
  replacements: { [key in ReplacementKey]?: string }
): string {
  return Object.entries(replacements).reduce((formatted, [key, value]) => {
    return replacePlaceholder(formatted, key, value || "");
  }, template);
}

export function formatTemplate(
  key: string,
  replacements: { [key in ReplacementKey]?: string }
): string | undefined {
  const template = getConfiguration(key);
  if (!template) {
    vscode.window.showInformationMessage(`No template found for ${key}`);
    return undefined;
  }
  return formatString(template, replacements);
}

export function removeRootIndentation(text: string): string {
  const lines = text.split("\n");
  const rootIndentation = lines.reduce((min, line) => {
    const leadingWhitespace = line.match(/^(\s*)/)?.[0].length || 0;
    return line.trim() ? Math.min(min, leadingWhitespace) : min;
  }, Infinity);
  return lines.map((line) => line.slice(rootIndentation)).join("\n");
}

export function getActiveEditor(): vscode.TextEditor | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No editor is active");
    return undefined;
  }
  return editor;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "copy-paste-template" is now active!');
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "copy-paste-template.copySelection",
      copySelection
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("copy-paste-template.copyFile", copyFile)
  );
}

export function copySelection() {
  const editor = getActiveEditor();
  if (!editor) return;

  const { document, selection } = editor;
  const text = document.getText(selection);
  const undentedText = getConfiguration("removeRootIndentation")
    ? removeRootIndentation(text)
    : text;

  const replacements: { [key in ReplacementKey]?: string } = {
    filePath: vscode.workspace.asRelativePath(document.uri.fsPath),
    range: formatTemplate("rangeTemplate", {
      startLine: (selection.start.line + 1).toString(),
      startChar: (selection.start.character + 1).toString(),
      endLine: (selection.end.line + 1).toString(),
      endChar: (selection.end.character + 1).toString(),
    }),
    text: undentedText,
  };

  const formattedText = formatTemplate("template", replacements);
  if (formattedText) vscode.env.clipboard.writeText(formattedText);
}

export function copyFile() {
  const editor = getActiveEditor();
  if (!editor) return;

  const text = editor.document.getText();
  const replacements: { [key in ReplacementKey]?: string } = {
    filePath: vscode.workspace.asRelativePath(editor.document.uri.fsPath),
    text: text,
    range: "",
  };

  const formattedText = formatTemplate("template", replacements);
  if (formattedText) vscode.env.clipboard.writeText(formattedText);
}

export function deactivate() {}
