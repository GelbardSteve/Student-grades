import * as fs from "fs";
import * as path from "path";

export const getMetadata = () => {
  const testRunDataPath = path.join(
    __dirname,
    "..",
    "..",
    "testRunData",
    "testRunData.json",
  );

  if (!fs.existsSync(testRunDataPath)) {
    throw new Error("testRunData.json not found.");
  }

  const testRunDataArray = JSON.parse(
    fs.readFileSync(testRunDataPath, "utf-8"),
  );
  const dataTag = process.env.TEST_DATA_TAG;

  if (dataTag) {
    const found = testRunDataArray.find((data) => data.dataTag === dataTag);
    if (found) {
      console.log(`  Using data tag: ${dataTag}`);
      return found;
    }
    console.warn(
      `  Warning: Data tag '${dataTag}' not found, using first entry`,
    );
  }
  return testRunDataArray[0];
};
