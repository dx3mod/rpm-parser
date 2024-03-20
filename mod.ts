export * as lead from "./src/lead.ts";
export * as header from "./src/header.ts";

export * from "./src/errors.ts";

import { ByteBuf } from "./src/bytebuf.ts";

export function toByteBuf(buffer: Uint8Array): ByteBuf {
  return new ByteBuf({
    offset: 0,
    buffer: buffer.buffer,
  });
}
