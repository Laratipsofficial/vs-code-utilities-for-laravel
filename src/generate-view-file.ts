import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

const parseViewFileName = (lineText: string, watchText: string, cursorIndex: number): string => {
  let startPosition = lineText.indexOf(watchText);
  let textAfterViewMake = lineText.substring(startPosition + watchText.length);

  let viewFileText = textAfterViewMake.startsWith("'")
    ? textAfterViewMake.split("'")[1]
    : textAfterViewMake.split('"')[1];

  let viewNameStartIndex = lineText.indexOf(viewFileText);
  let viewNameEndIndex = viewNameStartIndex + viewFileText.length;

  if (cursorIndex < viewNameStartIndex || cursorIndex > viewNameEndIndex) {
    vscode.window.showErrorMessage("Please add the cursor inside the view name");

    return "";
  }

  return viewFileText.trim();
};

const openTheFile = (filePath: string) => {
  const openPath = vscode.Uri.file(filePath);

  vscode.workspace.openTextDocument(openPath).then(doc => {
    vscode.window.showTextDocument(doc);
  });
};

const createViewFile = (viewFileText: string): void => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    return;
  }

  const projectRootPath = workspaceFolders[0].uri.fsPath;
  const viewsRootPath = path.join(projectRootPath, "resources/views");

  // replace all . with / and append .blade.php in the end
  const finalFilePath = path.join(viewsRootPath, viewFileText.replace(/\./g, "/") + ".blade.php");

  const viewFileTextArray = viewFileText.split(".");
  const finalFolderPath = path.join(viewsRootPath, viewFileTextArray.slice(0, viewFileTextArray.length - 1).join("/"));

  if (fs.existsSync(finalFilePath)) {
    vscode.window.showErrorMessage("The view file already exists");

    return;
  }

  // the file does not exists below

  if (!fs.existsSync(finalFolderPath)) {
    fs.mkdirSync(finalFolderPath, {
      recursive: true,
    });
  }

  fs.createWriteStream(finalFilePath).close();

  openTheFile(finalFilePath);

  vscode.window.showInformationMessage(`View file created successfully.`);
};

export const generateViewFile = (): void => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const currentCursorPosition = editor.selection.active;
  // const selection = editor.selection;
  // const text = editor.document.getText(selection); // code to get the text form the selection

  // get the text of the whole line where the cursor is present.
  const lineText = editor.document.lineAt(currentCursorPosition.line).text;

  // get the index of the point where cursor is situated. it will count the index from the top of the file.
  const cursorIndexFromBeginning = editor.document.offsetAt(currentCursorPosition);

  // get the index of the start of the line where cursor is situated.
  const cursorLineStartIndex = editor.document.offsetAt(currentCursorPosition.with(currentCursorPosition.line, 0));

  // get the actual index of the cursor on the line where the cursor is situated
  // we are assuming the index to be 0 in the start of the line where cursor is situated
  const cursorIndex = cursorIndexFromBeginning - cursorLineStartIndex;

  let viewFileText = "";

  if (lineText.includes("View::make(")) {
    viewFileText = parseViewFileName(lineText, "View::make(", cursorIndex);
  } else if (lineText.includes("view(")) {
    viewFileText = parseViewFileName(lineText, "view(", cursorIndex);
  }

  if (viewFileText === "") {
    vscode.window.showErrorMessage("Please add the cursor inside the view name");

    return;
  }

  createViewFile(viewFileText);
};
