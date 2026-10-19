export const UI_BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

// Set in e2e-playwright/.env (gitignored); see .env.example
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@example.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '';
export const OTHER_ADMIN_EMAIL = process.env.E2E_OTHER_ADMIN_EMAIL ?? 'e2e-other-admin@example.com';
export const OTHER_ADMIN_PASSWORD = process.env.E2E_OTHER_ADMIN_PASSWORD ?? '';
