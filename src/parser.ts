import { RpmPackageView } from "./package_view";
import { DependencyTag, InfoTag, OtherTag } from "./tags";
import { StreamParser } from "./stream_parser";
import { parseBuffer } from "./sync_parser";
import { ParseLeadOptions } from "./lead";

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
  options?: ParseRpmPackageOptions
): RpmPackageView {
  return new RpmPackageView(
    parseBuffer(uint8Array.buffer, expandOptions(options))
  );
}

/** Parse readable stream as RPM package.
 * @throws {RpmParsingError} and derivatives.
 */
export async function parseRpmPackage(
  stream: ReadableStream,
  options?: ParseRpmPackageOptions
): Promise<RpmPackageView> {
  const { leadOptions, capturePayload, headerOptions } = expandOptions(options);

  const reader = stream
    .pipeThrough(
      new StreamParser(
        leadOptions,
        headerOptions,
        capturePayload
      ).toWebTransformer()
    )
    .getReader();

  return new RpmPackageView((await reader.read()).value!);
}

function expandOptions(options?: ParseRpmPackageOptions) {
  const setTags = new Set(options?.select?.tags);

  return {
    capturePayload: options?.capture?.payload,
    leadOptions: {
      withoutName: options?.capture?.filename ? undefined : true,
      rawName: options?.capture?.filename === "raw" ? true : undefined,
    } as ParseLeadOptions,
    headerOptions: {
      selectByTag: options?.select?.tags
        ? // Is `Set.has` fast enough?
          (tag: number) => setTags.has(tag)
        : undefined,
    },
  };
}
