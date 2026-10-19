import { Page } from "@playwright/test";

export class Button {
    selector: string;
    page: Page;

    constructor(selector: string, page: Page) {
        this.selector = selector;
        this.page = page;
    }

    public async click() {
        await this.page.getByTestId(this.selector).click();
    }
}