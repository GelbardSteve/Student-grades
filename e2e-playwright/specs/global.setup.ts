// specs/global.setup.ts
import { expect, test as setup } from "@playwright/test";
import path from "path";
import { ensureConfirmedAdmin } from "../src/api/testAdmins";
import { LoginPageClass } from "../src/pages/login/LoginPage";
import { ADMIN_EMAIL, ADMIN_PASSWORD, OTHER_ADMIN_EMAIL, OTHER_ADMIN_PASSWORD } from "../src/utils/constants";

const authFile = path.join(__dirname, "../auth.json");

setup("create test admins, log in and save the session", async ({ page }) => {
  expect(ADMIN_PASSWORD, 'Set E2E_ADMIN_PASSWORD in e2e-playwright/.env').not.toBe('');
  expect(OTHER_ADMIN_PASSWORD, 'Set E2E_OTHER_ADMIN_PASSWORD in e2e-playwright/.env').not.toBe('');
  await ensureConfirmedAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
  await ensureConfirmedAdmin(OTHER_ADMIN_EMAIL, OTHER_ADMIN_PASSWORD);

  await new LoginPageClass(page).login(ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page.getByRole('heading', { name: 'My Classes' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
