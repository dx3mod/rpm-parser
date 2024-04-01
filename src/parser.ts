import { RpmPackageView } from "./package_view.ts";
import { DependencyTag, InfoTag, OtherTag } from "./tag.ts";

import { StreamParser } from "./stream_parser.ts";
import { parseBuffer } from "./sync_parser.ts";

/** RPM package parsing options. */
export interface ParseRpmPackageOptions {
  /** Select header tags to be parsed. */
  select?: {
    tags?: (InfoTag | DependencyTag | OtherTag | number)[];
  };

  /** Capture values not parsed by default. */
  capture?: {
    payload?: true;
    filename?: true | "raw";
  };
}

/** Parse fixed buffer as RPM package.
 * @throws {RpmParsingError} and derivatives.
 */
export function parseRpmPackageSync(
  uint8Array: Uint8Array,
  options?: ParseRpmPackageOptions,
): RpmPackageView {
  return new RpmPackageView(
    parseBuffer(
      uint8Array.buffer,
      expandOptions(options),
    ),
  );
}

/** Parse readable stream as RPM package.
 * @throws {RpmParsingError} and derivatives.
 */
export async function parseRpmPackage(
  stream: ReadableStream<Uint8Array>,
  options?: ParseRpmPackageOptions,
): Promise<RpmPackageView> {
  const reader = stream.pipeThrough(
    StreamParser(expandOptions(options)),
  ).getReader();

  const rawPackage = await reader.read();
  return new RpmPackageView(rawPackage.value!);
}

function expandOptions(options?: ParseRpmPackageOptions): object {
  const setTags = new Set(options?.select?.tags);

  return {
    capturePayload: options?.capture?.payload,
    leadOptions: {
      withoutName: options?.capture?.filename ? undefined : true,
      rawName: options?.capture?.filename === "raw" ? true : undefined,
    },
    headerOptions: {
      selectByTag: options?.select?.tags
        // Is `Set.has` fast enough?
        ? ((tag: number) => setTags.has(tag))
        : undefined,
    },
  };
}
