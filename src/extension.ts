import * as vscode from 'vscode';
import Linter, { LinterError } from './linter';

async function doLint(codeDocument: vscode.TextDocument, collection: vscode.DiagnosticCollection): Promise<void> {
  const linter = new Linter(codeDocument);
  const errors: LinterError[] = await linter.lint();

  const diagnostics = errors.map(error => {
    return new vscode.Diagnostic(error.range, error.message.reason, vscode.DiagnosticSeverity.Error);
  });

  collection.clear();
  collection.set(codeDocument.uri, diagnostics);
}

export function activate(context: vscode.ExtensionContext) {
  const commandId = 'extension.regolint';
  const diagnosticCollection = vscode.languages.createDiagnosticCollection(commandId);

  let events = vscode.commands.registerCommand(commandId, () => {
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      if(document.languageId !== 'rego') {
        return;
      }

      doLint(document, diagnosticCollection);
    });
  });

  vscode.commands.executeCommand(commandId);
  context.subscriptions.push(events);
}