export class RpmParsingError extends Error {}

export class BadMagicCodeError extends Error {
  constructor(public readonly expected: number | number[]) {
    super(`Expected ${expected}!`);
  }
}

export class InvalidLeadError extends RpmParsingError {}

export { AccessToUnparsedEntryError } from "./package_view.ts";
