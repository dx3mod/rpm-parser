import { BadMagicCodeError } from "../mod.ts";
import ByteBuf from "./bytebuf.ts";
import { RpmParsingError } from "./errors.ts";

/** Header Index */
export type Index = {
  numberOfEntries: number;
  sectionSize: number;
};

const HEADER_INDEX_MAGIC_CODE = [0x8e, 0xad, 0xe8, 0x01];

export function parseIndex(bytebuf: ByteBuf): Index {
  if (!bytebuf.matchBytes(HEADER_INDEX_MAGIC_CODE)) {
    throw new BadMagicCodeError(
      "Invalid Header Index magic code!",
      HEADER_INDEX_MAGIC_CODE,
    );
  }

  bytebuf.skip(4); // reserved

  const numberOfEntries = bytebuf.readUint32();
  const sectionSize = bytebuf.readUint32();

  return { numberOfEntries, sectionSize };
}

export type Entry = {
  tag: number;
  tagType: number;
  offset: number;
  count: number;
  data: unknown;
};

export interface ParseEntriesOptions {
  selectByTag?: (tag: number) => boolean;
}

export function parseEntries(
  bytebuf: ByteBuf,
  index: Index,
  options?: ParseEntriesOptions,
) {
  const entries = new Map();

  const restSize = bytebuf.byteOffset + index.numberOfEntries * 16;

  for (let i = 0; i < index.numberOfEntries; i++) {
    const tag = bytebuf.readUint32();

    if (options?.selectByTag && !options.selectByTag(tag)) {
      continue;
    }

    const tagType = bytebuf.readInt32();
    const offset = bytebuf.readInt32();
    const count = bytebuf.readInt32();

    const data = parseEntryData(
      bytebuf.duplicate(restSize + offset),
      count,
      tagType,
    );

    entries.set(tag, { tag, tagType, offset, count, data });
  }

  bytebuf.byteOffset = restSize + index.sectionSize;

  return entries;
}

export enum EntryDataType {
  NULL = 0,
  CHAR = 1,
  INT8 = 2,
  INT16 = 3,
  INT32 = 4,
  INT64 = 5,
  STRING = 6,
  BINARY = 7,
  STRING_ARRAY = 8,
  I18N_STRING = 9,
}

function parseEntryData(bytebuf: ByteBuf, count: number, tagType: number) {
  const readOneOrArray = <T>(reader: () => T) =>
    count === 1 ? reader() : bytebuf.readArray(reader, count);

  switch (tagType) {
    case EntryDataType.NULL:
      return null;
    case EntryDataType.CHAR:
      return String.fromCharCode(bytebuf.readUint8());
    case EntryDataType.INT8:
      return readOneOrArray(() => bytebuf.readInt8());
    case EntryDataType.INT16:
      return readOneOrArray(() => bytebuf.readInt16());
    case EntryDataType.INT32:
      return readOneOrArray(() => bytebuf.readInt32());
    case EntryDataType.INT64:
      throw new RpmParsingError("Not supported EntryDataType.INT64!");
    case EntryDataType.BINARY:
      return bytebuf.readBuffer(count);
    case EntryDataType.STRING:
      return bytebuf.readNullTerminatedString();
    case EntryDataType.I18N_STRING: // TODO: I18N_STRING not implement now
    case EntryDataType.STRING_ARRAY:
      return bytebuf.readArray(
        () => bytebuf.readNullTerminatedString(),
        count,
      );
  }

  throw new RpmParsingError(`Unknown tagType ${tagType}!`);
}

export function calculatePadding(sectionSize: number): number {
  return (8 - (sectionSize % 8)) % 8;
}
