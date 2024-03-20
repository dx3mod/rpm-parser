import { ByteBuf } from "./bytebuf.ts";
import { BadMagicCode } from "./errors.ts";

export function assertBytes(bytebuf: ByteBuf, ...bytes: number[]) {
  if (!bytebuf.assertBytes(bytes)) {
    throw new BadMagicCode(bytes);
  }
}
