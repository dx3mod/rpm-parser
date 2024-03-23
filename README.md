# rpm-parser

RPM v3 package metadata parser in TypeScript for use in any environment.

## Get Started

For [Deno](https://deno.land).

```ts
import { parseRpmMetadata } from "https://deno.land/x/rpm_parser/mod.ts";
```

High-level user API

```ts
// parse from stream in chunks
const pkg = await parseRpmMetadata(blob.stream());

pkg.name; // string
pkg.buildTime; // Date
```

with direct access

```ts
pkg.raw.signature.entries.get(1004); // Entry
```

and configuration of optimization.

```ts
parseRpmMetadata(
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
  },
);
```

## Documentation

- [API reference](https://deno.land/x/rpm_parser/mod.ts)

## References

- [Package File Format](https://refspecs.linuxbase.org/LSB_4.1.0/LSB-Core-generic/LSB-Core-generic/pkgformat.html)
- [rpm-rs/rpm](https://github.com/rpm-rs/rpm/)
