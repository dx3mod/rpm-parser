# rpm-parser

RPM v3 package metadata parser in TypeScript.

## Overview

```ts
import { parseRpmPackage } from "@dx3mod/rpm-parser";
```

High-level user API

```ts
// parse from stream in chunks
const pkg = await parseRpmPackage(blob.stream());

pkg.name; // string
pkg.buildTime; // Date
```

with direct access

```ts
pkg.raw.signature.entries.get(1004); // Entry
```

and partial parsing.

```ts
parseRpmPackage(
  stream,
  {
    // partial parsing of necessary header entries
    select: {
      tags: [
        InfoTag.Name,
        InfoTag.Os,
        InfoTag.Arch,
        InfoTag.Summery,
        InfoTag.Size,
      ],
    },
    capture: {
      payload: true,
    },
  },
);
```

<!-- ## Documentation

- [API reference](https://jsr.io/@dx3mod/rpm-parser/doc) -->

## References

- [Package File Format](https://refspecs.linuxbase.org/LSB_4.1.0/LSB-Core-generic/LSB-Core-generic/pkgformat.html)
- [rpm-rs/rpm](https://github.com/rpm-rs/rpm/)
