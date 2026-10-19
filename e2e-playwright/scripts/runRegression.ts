import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

type TestRunEntry = {
  name: string;
  password: string;
  isAdmin: boolean;
  dataTag: string;
};

const testRunDataPath = path.join(__dirname, "..", "testRunData", "testRunData.json");


if (!fs.existsSync(testRunDataPath)) {
  console.error(`❌ testRunData.json not found at ${testRunDataPath}`);
  process.exit(1);
}

const testRunData: TestRunEntry[] = JSON.parse(
  fs.readFileSync(testRunDataPath, "utf-8"),
);

// Optional CLI filter: `ts-node runRegression.ts admin student`
const cliTags = process.argv.slice(2);
const entriesToRun =
  cliTags.length > 0
    ? testRunData.filter((e) => cliTags.includes(e.dataTag))
    : testRunData;

if (entriesToRun.length === 0) {
  console.error(`❌ No matching dataTag(s). Available: ${testRunData.map(e => e.dataTag).join(", ")}`);
  process.exit(1);
}

let hasFailure = false;

// Clean once so the Allure report includes every dataTag run below
fs.rmSync(path.join(__dirname, "..", "allure-results"), { recursive: true, force: true });

for (const entry of entriesToRun) {
  console.log(`\n🚀 Running regression for dataTag="${entry.dataTag}" (${entry.name})`);

  const result = spawnSync(
    "npx",
    ["playwright", "test", `--project=${entry.dataTag}`],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        TEST_DATA_TAG: entry.dataTag,
        // Give each run its own report folder so runs don't overwrite each other
        PLAYWRIGHT_HTML_REPORT: path.join(
          "playwright-report",
          `report-${entry.dataTag}`,
        ),
      },
    },
  );

  if (result.status !== 0) {
    hasFailure = true;
    console.error(`❌ Run failed for dataTag="${entry.dataTag}"`);
  } else {
    console.log(`✅ Run passed for dataTag="${entry.dataTag}"`);
  }
}

spawnSync("npm", ["run", "allure:generate"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(hasFailure ? 1 : 0);
