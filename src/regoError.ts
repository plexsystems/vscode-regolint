export interface RegoErrors {
  errors: RegoError[]
}

export interface RegoError {
  message: string;
  code: string;
  location: ErrorLocation;
}

export interface ErrorLocation {
  file: string;
  row: number;
  col: number;
}

export function getEmptyRegoErrorCollection(): RegoErrors {
  const emptyLocation: ErrorLocation = {
    file: "",
    row: 0,
    col: 0
  }

  const emptyRegoError: RegoError = {
    message: "",
    code: "",
    location: emptyLocation
  };

  const emptyRegoErrors: RegoErrors = {
    errors: [emptyRegoError]
  }

  return emptyRegoErrors
}