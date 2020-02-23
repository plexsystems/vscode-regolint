import * as assert from 'assert';
import { RegoError, parseRegoError, getEmptyRegoError } from '../src/regoError';

describe('parseRegoError', () => {
  it('should return empty regoerror when there is no error', () => {
    const expected: RegoError = getEmptyRegoError();
    const actual = parseRegoError("");

    assert.deepEqual(actual, expected);
  });

  describe('should return the correct values', () => {
    it('when parsing a single error', () => {
      const expected: RegoError = {
        file: "",
        line: 10,
        type: "rego_parse_error",
        reason: "no match found"
      };

      const error: string = "1 error occurred: rego_file.rego:10: rego_parse_error: no match found";
      const actual = parseRegoError(error);

      assert.deepEqual(actual, expected);
    });

    it('when parsing multiple errors', () => {
      const expected: RegoError = {
        file: "",
        line: 10,
        type: "rego_parse_error",
        reason: "no match found"
      };

      const error: string = "rego_file.rego:10: rego_parse_error: no match found";
      const actual = parseRegoError(error);

      assert.deepEqual(actual, expected);
    });
  });
});
