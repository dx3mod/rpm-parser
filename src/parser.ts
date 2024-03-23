import { RpmPackageView } from "./package_view.ts";
import { InfoTag } from "./tag.ts";

import { StreamParser } from "./stream_parser.ts";
import { parseBuffer } from "./sync_parser.ts";

interface ParseRpmPackageOptions {
  select?: {
    tags?: (InfoTag | number)[];
  };

  capture?: {
    /** **Don't use it!** */
    payload?: true;
    leadName?: true;
  };
}

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

function expandOptions(options?: ParseRpmPackageOptions): any {
  return {
    capturePayload: options?.capture?.payload,
    leadOptions: {
      withoutName: options?.capture?.payload ? undefined : true,
      rawName: true,
    },
    headerOptions: {
      // TODO: optimize select predicate
      selectByTag: options?.select?.tags
        ? ((tag: number) => options.select!.tags!.includes(tag))
        : undefined,
    },
  };
}
