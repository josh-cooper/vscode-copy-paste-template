import * as vscode from "vscode";

type TextReplacementKeys = "filePath" | "range" | "text";
type RangeReplacementKeys = "startLine" | "startChar" | "endLine" | "endChar";
type ReplacementKeys = TextReplacementKeys | RangeReplacementKeys;

function getConfiguration(key: string): string | undefined {
  return vscode.workspace
    .getConfiguration("copy-paste-template")
    .get<string>(key);
}

function replacePlaceholder(
  template: string,
  placeholder: string,
  value: string
): string {
  const regex = new RegExp(`(?<!\\\\){${placeholder}}`, "g");
  return template.replace(regex, value);
}

function formatString(
  template: string,
  replacements: { [key in ReplacementKeys]?: string }
): string {
  let formattedText = template;
  Object.entries(replacements).forEach(([key, value]) => {
    formattedText = replacePlaceholder(formattedText, key, value || "");
  });
  return formattedText.replace(/{/g, "{");
}

function formatTemplate(
  key: string,
  replacements: { [key in ReplacementKeys]?: string }
): string | undefined {
  const template = getConfiguration(key);
  if (!template) {
    vscode.window.showInformationMessage(`No template found for ${key}`);
    return undefined;
  }
  return formatString(template, replacements);
}

function removeRootIndentation(text: string): string {
  const lines = text.split("\n");
  const rootIndentation = lines.reduce((min, line) => {
    const leadingWhitespace = line.match(/^(\s*)/)?.[0].length || 0;
    return line.trim() ? Math.min(min, leadingWhitespace) : min;
  }, Infinity);
  return lines.map((line) => line.slice(rootIndentation)).join("\n");
}

function getActiveEditor(): vscode.TextEditor | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No editor is active");
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

function copySelection() {
  const editor = getActiveEditor();
  if (!editor) return;

  const { document, selection } = editor;
  const text = document.getText(selection);
  const undentedText = getConfiguration("removeRootIndentation")
    ? removeRootIndentation(text)
    : text;

  const replacements: { [key in ReplacementKeys]?: string } = {
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

function copyFile() {
  const editor = getActiveEditor();
  if (!editor) return;

  const text = editor.document.getText();
  const replacements: { [key in ReplacementKeys]?: string } = {
    filePath: vscode.workspace.asRelativePath(editor.document.uri.fsPath),
    text: text,
    range: "",
  };

  const formattedText = formatTemplate("template", replacements);
  if (formattedText) vscode.env.clipboard.writeText(formattedText);
}

export function deactivate() {}
