import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as util from 'util';
import { join } from 'path';
import { RegoError, parseRegoError } from './regoError';

export default class Linter {
  private codeDocument: vscode.TextDocument;

  constructor(document: vscode.TextDocument) {
    this.codeDocument = document;
  }

  public async lint(): Promise<RegoError[]> {
    const errors = await this.runRegoLint();
    if (!errors) {
      return [];
    }

    const lintingErrors: RegoError[] = this.parseErrors(errors);
    return lintingErrors;
  }

  private parseErrors(errorStr: string): RegoError[] {
    let errors = errorStr.split('\n') || [];

    var result = errors.reduce((errors: RegoError[], currentError: string) => {
      const parsedError = parseRegoError(currentError);
      if (!parsedError.reason) {
        return errors;
      }

      return errors.concat(parsedError);
    }, []);

    return result;
  }

  private async runRegoLint(): Promise<string> {
    const currentFile = this.codeDocument.uri.fsPath;
    const exec = util.promisify(cp.exec);

    let cmd: string
    vscode.workspace.workspaceFolders
    if (vscode.workspace.workspaceFolders) {
      let workspaceFolder: vscode.WorkspaceFolder = vscode.workspace.workspaceFolders[0]
      let opaCheckFolder: string = join(workspaceFolder.uri.fsPath, "policy")

      cmd = `opa test "${opaCheckFolder}"`
    } else {
      cmd = `opa test "${currentFile}"`
    }

    let lintResults: string = "";
    await exec(cmd).catch((error: any) => lintResults = error.stderr);

    return lintResults;
  }
}
