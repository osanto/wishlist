import { Page, expect } from "@playwright/test";

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/", { waitUntil: "networkidle" });
  }

  async clickCreateWishlist() {
    const createButton = this.page.getByRole("button", {
      name: "Create Wishlist",
    });
    await expect(createButton).toBeVisible({ timeout: 15000 });
    await createButton.click();
  }

  async expectToBeVisible() {
    await expect(this.page).toHaveTitle(/Wishlist/i);
  }
}
