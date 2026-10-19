import { test as base } from '@playwright/test';
import { cleanUp } from '../src/api/cleanUp';


export const testDescribe = base.extend<{
    test: void
}>({
    test: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            await use();
            await cleanUp();
        }, { auto: true }
    ]
});