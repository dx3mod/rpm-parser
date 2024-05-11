import ByteBuf from "./bytebuf";
import { BadMagicCodeError, RpmParsingError } from "./errors";

export type Lead = {
  version: { major: number; minor: number };
  type: 0 | 1;
  arch: number;
  name?: ArrayBuffer | string;
  os: number;
  signatureType: number;
};

export interface ParseLeadOptions {
  /** Parse name field as ArrayBuffer. */
  rawName?: true;
  /** Don't parse name. */
  withoutName?: true;
}

const LEAD_MAGIC_CODE = [0xed, 0xab, 0xee, 0xdb];

export function parseLead(bytebuf: ByteBuf, options?: ParseLeadOptions): Lead {
  if (!bytebuf.matchBytes(LEAD_MAGIC_CODE)) {
    throw new BadMagicCodeError("Invalid Lead magic code!", LEAD_MAGIC_CODE);
  }

  const major = bytebuf.readUint8();
  const minor = bytebuf.readUint8();

  const type = bytebuf.readUint16();
  if (type !== 0 && type !== 1) {
    throw new RpmParsingError(
      `Invalid 'type' field value. Expect 0 or 1, but read ${type}!`,
    );
  }

  const arch = bytebuf.readUint16();

  let name;
  if (options?.withoutName) {
    name = undefined;
    bytebuf.skip(66);
  } else if (options?.rawName) {
    name = bytebuf.readBuffer(66);
  } else {
    name = bytebuf.readSizedString(66);
  }

  const os = bytebuf.readUint16();
  const signatureType = bytebuf.readUint16();

  bytebuf.skip(16); // reserved

  return {
    version: { major, minor },
    type,
    arch,
    name,
    os,
    signatureType,
  };
}
