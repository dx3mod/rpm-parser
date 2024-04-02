import * as header from "./header.ts";
import { Lead, parseLead, ParseLeadOptions } from "./lead.ts";
import ByteBuf from "./bytebuf.ts";
import { RawPackage, RawPackageHeader } from "./raw_package.ts";
import { calculatePadding } from "./header.ts";

/** Create a `TransformStream` object to parse input bytes into `RawPackage`.
 * Primarily for internal use!
 */
export function StreamParser(
  options?: {
    leadOptions?: ParseLeadOptions;
    headerOptions?: header.ParseEntriesOptions;
    capturePayload?: true;
  },
): TransformStream<Uint8Array, RawPackage> {
  const bytebuf = new ByteBuf({ offset: 0, buffer: new ArrayBuffer(0) });

  let lead: Lead;
  let payload: ArrayBuffer | undefined = undefined;

  let signatureIndex: header.Index | undefined = undefined;
  let signatureHeader: RawPackageHeader;

  let headerIndex: header.Index | undefined = undefined;
  let mainHeader: RawPackageHeader;

  let state = ParsingState.Lead;

  return new TransformStream({
    transform(chunk, controller) {
      bytebuf.extend(chunk);

      while (state !== ParsingState.Complete) {
        switch (state) {
          case ParsingState.Lead: {
            if (bytebuf.unreadBytes < 96) return;

            lead = parseLead(bytebuf, options?.leadOptions);
            state = ParsingState.Signature;

            break;
          }
          case ParsingState.Signature: {
            if (signatureIndex === undefined) {
              if (bytebuf.unreadBytes < 16) return;
              signatureIndex = header.parseIndex(bytebuf);
            }

            const padding = calculatePadding(signatureIndex.sectionSize);

            if (
              bytebuf.unreadBytes <
                (signatureIndex.numberOfEntries * 16 +
                  signatureIndex.sectionSize + padding)
            ) return;

            const entries = header.parseEntries(bytebuf, signatureIndex);
            bytebuf.skip(padding);

            signatureHeader = { index: signatureIndex, entries };
            state = ParsingState.Header;

            break;
          }
          case ParsingState.Header: {
            if (headerIndex === undefined) {
              if (bytebuf.unreadBytes < 16) return;
              headerIndex = header.parseIndex(bytebuf);
            }

            if (
              bytebuf.unreadBytes <
                (headerIndex.numberOfEntries * 16 +
                  headerIndex.sectionSize)
            ) return;

            const entries = header.parseEntries(
              bytebuf,
              headerIndex,
              options?.headerOptions,
            );

            mainHeader = { index: headerIndex, entries };
            state = options?.capturePayload
              ? ParsingState.Payload
              : ParsingState.Complete;

            break;
          }
          // TODO: optimize payload reading from stream
          case ParsingState.Payload: {
            // payloadSize = (payload + header) - header
            const payloadSize = signatureHeader.entries.get(1000)
              ?.data as number -
              (16 + mainHeader.index.numberOfEntries * 16 +
                mainHeader.index.sectionSize +
                (8 - (mainHeader.index.sectionSize % 8)) % 8);

            if (bytebuf.unreadBytes < payloadSize) return;

            payload = bytebuf.readBuffer(payloadSize);
            state = ParsingState.Complete;

            // bytebuf.unreadBytes must be 0?
            break;
          }
        }
      }

      controller.enqueue({
        lead,
        signature: signatureHeader,
        header: mainHeader,
        payload,
      });
    },
  });
}

enum ParsingState {
  Lead,
  Signature,
  Header,
  Payload,
  Complete,
}
