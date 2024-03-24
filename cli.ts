import * as cli from "https://deno.land/std@0.220.1/cli/mod.ts";
import { InfoTag, OtherTag, parseRpmPackage } from "./mod.ts";

if (import.meta.main) {
  const args = cli.parseArgs(Deno.args, { boolean: "json" });

  if (args._.length === 1) {
    const rpmFile = await Deno.open(args._[0].toString(), { read: true });

    const pkg = await parseRpmPackage(rpmFile.readable);

    const report = {
      name: pkg.name,
      version: pkg.version,
      release: pkg.release,
      architecture: pkg.arch,
      group: pkg.get<string[]>(InfoTag.Group),
      size: pkg.size,
      license: pkg.license,
      //   signature
      sourceRpm: pkg.get(InfoTag.SourceRpm),
      buildDate: pkg.buildTime,
      buildHost: pkg.get(OtherTag.BuildHost),
      vendor: pkg.vendor,
      url: pkg.get(InfoTag.Url),
      summery: pkg.summery,
      description: pkg.description,
    };

    if (args.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(report);
    }

    rpmFile.close();
  } else {
    console.log("Usage: cli <path to RPM file> [--json]");
  }
}
