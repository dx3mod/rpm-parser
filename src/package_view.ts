import { RawPackage } from "./raw_package.ts";
import { PackageInfoTag } from "./tag.ts";

export class AccessToUnparsedEntryError extends Error {
  constructor(public readonly tag: number) {
    super(
      `You are trying to access an entry (tag: ${tag}) that is not parsed and can't be read!`,
    );
  }
}

export class RpmPackageView {
  constructor(
    public readonly raw: RawPackage,
  ) {}

  get name(): string {
    return this.getHeaderEntryData(PackageInfoTag.Name);
  }

  get version(): string {
    return this.getHeaderEntryData(PackageInfoTag.Version);
  }

  get release(): string {
    return this.getHeaderEntryData(PackageInfoTag.Release);
  }

  get summery(): string {
    return this.getHeaderEntryData(PackageInfoTag.Summery)[0];
  }

  get description(): string {
    return this.getHeaderEntryData(PackageInfoTag.Description)[0];
  }

  get vendor(): string {
    return this.getHeaderEntryData(PackageInfoTag.Vendor);
  }

  get license(): string {
    return this.getHeaderEntryData(PackageInfoTag.License);
  }

  get packager(): string {
    return this.getHeaderEntryData(PackageInfoTag.Packager);
  }

  get os(): string {
    return this.getHeaderEntryData(PackageInfoTag.Os);
  }

  get arch(): string {
    return this.getHeaderEntryData(PackageInfoTag.Arch);
  }

  get(tag: PackageInfoTag): unknown {
    return this.getHeaderEntryData(tag);
  }

  private getHeaderEntryData(tag: number): any {
    try {
      return this.raw.header.entries.get(tag)!.data;
    } catch {
      throw new AccessToUnparsedEntryError(tag);
    }
  }
}
