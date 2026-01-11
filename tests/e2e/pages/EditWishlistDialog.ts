import { Page, expect, Locator } from "@playwright/test";

export class EditWishlistDialog {
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly submitButton: Locator;
  private readonly cancelButton: Locator;
  private readonly dialog: Locator;

  constructor(private page: Page) {
    this.titleInput = page.locator('[data-test-id="edit-wishlist-title-input"]');
    this.descriptionInput = page.locator('[data-test-id="edit-wishlist-description-input"]');
    this.submitButton = page.locator('[data-test-id="edit-wishlist-submit-button"]');
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.dialog = page.getByRole("dialog");
  }

  async fillForm(data: { title?: string; description?: string }) {
    if (data.title !== undefined) {
      await this.titleInput.clear();
      await this.titleInput.fill(data.title);
    }
    if (data.description !== undefined) {
      await this.descriptionInput.clear();
      await this.descriptionInput.fill(data.description);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async submitAndWaitForClose() {
    await this.submitButton.click();
    await this.expectDialogClosed();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expectDialogOpen() {
    await expect(this.dialog).toBeVisible({ timeout: 5000 });
  }

  async expectDialogClosed() {
    await expect(this.dialog).not.toBeVisible({ timeout: 5000 });
  }
}
