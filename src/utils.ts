export function isRpmPackage(buffer: Buffer): boolean {
  return (
    buffer.readUint32BE(0) === 0xedabeedb && buffer.readUint16BE(4) === 0x0300
  );
}
