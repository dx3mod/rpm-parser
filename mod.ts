export * as lead from "./src/lead.ts";
export * as header from "./src/header.ts";

export { PackageInfoTag } from "./src/tag.ts";

export * as stream_parser from "./src/stream_parser.ts";
export { parseRpmPackage } from "./src/parser.ts";

export * from "./src/errors.ts";
export { AccessToUnparsedEntryError } from "./src/package_view.ts";

import { ByteBuf } from "./src/bytebuf.ts";

export function toByteBuf(buffer: Uint8Array): ByteBuf {
  return new ByteBuf({
    offset: 0,
    buffer: buffer.buffer,
  });
}
