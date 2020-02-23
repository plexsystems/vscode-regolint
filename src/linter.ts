import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as util from 'util';
import { RegoError, parseRegoError } from './regoError';

export interface LinterError {
  message: RegoError;
  range: vscode.Range;
}

export default class Linter {
  private codeDocument: vscode.TextDocument;

  constructor(document: vscode.TextDocument) {
    this.codeDocument = document;
  }

  public async lint(): Promise<LinterError[]> {
    const errors = await this.runRegoLint();
    if (!errors) {
      return [];
    }

    const lintingErrors: LinterError[] = this.parseErrors(errors);
    return lintingErrors;
  }

  private parseErrors(errorStr: string): LinterError[] {
    let errors = errorStr.split('\n') || [];

    var result = errors.reduce((errors: LinterError[], currentError: string) => {
      const parsedError = parseRegoError(currentError);
      if (!parsedError.reason) {
        return errors;
      }

      const linterError: LinterError = this.createLinterError(parsedError);
      return errors.concat(linterError);
    }, []);

    return result;
  }

  private async runRegoLint(): Promise<string> {
    const currentFile = this.codeDocument.uri.fsPath;
    const exec = util.promisify(cp.exec);
    const cmd = `opa test "${currentFile}"`;

    let lintResults: string = "";
    await exec(cmd).catch((error: any) => lintResults = error.stderr);

    return lintResults;
  }

  private createLinterError(error: RegoError): LinterError {
    const linterError: LinterError = {
      message: error,
      range: this.getErrorRange(error)
    };

    return linterError;
  }

  private getErrorRange(error: RegoError): vscode.Range {
    return this.codeDocument.lineAt(error.line - 1).range;
  }
}