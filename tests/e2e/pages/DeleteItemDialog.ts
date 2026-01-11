import { Page, Locator } from "@playwright/test";

export class DeleteItemDialog {
  private readonly confirmButton: Locator;
  private readonly cancelButton: Locator;

  constructor(private page: Page) {
    this.confirmButton = page.locator('[data-test-id="delete-item-confirm-button"]');
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
  }

  async waitForOpen() {
    await this.confirmButton.waitFor({ state: "visible", timeout: 10000 });
  }

  async waitForClose() {
    await this.confirmButton.waitFor({ state: "hidden", timeout: 10000 });
  }

  async confirm() {
    await this.confirmButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async confirmAndWaitForClose() {
    await this.confirm();
    await this.waitForClose();
  }
}
