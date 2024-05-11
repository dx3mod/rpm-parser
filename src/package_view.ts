import { RawPackage } from "./raw_package";
import { DependencyTag, InfoTag, OtherTag } from "./tags";

/** Error when accessing an RPM field of a package that does not exist or has not been parsed. */
export class AccessToUnparsedEntryError extends Error {
  constructor(public readonly tag: number) {
    super(
      `You are trying to access an entry (tag: ${tag}) that is not parsed and can't be read!`,
    );
  }
}

/** Generic view for any RPM package. */
export class RpmPackageView {
  constructor(public readonly raw: RawPackage) {}

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Name`
   */
  get name(): string {
    return this.getHeaderEntryData(InfoTag.Name);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Version`
   */
  get version(): string {
    return this.getHeaderEntryData(InfoTag.Version);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Release`
   */
  get release(): string {
    return this.getHeaderEntryData(InfoTag.Release);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Summery`
   */
  get summery(): string {
    return this.getHeaderEntryData(InfoTag.Summery)[0];
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Description`
   */
  get description(): string {
    return this.getHeaderEntryData(InfoTag.Description)[0];
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Vendor`
   */
  get vendor(): string {
    return this.getHeaderEntryData(InfoTag.Vendor);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.License`
   */
  get license(): string {
    return this.getHeaderEntryData(InfoTag.License);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Packager`
   */
  get packager(): string {
    return this.getHeaderEntryData(InfoTag.Packager);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Os`
   */
  get os(): string {
    return this.getHeaderEntryData(InfoTag.Os);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Arch`
   */
  get arch(): string {
    return this.getHeaderEntryData(InfoTag.Arch);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `InfoTag.Size`
   */
  get size(): number {
    return this.getHeaderEntryData(InfoTag.Size);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be tags:
   * `DependencyTag.RequireName` and `DependencyTag.RequireVersion`.
   */
  get dependencies(): { name: string; version?: string }[] {
    const requireNames = this.getHeaderEntryData<string[]>(
      DependencyTag.RequireName,
    );

    const requireVersions = this.getHeaderEntryData<string[]>(
      DependencyTag.RequireVersion,
    );

    const array: { name: string; version?: string }[] = [];

    for (
      let i = 0;
      i < requireNames.length && i < requireVersions.length;
      i++
    ) {
      const reqVersion = requireVersions[i];

      array.push({
        name: requireNames[i],
        version: reqVersion.length === 0 ? undefined : reqVersion,
      });
    }

    return array;
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `OtherTag.BuildTime`
   */
  get buildTime(): Date {
    return new Date(this.getHeaderEntryData(OtherTag.BuildTime) * 1000);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be a tag `OtherTag.Platform`
   */
  get platform(): string {
    return this.getHeaderEntryData(OtherTag.Platform);
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be tag:
   *  `InfoTag.PayloadFlags`, `InfoTag.PayloadCompressor` and `InfoTag.PayloadFormat`.
   */
  get payload():
    | {
        data: Uint8Array;
        compressor: string;
        flags: string;
        format: string;
      }
    | undefined {
    return this.raw.payload
      ? {
          data: new Uint8Array(this.raw.payload),
          flags: this.getHeaderEntryData(InfoTag.PayloadFlags),
          compressor: this.getHeaderEntryData(InfoTag.PayloadCompressor),
          format: this.getHeaderEntryData(InfoTag.PayloadFormat),
        }
      : undefined;
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be tag: 269 and 1004.
   */
  get digest(): { sha1: string; md5: ArrayBuffer } {
    return {
      sha1: this.getSignatureEntryData(269),
      md5: this.getSignatureEntryData(1004),
    };
  }

  /**
   * @throws {AccessToUnparsedEntryError} There must be tag: 267, 268, 1002, 1005.
   */
  get signing(): {
    dsa?: ArrayBuffer;
    rsa?: ArrayBuffer;
    pgp?: ArrayBuffer;
    gpg?: ArrayBuffer;
  } {
    return {
      dsa: this.getSignature(267),
      rsa: this.getSignature(268),
      pgp: this.getSignature(1002),
      gpg: this.getSignature(1005),
    };
  }

  /** Get a header's data by tag. */
  get<T = unknown>(tag: InfoTag | number): T | undefined {
    return this.raw.header.entries.get(tag)?.data as T | undefined;
  }

  /** Get a signature's data by tag. */
  private getSignature<T = unknown>(tag: InfoTag | number): T | undefined {
    return this.raw.signature.entries.get(tag)?.data as T | undefined;
  }

  private getHeaderEntryData<T = any>(tag: number): T {
    try {
      return this.raw.header.entries.get(tag)!.data as T;
    } catch {
      throw new AccessToUnparsedEntryError(tag);
    }
  }

  private getSignatureEntryData<T = any>(tag: number): T {
    try {
      return this.raw.signature.entries.get(tag)!.data as T;
    } catch {
      throw new AccessToUnparsedEntryError(tag);
    }
  }
}
