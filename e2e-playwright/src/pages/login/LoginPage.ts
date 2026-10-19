import { Page } from "@playwright/test";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

export class LoginPageClass {
    private page: Page;
    emailInput: Input;
    passwordInput: Input;
    submitButton: Button;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = new Input('usernameInput', page);
        this.passwordInput = new Input('passwordInput', page);
        this.submitButton = new Button('submitButton', page);
    }

    public async login(email: string, password: string) {
        await this.page.goto('/');
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
        await this.page.waitForURL('**/#/classes');
        return this;
    }
}
