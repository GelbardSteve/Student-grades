import { execSync } from "node:child_process";

export default function globalTeardown() {
  execSync("npx allure generate allure-results --clean -o allure-report", { stdio: "inherit" });
}
