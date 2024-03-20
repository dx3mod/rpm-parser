import { ByteBuf } from "./bytebuf.ts";
import { RpmParsingError } from "./errors.ts";
import { assertBytes } from "./utils.ts";

/** Header Index */
export type Index = {
  numberOfEntries: number;
  sectionSize: number;
};

export function parseIndex(bytebuf: ByteBuf): Index {
  assertBytes(bytebuf, 0x8e, 0xad, 0xe8, 0x01);

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
  data?: unknown;
};

export function parseEntry(bytebuf: ByteBuf): Entry {
  const tag = bytebuf.readInt32();
  const tagType = bytebuf.readInt32();
  const offset = bytebuf.readInt32();
  const count = bytebuf.readInt32();

  return { tag, tagType, offset, count };
}

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
    const entry = parseEntry(bytebuf);

    if (options?.selectByTag && !options.selectByTag(entry.tag)) {
      continue;
    }

    entry.data = parseEntryData(
      bytebuf.duplicate(restSize + entry.offset),
      entry,
    );

    entries.set(entry.tag, entry);
  }

  const padding = (8 - (index.sectionSize % 8)) % 8;
  bytebuf.byteOffset = restSize + index.sectionSize + padding;

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

function parseEntryData(bytebuf: ByteBuf, entry: Entry) {
  const readOneOrArray = <T>(reader: () => T) =>
    entry.count === 1 ? reader() : bytebuf.readArray(reader, entry.count);

  switch (entry.tagType) {
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
      return bytebuf.readBuffer(entry.count);
    case EntryDataType.STRING:
      return bytebuf.readNullTerminatedString();
    case EntryDataType.I18N_STRING:
    case EntryDataType.STRING_ARRAY:
      return bytebuf.readArray(
        () => bytebuf.readNullTerminatedString(),
        entry.count,
      );
  }

  throw new RpmParsingError(`Unknown tagType ${entry.tagType}!`);
}
