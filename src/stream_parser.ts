import * as header from "./header";
import { Lead, parseLead, ParseLeadOptions } from "./lead";
import ByteBuf from "./bytebuf";
import { RawPackage, RawPackageHeader } from "./raw_package";
import { calculatePadding } from "./header";

export class StreamParser {
  private state: ParsingState;
  private bytebuf: ByteBuf;

  public lead?: Lead;

  public signatureIndex?: header.Index;
  public signatureHeader?: RawPackageHeader;

  public headerIndex?: header.Index;
  public mainHeader?: RawPackageHeader;

  public payload?: ArrayBuffer;

  constructor(
    private readonly leadParserOptions?: ParseLeadOptions,
    private readonly headersParserOptions?: header.ParseEntriesOptions,
    private readonly capturePayload?: true,
  ) {
    this.state = ParsingState.Lead;
    this.bytebuf = new ByteBuf({ offset: 0, buffer: new ArrayBuffer(0) });
  }

  read(chunk: Buffer): boolean {
    this.bytebuf.extend(new Uint8Array(chunk));

    while (this.state !== ParsingState.Complete) {
      switch (this.state) {
        case ParsingState.Lead: {
          if (this.bytebuf.unreadBytes < 96) return false;

          this.lead = parseLead(this.bytebuf, this.leadParserOptions);
          this.state = ParsingState.Signature;

          break;
        }
        case ParsingState.Signature: {
          if (this.signatureIndex === undefined) {
            if (this.bytebuf.unreadBytes < 16) return false;
            this.signatureIndex = header.parseIndex(this.bytebuf);
          }

          const padding = calculatePadding(this.signatureIndex.sectionSize);

          if (
            this.bytebuf.unreadBytes <
            this.signatureIndex.numberOfEntries * 16 +
              this.signatureIndex.sectionSize +
              padding
          )
            return false;

          const entries = header.parseEntries(
            this.bytebuf,
            this.signatureIndex,
          );
          this.bytebuf.skip(padding);

          this.signatureHeader = { index: this.signatureIndex, entries };
          this.state = ParsingState.Header;

          break;
        }
        case ParsingState.Header: {
          if (this.headerIndex === undefined) {
            if (this.bytebuf.unreadBytes < 16) return false;
            this.headerIndex = header.parseIndex(this.bytebuf);
          }

          if (
            this.bytebuf.unreadBytes <
            this.headerIndex.numberOfEntries * 16 + this.headerIndex.sectionSize
          )
            return false;

          const entries = header.parseEntries(
            this.bytebuf,
            this.headerIndex,
            this.headersParserOptions,
          );

          this.mainHeader = { index: this.headerIndex, entries };
          this.state = this.capturePayload
            ? ParsingState.Payload
            : ParsingState.Complete;

          break;
        }
        case ParsingState.Payload: {
          // TODO: optimize payload reading from stream

          //payloadSize = (payload + header) - header
          const payloadSize =
            (this.signatureHeader!.entries.get(1000)?.data as number) -
            (16 +
              this.mainHeader!.index.numberOfEntries * 16 +
              this.mainHeader!.index.sectionSize +
              ((8 - (this.mainHeader!.index.sectionSize % 8)) % 8));

          if (this.bytebuf.unreadBytes < payloadSize) return false;

          this.payload = this.bytebuf.readBuffer(payloadSize);
          this.state = ParsingState.Complete;

          // bytebuf.unreadBytes must be 0?
          break;
        }
      }
    }

    return true;
  }

  getRawPackage(): RawPackage {
    return {
      lead: this.lead!,
      signature: this.signatureHeader!,
      header: this.mainHeader!,
      payload: this.payload,
    };
  }

  /** Create a `TransformStream` object to parse input bytes into `RawPackage`. */
  toWebTransformer(): TransformStream<Buffer, RawPackage> {
    const transform = (
      chunk: Buffer,
      controller: TransformStreamDefaultController,
    ) => {
      if (this.read(chunk)) controller.enqueue(this.getRawPackage());
    };

    return new TransformStream({
      transform(chunk, controller) {
        transform(chunk, controller);
      },
    });
  }
}

enum ParsingState {
  Lead,
  Signature,
  Header,
  Payload,
  Complete,
}
