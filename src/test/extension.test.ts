import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import {
  replacePlaceholder,
  formatString,
  removeRootIndentation,
  getActiveEditor,
  copySelection,
  copyFile,
  getConfiguration,
  formatTemplate,
} from "../extension";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("replacePlaceholder should replace placeholders correctly", () => {
    const result = replacePlaceholder("Hello, {name}!", "name", "World");
    assert.strictEqual(result, "Hello, World!");
  });

  test("formatString should format string with replacements", () => {
    const template = "File: {filePath}, Line: {startLine}";
    const replacements = {
      filePath: "src/index.ts",
      startLine: "10",
    };
    const result = formatString(template, replacements);
    assert.strictEqual(result, "File: src/index.ts, Line: 10");
  });

  test("removeRootIndentation should remove leading spaces correctly", () => {
    const text = "    line1\n    line2\n      line3";
    const result = removeRootIndentation(text);
    assert.strictEqual(result, "line1\nline2\n  line3");
  });

  test("getActiveEditor should return active editor", () => {
    const mockEditor = {
      document: {
        uri: { fsPath: "src/index.ts" },
        getText: () => "sample text",
      },
      selection: new vscode.Selection(
        new vscode.Position(0, 0),
        new vscode.Position(1, 1)
      ),
    };

    sinon.stub(vscode.window, "activeTextEditor").value(mockEditor);

    const editor = getActiveEditor();
    if (editor) {
      assert.strictEqual(editor.document.uri.fsPath, "src/index.ts");
    } else {
      assert.fail("No active editor");
    }

    sinon.restore();
  });

  test("getConfiguration should return undefined for non-existent key", () => {
    const result = getConfiguration("nonExistentKey");
    assert.strictEqual(result, undefined);
  });

  test("formatTemplate should return undefined for non-existent template key", () => {
    const result = formatTemplate("nonExistentTemplate", {});
    assert.strictEqual(result, undefined);
  });

  test("copySelection should not throw an error when called", () => {
    try {
      copySelection();
      assert.ok(true);
    } catch (error) {
      assert.fail("copySelection threw an error");
    }
  });

  test("copyFile should not throw an error when called", () => {
    try {
      copyFile();
      assert.ok(true);
    } catch (error) {
      assert.fail("copyFile threw an error");
    }
  });
});
