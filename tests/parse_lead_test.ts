import { assertEquals } from "assert";
import { lead, toByteBuf } from "../mod.ts";

Deno.test("Parse lead of package", () => {
  const bin = Deno.readFileSync(
    import.meta.dirname + "/bibata-cursor-themes-2.0.6-1.fc39.noarch.rpm",
  );

  assertEquals(
    lead.parseLead(toByteBuf(bin)),
    {
      arch: 1,
      os: 1,
      signatureType: 5,
      version: { major: 3, minor: 0 },
      type: 0,
      name: "bibata-cursor-themes-2.0.6-1.fc39",
    },
  );
});
