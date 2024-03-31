import { parseRpmPackage } from "../mod.ts";

Deno.bench("Read RPM file in chunks", async () => {
  const rpmFile = await Deno.open("hello-2.10-alt1.1.src.rpm", { read: true });
  await parseRpmPackage(rpmFile.readable);
});

Deno.bench("Read RPM file with payload in chunks", async () => {
  const rpmFile = await Deno.open("hello-2.10-alt1.1.src.rpm", { read: true });
  await parseRpmPackage(rpmFile.readable, { capture: { payload: true } });
});
