import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf-8");

// F-TS-017: dist gate. On a fresh clone, dist/cli.js does not exist until
// `npm run build` runs. Skipping the suite when dist is absent keeps
// `npm test` green for first-time contributors who haven't built yet.
// `npm run verify` (used in CI and prepublishOnly) builds first, so this
// gate is transparent in those flows.
const distCli = join(root, "dist", "cli.js");
const distBuilt = existsSync(distCli);
const describeIfBuilt = distBuilt ? describe : describe.skip;

if (!distBuilt) {
  // eslint-disable-next-line no-console
  console.log(
    `[version.test] dist/cli.js missing — skipping version suite. ` +
      `Run \`npm run build\` to enable these tests.`
  );
}

describeIfBuilt("version consistency", () => {
  it("package.json version is semver", () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("package.json version is >= 1.0.0", () => {
    const major = parseInt(pkg.version.split(".")[0], 10);
    expect(major).toBeGreaterThanOrEqual(1);
  });

  it("CHANGELOG mentions current version", () => {
    expect(changelog).toContain(`[${pkg.version}]`);
  });

  it("rk --version prints the version", () => {
    const out = execFileSync("node", [distCli, "--version"], {
      encoding: "utf-8",
    }).trim();
    expect(out).toContain(pkg.version);
  });
});
