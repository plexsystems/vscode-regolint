import * as vscode from 'vscode';
import Linter from './linter';
import { RegoErrors } from './regoError'

async function doLint(codeDocument: vscode.TextDocument, collection: vscode.DiagnosticCollection): Promise<void> {
  const linter = new Linter(codeDocument);
  let result: RegoErrors = await linter.lint();

  collection.clear();

  result.errors.forEach((error) => {
    let range: vscode.Range = new vscode.Range(error.location.row - 1, 0, error.location.row, 1)
    let diagnostic: vscode.Diagnostic = new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Error)
    let fileLocation: vscode.Uri = vscode.Uri.file(error.location.file)

    collection.set(fileLocation, [diagnostic])
  });
}

export function activate(context: vscode.ExtensionContext) {
  const commandId = 'extension.regolint';
  const diagnosticCollection = vscode.languages.createDiagnosticCollection(commandId);

  let events = vscode.commands.registerCommand(commandId, () => {
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      if (document.languageId !== 'rego') {
        return;
      }

      doLint(document, diagnosticCollection);
    });
  });

  vscode.commands.executeCommand(commandId);
  context.subscriptions.push(events);
}
