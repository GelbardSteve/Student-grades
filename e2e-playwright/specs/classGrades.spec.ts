import { expect, test } from "@playwright/test";
import { randomInt, randomUUID } from "node:crypto";
import { signedInClient } from "../src/api/testAdmins";
import { LoginPageClass } from "../src/pages/login/LoginPage";
import { ADMIN_EMAIL, ADMIN_PASSWORD, OTHER_ADMIN_EMAIL, OTHER_ADMIN_PASSWORD } from "../src/utils/constants";

// Deletes this run's class (and with it enrollments and grades) through the admin's own RLS-scoped session
const cleanUp = async (className: string, studentNumber: string) => {
    const client = await signedInClient(ADMIN_EMAIL, ADMIN_PASSWORD);
    await client.from('classes').delete().eq('name', className);
    await client.from('students').delete().eq('student_number', studentNumber);
};

test.describe('Class, students, grades and email', () => {
    // The isolation test checks the class created by the first test
    test.describe.configure({ mode: 'serial' });

    const className = `e2e-class-${randomUUID().slice(0, 8)}`;
    const studentNumber = String(randomInt(100_000, 999_999_999));
    const studentName = `e2e-student-${randomUUID().slice(0, 6)}`;

    test.afterAll(async () => cleanUp(className, studentNumber));

    test('admin manages a class end to end and emails the grades', async ({ page }) => {
        await page.goto('/#/classes');

        await test.step('Create a class', async () => {
            await page.getByTestId('newClassName').fill(className);
            await page.getByRole('button', { name: 'Add Class' }).click();
            await page.getByRole('link', { name: className }).click();
            await expect(page.getByRole('heading', { name: new RegExp(className) })).toBeVisible();
        });

        await test.step('Add a student with an email address', async () => {
            await page.getByTestId('addStudentButton').click();
            await page.getByLabel('Student Number').fill(studentNumber);
            await page.getByLabel('Student Name').fill(studentName);
            await page.getByLabel('Email (optional)').fill('student@example.com');
            await page.getByRole('button', { name: 'Add Student' }).last().click();
            await expect(page.getByRole('row').filter({ hasText: studentName })).toContainText(studentNumber);
        });

        const row = page.getByRole('row').filter({ hasText: studentNumber });

        await test.step('Send Email is disabled until the student has grades', async () => {
            await expect(row.getByRole('button', { name: 'Send Email' })).toBeDisabled();
        });

        await test.step('Add a grade', async () => {
            await row.getByRole('button', { name: 'Grades' }).click();
            await page.getByLabel('Subject').fill('Algebra');
            await page.getByLabel('Score (0-100)').fill('93');
            await page.getByLabel('Comment (optional)').fill('Excellent');
            await page.getByRole('button', { name: 'Add grade' }).click();
            await expect(page.getByRole('cell', { name: 'Excellent' })).toBeVisible();
            await page.getByRole('button', { name: 'Close', exact: true }).click();
            await expect(row).toContainText('Algebra: 93');
        });

        await test.step('Edit the name; the student number is read-only', async () => {
            await row.getByRole('button', { name: 'Edit' }).click();
            await expect(page.getByLabel('Student Number')).toHaveAttribute('readonly', '');
            await page.getByLabel('Student Name').fill(`${studentName}-renamed`);
            await page.getByRole('button', { name: 'Save' }).click();
            await expect(row).toContainText(`${studentName}-renamed`);
        });

        await test.step('Send the grade report and see the ✓', async () => {
            await expect(row.getByLabel('Grades emailed')).toHaveCount(0);
            await row.getByRole('button', { name: 'Send Email' }).click();
            await expect(page.getByText('Grade report sent to student@example.com')).toBeVisible();
            await expect(row.getByLabel('Grades emailed')).toBeVisible();
        });
    });

    test('another admin cannot see or open this class', async ({ browser }) => {
        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await context.newPage();
        await new LoginPageClass(page).login(OTHER_ADMIN_EMAIL, OTHER_ADMIN_PASSWORD);
        await expect(page.getByRole('link', { name: className })).toHaveCount(0);

        const owner = await signedInClient(ADMIN_EMAIL, ADMIN_PASSWORD);
        const { data } = await owner.from('classes').select('id').eq('name', className).single();
        await page.goto(`/#/classes/${data!.id}`);
        await expect(page.getByText('Class not found')).toBeVisible();
        await context.close();
    });
});
