import * as header from "./header.ts";
import { Lead } from "./lead.ts";

export type RawPackageHeader = {
  index: header.Index;
  entries: Map<number, header.Entry>;
};

/** "As is" representation of a parsed RPM package. */
export type RawPackage = {
  lead: Lead;
  signature: RawPackageHeader;
  header: RawPackageHeader;
  payload?: ArrayBuffer;
};
