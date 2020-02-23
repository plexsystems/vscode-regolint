export interface RegoError {
  file: string;
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

  let errorReason: string
  let errorType: string
  let errorSegments: string[] = error.split(": ")

  if (error.includes("1 error occurred")) {
    errorType = errorSegments[2]
    errorReason = errorSegments[3]
  } else {
    errorType = errorSegments[1]
    errorReason = errorSegments[2]
  }

  let errorFile: string
  let errorLine: number
  let fileErrorSegments: string[] = error.split(".rego:")

  errorFile = fileErrorSegments[0] + ".rego"
  errorLine = parseInt(fileErrorSegments[1], 10)

  const regoError: RegoError = {
    file: errorFile,
    line: errorLine,
    type: errorType,
    reason: errorReason
  };

  return regoError;
}

export function getEmptyRegoError(): RegoError {
  const emptyRegoError: RegoError = {
    file: "",
    line: 0,
    type: "",
    reason: ""
  };

  return emptyRegoError;
}
