# rpm-parser

RPM v3 package metadata parser in TypeScript with support for partial sync/stream parsing.

## Usage

Basic.

```ts
import { parseRpmPackage } from "@dx3mod/rpm-parser";

const packageView = await parseRpmPackage(blob.stream());

packageView.name; // string
packageView.buildTime; // Date

packageView.raw.signature.entries.get(1004); // Entry
```

Partial parsing.

```ts
parseRpmPackage(stream, {
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
});
```

## See also

- [fastify-rpm-parser](https://github.com/dx3mod/fastify-rpm-parser)

## References

- [Package File Format](https://refspecs.linuxbase.org/LSB_4.1.0/LSB-Core-generic/LSB-Core-generic/pkgformat.html)
- [rpm-rs/rpm](https://github.com/rpm-rs/rpm/)
