import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as util from 'util';
import { join } from 'path';
import { RegoErrors, getEmptyRegoErrorCollection } from './regoError';

export default class Linter {
  private codeDocument: vscode.TextDocument;

  constructor(document: vscode.TextDocument) {
    this.codeDocument = document;
  }

  public async lint(): Promise<RegoErrors> {
    const errors = await this.runRegoLint();
    const lintingErrors: RegoErrors = this.parseErrors(errors);

    return lintingErrors;
  }

  private parseErrors(errorJson: string): RegoErrors {
    if (!errorJson) {
      return getEmptyRegoErrorCollection();
    }

    let regoErrors: RegoErrors = JSON.parse(errorJson)

    regoErrors.errors.forEach((error) => {
      let isWindows: Boolean = this.codeDocument.fileName.indexOf(':') > 0
      if (error.location && isWindows) {
        let driveLetter: string = this.codeDocument.fileName[0]
        error.location.file = join(`${driveLetter}:\\`, error.location.file)
      }
    })

    return regoErrors;
  }

  private async runRegoLint(): Promise<string> {
    const currentFile = this.codeDocument.uri.fsPath;
    const exec = util.promisify(cp.exec);

    let cmd: string
    if (vscode.workspace.workspaceFolders) {
      let workspaceFolder: vscode.WorkspaceFolder = vscode.workspace.workspaceFolders[0]
      let opaCheckFolder: string = join(workspaceFolder.uri.fsPath, "policy")

      cmd = `opa check "${opaCheckFolder}" --format json`
    } else {
      cmd = `opa check "${currentFile}" --format json`
    }

    let lintResults: string = "";
    await exec(cmd).catch((error: any) => lintResults = error.stderr);

    return lintResults;
  }
}