export interface RegoError {
  line: number;
  type: string;
  reason: string;
}

export function parseRegoError(error: string): RegoError {
  if (!error) {
    return getEmptyRegoError();
  }

  if (error.includes("errors occurred")) {
    return getEmptyRegoError();
  }

  if (error.startsWith("\t")) {
    return getEmptyRegoError();
  }

  var errorLine: number
  var errorReason: string
  var errorType: string

  let errorSegments: string[] = error.split(": ")

  if (error.includes("1 error occurred")) {
    errorType = errorSegments[2]
    errorReason = errorSegments[3]
  } else {
    errorType = errorSegments[1]
    errorReason = errorSegments[2]
  }

  errorLine = parseInt(error.split(".rego:")[1], 10);

  const regoError: RegoError = {
    line: errorLine,
    type: errorType,
    reason: errorReason
  };

  return regoError;
}

export function getEmptyRegoError(): RegoError {
  const emptyRegoError: RegoError = {
    line: 0,
    type: "",
    reason: ""
  };

  return emptyRegoError;
}