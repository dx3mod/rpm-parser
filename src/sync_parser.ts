import {
  calculatePadding,
  parseEntries,
  ParseEntriesOptions,
  parseIndex,
} from "./header";

import ByteBuf from "./bytebuf";
import { parseLead, ParseLeadOptions } from "./lead";
import { RawPackage } from "./raw_package";

/** Parse fixed buffer as `RawPackage`.
 * Primarily for internal use!
 */
export function parseBuffer(
  buffer: ArrayBuffer,
  options?: {
    leadOptions?: ParseLeadOptions;
    headerOptions?: ParseEntriesOptions;
    capturePayload?: true;
  },
): RawPackage {
  const bytebuf = new ByteBuf({ buffer, offset: 0 });

  const lead = parseLead(bytebuf, options?.leadOptions);

  const signatureIndex = parseIndex(bytebuf);
  const signatureEntries = parseEntries(bytebuf, signatureIndex);
  bytebuf.skip(calculatePadding(signatureIndex.sectionSize));

  const headerIndex = parseIndex(bytebuf);
  const headerEntries = parseEntries(
    bytebuf,
    headerIndex,
    options?.headerOptions,
  );

  const payload = options?.capturePayload
    ? // FIXME: add assert to bytebuf.unreadBytes == payload size
      bytebuf.buffer.slice(bytebuf.byteOffset)
    : undefined;

  return {
    lead,
    signature: { index: signatureIndex, entries: signatureEntries },
    header: { index: headerIndex, entries: headerEntries },
    payload,
  };
}
