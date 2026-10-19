import { Page } from "@playwright/test";

export class Input {
    selector: string;
    page: Page;

    constructor(selector: string, page: Page) {
        this.selector = selector;
        this.page = page;
    }

    public async fill(text: string) {
        await this.page.getByTestId(this.selector).fill(text);
    }
}