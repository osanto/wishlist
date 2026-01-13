import { Page, Locator } from "@playwright/test";

export class UnreserveItemDialog {
  private readonly dialog: Locator;
  private readonly confirmButton: Locator;
  private readonly cancelButton: Locator;

  constructor(private page: Page) {
    this.dialog = page.locator('[data-test-id="unreserve-item-dialog"]');
    this.confirmButton = page.locator('[data-test-id="confirm-unreserve-button"]');
    this.cancelButton = page.locator('[data-test-id="cancel-unreserve-button"]');
  }

  async confirmAndWaitForClose() {
    await this.confirmButton.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async cancel() {
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: "hidden" });
  }
}
