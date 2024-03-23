import { RpmPackageView } from "./package_view.ts";
import { StreamParser } from "./stream_parser.ts";
import { InfoTag } from "./tag.ts";

interface ParseRpmPackageOptions {
  select?: {
    tags?: (InfoTag | number)[];
    /** Reading payload by chunk may be slow at the moment.  */
    payload?: true;
    leadName?: true;
  };
}

export async function parseRpmPackage(
  stream: ReadableStream<Uint8Array>,
  options?: ParseRpmPackageOptions,
): Promise<RpmPackageView> {
  const reader = stream.pipeThrough(StreamParser({
    capturePayload: options?.select?.payload,
    leadOptions: {
      withoutName: options?.select?.leadName ? undefined : true,
      rawName: true,
    },
    headerOptions: {
      // TODO: optimize select predicate
      selectByTag: options?.select?.tags
        ? ((tag) => options.select!.tags!.includes(tag))
        : undefined,
    },
  })).getReader();

  const rawPackage = await reader.read();
  return new RpmPackageView(rawPackage.value!);
}
