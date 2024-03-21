import { ByteBuf } from "./bytebuf.ts";
import { BadMagicCodeError } from "./errors.ts";

export function assertBytes(bytebuf: ByteBuf, ...bytes: number[]) {
  if (!bytebuf.assertBytes(bytes)) {
    throw new BadMagicCodeError(bytes);
  }
}
