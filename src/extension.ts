import * as vscode from 'vscode';
import { generateViewFile } from "./generate-view-file";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "laravel-utils" is now active!');

  let disposable = vscode.commands.registerCommand('laravel-utils.createViewFile', () => {
    generateViewFile();
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
