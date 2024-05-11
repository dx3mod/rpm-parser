interface ByteBufOptions {
  offset?: number;
  buffer: ArrayBuffer;
}

/** A wrapper view for the DataView to read bytes. */
export default class ByteBuf {
  private dataView: DataView;
  private textDecoder: TextDecoder;

  public byteOffset: number;

  constructor({ offset, buffer }: ByteBufOptions) {
    this.dataView = new DataView(buffer);
    this.byteOffset = offset || 0;
    this.textDecoder = new TextDecoder();
  }

  get buffer(): ArrayBuffer {
    return this.dataView.buffer;
  }

  duplicate(offset?: number): ByteBuf {
    return new ByteBuf({
      offset: offset || this.byteOffset,
      buffer: this.dataView.buffer,
    });
  }

  /** meh... */
  extend(buffer: Uint8Array) {
    const newBuffer = new Uint8Array(
      buffer.byteLength + this.buffer.byteLength,
    );

    newBuffer.set(new Uint8Array(this.dataView.buffer), 0);
    newBuffer.set(buffer, this.buffer.byteLength);

    this.dataView = new DataView(newBuffer.buffer);
  }

  readUint8(): number {
    return this.dataView.getUint8(this.byteOffset++);
  }

  readInt8(): number {
    return this.dataView.getInt8(this.byteOffset++);
  }

  readUint16(): number {
    const value = this.dataView.getUint16(this.byteOffset);
    this.byteOffset += 2;
    return value;
  }

  readInt16(): number {
    const value = this.dataView.getInt16(this.byteOffset);
    this.byteOffset += 2;
    return value;
  }

  readUint32(): number {
    const value = this.dataView.getUint32(this.byteOffset);
    this.byteOffset += 4;
    return value;
  }

  readInt32(): number {
    const value = this.dataView.getInt32(this.byteOffset);
    this.byteOffset += 4;
    return value;
  }

  /** just skip */
  skip(count: number) {
    this.byteOffset += count;
  }

  readBuffer(length: number): ArrayBuffer {
    const value = this.dataView.buffer.slice(
      this.byteOffset,
      this.byteOffset + length,
    );
    this.byteOffset += length;
    return value;
  }

  readArray<T>(reader: () => T, length: number): T[] {
    const arr = [];
    for (; length > 0; length--) arr.push(reader());
    return arr;
  }

  readSizedString(length: number): string {
    const beginOffset = this.byteOffset;

    for (let i = 0; i < length; i++) {
      if (this.readUint8() === 0) break;
    }

    const stringValue = this.textDecoder.decode(
      this.buffer.slice(beginOffset, this.byteOffset - 1),
    );

    this.byteOffset = beginOffset + length;
    return stringValue;
  }

  readNullTerminatedString(): string {
    const beginOffset = this.byteOffset;

    while (this.readUint8() !== 0);

    return this.textDecoder.decode(
      this.buffer.slice(beginOffset, this.byteOffset - 1),
    );
  }

  matchBytes(bytes: number[]): boolean {
    for (const byte of bytes) {
      if (byte !== this.readUint8()) return false;
    }
    return true;
  }

  get unreadBytes(): number {
    return this.buffer.byteLength - this.byteOffset;
  }
}
