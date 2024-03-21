# rpm-parser

RPM v3 package metadata parser in TypeScript for use in any environment.

#### Features

- Stream parsing based on
  [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).
- Partial parsing of Header.

## Get Started

For [Deno](https://deno.land).

```ts
import { parseRpmMetadata } from "..";
```

High-level user API

```ts
const package = await parseRpmMetadata(blob.stream());

package.name; // string
package.buildTime; // Date
```

with direct access

```ts
package.raw.signature.get(1004); // ArrayBuffer
```

and configuration of optimization.

```ts
parseRpmMetadata(stream, {
  select: {
    tags: ["name", "arch", "summery", "size"],
  },
});
```

## To-Do

Implementation

- [x] lead
- [x] header (signature and header)
- [x] stream parser
  - [x] read payload (partial, it's work but unknown how)
- [ ] sync parser
- [ ] user API

## References

- [Package File Format](https://refspecs.linuxbase.org/LSB_4.1.0/LSB-Core-generic/LSB-Core-generic/pkgformat.html)
- [rpm-rs/rpm](https://github.com/rpm-rs/rpm/)