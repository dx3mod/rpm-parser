import { InfoTag, OtherTag, parseRpmPackageSync } from "../mod.ts";

const SELECT_TAGS_OPTIONS = {
  select: {
    tags: [
      InfoTag.Name,
      InfoTag.Os,
      InfoTag.Arch,
      InfoTag.Summery,
      InfoTag.Size,
      OtherTag.BuildHost,
      InfoTag.Version,
      InfoTag.Release,
      OtherTag.BuildTime,
      InfoTag.Group,
      InfoTag.License,
      InfoTag.DistUrl,
      InfoTag.Description,
    ],
  },
};

const rpmFileContents = Deno.readFileSync("hello-2.10-alt1.1.src.rpm");

Deno.bench("Parse RPM file's contents", () => {
  parseRpmPackageSync(rpmFileContents);
});

Deno.bench("Parse RPM file's contents with select tags", () => {
  parseRpmPackageSync(rpmFileContents, SELECT_TAGS_OPTIONS);
});

Deno.bench("Parse RPM file's contents with payload", () => {
  parseRpmPackageSync(rpmFileContents, { capture: { payload: true } });
});

Deno.bench("Read RPM file", () => {
  const rpmFileContents = Deno.readFileSync("hello-2.10-alt1.1.src.rpm");
  parseRpmPackageSync(rpmFileContents);
});

Deno.bench("Read RPM file with payload", () => {
  const rpmFileContents = Deno.readFileSync("hello-2.10-alt1.1.src.rpm");
  parseRpmPackageSync(rpmFileContents, { capture: { payload: true } });
});

Deno.bench("Read RPM file with select tags", () => {
  const rpmFileContents = Deno.readFileSync("hello-2.10-alt1.1.src.rpm");
  parseRpmPackageSync(rpmFileContents, SELECT_TAGS_OPTIONS);
});
