/** Base class for all errors related to RPM package parsing. */
export class RpmParsingError extends Error {}

/** Error not matching expected magic byte sequence. */
export class BadMagicCodeError extends Error {
  /**
   * @param expected Expected number or sequence of bytes.
   */
  constructor(
    message: string,
    public readonly expected: number[],
  ) {
    super(message);
  }
}

export { AccessToUnparsedEntryError } from "./package_view";
