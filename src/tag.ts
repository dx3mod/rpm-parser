// https://refspecs.linuxbase.org/LSB_4.1.0/LSB-Core-generic/LSB-Core-generic/pkgformat.html#AEN39174

export enum PackageInfoTag {
  /** This tag specifies the name of the package. */
  Name = 1000,

  /** This tag specifies the version of the package. */
  Version = 1001,

  /** This tag specifies the release of the package. */
  Release = 1002,

  /** This tag specifies the summary description of the package.
   * The summary value pointed to by this index record contains
   * a one line description of the package. */
  Summery = 1004,

  /** This tag specifies the description of the package.
   * The description value pointed to by this index record
   * contains a full desription of the package. */
  Description = 1005,

  /**  This tag specifies the sum of the sizes of the regular files in the archive. */
  Size = 1009,

  /** A string containing the name of the distribution on which the package was built. */
  Distribution = 1010,

  /** A string containing the name of the organization that produced the package. */
  Vendor = 1011,

  /** This tag specifies the license which applies to this package. */
  License = 1014,

  /** A string identifying the tool used to build the package. */
  Packager = 1015,

  /** This tag specifies the administrative group to which this package belongs. */
  Group = 1016,

  /** Generic package information URL. */
  Url = 1020,

  /** This tag specifies the OS of the package.
   * The OS value pointed to by this index record shall be "linux". */
  Os = 1021,

  /** This tag specifies the architecture of the package.
   * The architecture value pointed to by this index record is
   *  defined in architecture specific LSB specification. */
  Arch = 1022,

  /** This tag specifies the name of the source RPM. */
  SourceRpm = 1044,

  /** This tag specifies the uncompressed size of the Payload archive, including the cpio headers. */
  ArchiveSize = 1046,

  /** This tag indicates the version of RPM tool used to build this package. The value is unused. */
  RpmVersion = 10064,

  /** This tag contains an opaque string whose contents are undefined. */
  Cookie = 1094,

  /** URL for package. */
  DistUrl = 1123,

  /** This tag specifies the format of the Archive section.
   * The format value pointed to by this index record shall be 'cpio'. */
  PayloadFormat = 1124,

  /** This tag specifies the compression used on the Archive section.
   * The compression value pointed to by this index record shall be 'gzip'. */
  PayloadCompressor = 1125,

  /** This tag indicates the compression level used for the Payload.
   * This value shall always be '9'. */
  PayloadFlags = 1126,
}

export enum PackageDependencyTag {
  ProvideName = 1047,
  ProvideFlags = 1112,
  ProvideVersion = 1113,

  RequireFlags = 1048,
  RequireVersion = 1050,
  RequireName = 1049,

  ConflictVersion = 1055,

  ObsoleteName = 1090,
  ObsoleteFlags = 1114,
  ObsoleteVersion = 1114,
}
