import { parseLead, ParseLeadOptions, RawPackage } from "./raw.mod.ts";
import { parseEntries, ParseEntriesOptions, parseIndex } from "./header.ts";

import { ByteBuf } from "./bytebuf.ts";

export function parseBuffer(buffer: ArrayBuffer, options?: {
  leadOptions?: ParseLeadOptions;
  headerOptions?: ParseEntriesOptions;
  capturePayload?: true;
}): RawPackage {
  const bytebuf = new ByteBuf({ buffer, offset: 0 });

  const lead = parseLead(bytebuf, options?.leadOptions);

  const signatureIndex = parseIndex(bytebuf);
  const signatureEntries = parseEntries(bytebuf, signatureIndex);

  const headerIndex = parseIndex(bytebuf);
  const headerEntries = parseEntries(
    bytebuf,
    headerIndex,
    options?.headerOptions,
  );

  const payload = options?.capturePayload
    // FIXME: add assert to bytebuf.unreadBytes == payload size
    ? bytebuf.buffer.slice(bytebuf.byteOffset)
    : undefined;

  return {
    lead,
    signature: { index: signatureIndex, entries: signatureEntries },
    header: { index: headerIndex, entries: headerEntries },
    payload,
  };
}
