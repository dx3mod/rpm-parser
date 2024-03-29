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

## For fun

```console
$ deno run --allow-read \
    https://raw.githubusercontent.com/dx3mod/rpm-parser/master/cli.ts \
    hello-2.10-alt1.1.src.rpm
```

```js
{
  name: "hello",
  version: "2.10",
  release: "alt1.1",
  architecture: "i586",
  group: [ "Development/C" ],
  size: 700833,
  license: "GPLv3+",
  sourceRpm: undefined,
  buildDate: 2015-12-04T03:01:12.000Z,
  buildHost: "viy-sisyphus.hasher.altlinux.org",
  vendor: "ALT Linux Team",
  url: "ftp://ftp.gnu.org/gnu/hello/",
  summery: "GNU hello, THE greeting printing program",
  description: "The GNU `hello' program produces a familiar, friendly greeting.  It\n" +
    "allows nonprogrammers to use a c"... 173 more characters
}
```

## Documentation

- [API reference](https://deno.land/x/rpm_parser/mod.ts)

## References

- [Package File Format](https://refspecs.linuxbase.org/LSB_4.1.0/LSB-Core-generic/LSB-Core-generic/pkgformat.html)
- [rpm-rs/rpm](https://github.com/rpm-rs/rpm/)
