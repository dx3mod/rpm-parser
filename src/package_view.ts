import { RawPackage } from "./raw_package.ts";
import { DependencyTag, InfoTag, OtherTag } from "./tag.ts";

export class AccessToUnparsedEntryError extends Error {
  constructor(public readonly tag: number) {
    super(
      `You are trying to access an entry (tag: ${tag}) that is not parsed and can't be read!`,
    );
  }
}

/** Generic view for any RPM package. */
export class RpmPackageView {
  constructor(
    public readonly raw: RawPackage,
  ) {}

  get name(): string {
    return this.getHeaderEntryData(InfoTag.Name);
  }

  get version(): string {
    return this.getHeaderEntryData(InfoTag.Version);
  }

  get release(): string {
    return this.getHeaderEntryData(InfoTag.Release);
  }

  get summery(): string {
    return this.getHeaderEntryData(InfoTag.Summery)[0];
  }

  get description(): string {
    return this.getHeaderEntryData(InfoTag.Description)[0];
  }

  get vendor(): string {
    return this.getHeaderEntryData(InfoTag.Vendor);
  }

  get license(): string {
    return this.getHeaderEntryData(InfoTag.License);
  }

  get packager(): string {
    return this.getHeaderEntryData(InfoTag.Packager);
  }

  get os(): string {
    return this.getHeaderEntryData(InfoTag.Os);
  }

  get arch(): string {
    return this.getHeaderEntryData(InfoTag.Arch);
  }

  get dependencies(): { name: string; version: string }[] {
    const requireName = this.getHeaderEntryData<string[]>(
      DependencyTag.RequireName,
    );

    const requireVersion = this.getHeaderEntryData<string[]>(
      DependencyTag.RequireVersion,
    );

    const array = [];

    for (let i = 0; i < requireName.length; i++) {
      array.push({ name: requireName[i], version: requireVersion[i] });
    }

    return array;
  }

  get buildTime(): Date {
    return new Date(this.getHeaderEntryData(OtherTag.BuildTime) * 1000);
  }

  get platform(): string {
    return this.getHeaderEntryData(OtherTag.Platform);
  }

  get payload(): {
    data: Uint8Array;
    compressor: string;
    flags: string;
    format: string;
  } | undefined {
    return this.raw.payload
      ? {
        data: new Uint8Array(this.raw.payload),
        flags: this.getHeaderEntryData(InfoTag.PayloadFlags),
        compressor: this.getHeaderEntryData(InfoTag.PayloadCompressor),
        format: this.getHeaderEntryData(InfoTag.PayloadFormat),
      }
      : undefined;
  }

  get<T = unknown>(tag: InfoTag | number): T | undefined {
    return this.raw.header.entries.get(tag)?.data as (T | undefined);
  }

  private getHeaderEntryData<T = any>(tag: number): T {
    try {
      return this.raw.header.entries.get(tag)!.data as T;
    } catch {
      throw new AccessToUnparsedEntryError(tag);
    }
  }
}
