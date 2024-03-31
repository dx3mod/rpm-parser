import { parseRpmPackageSync } from "../mod.ts";

const rpmFileContents = Deno.readFileSync("hello-2.10-alt1.1.src.rpm");

Deno.bench("Parse RPM file's contents", () => {
  parseRpmPackageSync(rpmFileContents);
});

Deno.bench("Parse RPM file's contents with payload", () => {
  parseRpmPackageSync(rpmFileContents, { capture: { payload: true } });
});
