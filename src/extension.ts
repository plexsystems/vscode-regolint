import * as vscode from 'vscode';
import Linter from './linter';
import { RegoError } from './regoError'
import { URI } from 'vscode-uri'

async function doLint(codeDocument: vscode.TextDocument, collection: vscode.DiagnosticCollection): Promise<void> {
  const linter = new Linter(codeDocument);
  const errors: RegoError[] = await linter.lint();

  collection.clear();

  errors.forEach(function (error) {
    let fileUri: vscode.Uri = URI.file(error.file)
    let fileDiagnostic: vscode.Diagnostic = new vscode.Diagnostic(codeDocument.lineAt(1).range, error.reason, vscode.DiagnosticSeverity.Error);
    let fileDiagnostics: vscode.Diagnostic[] = [fileDiagnostic]

    collection.set(fileUri, fileDiagnostics)
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
