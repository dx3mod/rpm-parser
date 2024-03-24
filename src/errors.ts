/** Base class for all errors related to RPM package parsing. */
export class RpmParsingError extends Error {}

/** Error not matching expected magic byte sequence. */
export class BadMagicCodeError extends Error {
  /**
   * @param expected Expected number or sequence of bytes.
   */
  constructor(public readonly expected: number | number[]) {
    super(`Expected ${expected}!`);
  }
}

/** Error parsing lead section of RPM file. */
export class InvalidLeadError extends RpmParsingError {}

export { AccessToUnparsedEntryError } from "./package_view.ts";
