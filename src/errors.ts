export class RpmParsingError extends Error {}

export class BadMagicCode extends Error {
  constructor(public readonly expected: number | number[]) {
    super(`Expected ${expected}!`);
  }
}

export class InvalidLead extends RpmParsingError {}

export { AccessToUnparsedEntryError } from "./package_view.ts";
