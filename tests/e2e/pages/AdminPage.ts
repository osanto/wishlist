import { Page, expect, Locator } from "@playwright/test";

export class AdminPage {
  private readonly addItemButton: Locator;
  private readonly wishlistTitle: Locator;
  private readonly editWishlistButton: Locator;
  private readonly copyLinkButton: Locator;
  private readonly emptyState: Locator;

  constructor(private page: Page) {
    this.addItemButton = page.locator('[data-test-id="add-item-button"]');
    this.wishlistTitle = page.locator('[data-test-id="wishlist-title"]');
    this.editWishlistButton = page.locator('[data-test-id="edit-wishlist-button"]');
    this.copyLinkButton = page.locator('[data-test-id="copy-link-button"]');
    this.emptyState = page.locator('[data-test-id="empty-state"]');
  }

  async goto(adminToken: string) {
    await this.page.goto(`/admin/${adminToken}`, { waitUntil: "networkidle" });
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async expectWishlistTitle(title: string) {
    await expect(this.wishlistTitle).toBeVisible({ timeout: 10000 });
    await expect(this.wishlistTitle).toHaveText(title);
  }

  async expectToBeOnAdminPage() {
    await this.page.waitForURL(/\/admin\/[a-f0-9-]+/, { timeout: 15000 });
  }

  async getAdminTokenFromUrl(): Promise<string | null> {
    const url = this.page.url();
    const match = url.match(/\/admin\/([0-9a-f-]{36})/);
    return match ? match[1] : null;
  }

  async clickAddItem() {
    await this.addItemButton.waitFor({ state: "visible", timeout: 10000 });
    await this.addItemButton.click({ force: true }); // Force click to bypass hydration issues
  }

  async clickEditWishlist() {
    await this.editWishlistButton.waitFor({ state: "visible", timeout: 10000 });
    await this.editWishlistButton.click({ force: true });
  }

  async clickEditItemButton() {
    // Click the first edit button (using partial match for dynamic ID)
    const editButton = this.page.locator('[data-test-id^="edit-item-"]').first();
    await editButton.waitFor({ state: "visible", timeout: 10000 });
    await editButton.click({ force: true });
  }

  async clickDeleteItemButton() {
    // Click the first delete button (using partial match for dynamic ID)
    const deleteButton = this.page.locator('[data-test-id^="delete-item-"]').first();
    await deleteButton.waitFor({ state: "visible", timeout: 10000 });
    await deleteButton.click({ force: true });
  }

  async expectItemVisible(itemName: string) {
    await expect(this.page.getByText(itemName)).toBeVisible({
      timeout: 10000,
    });
  }

  async expectItemNotVisible(itemName: string) {
    await expect(this.page.getByText(itemName)).not.toBeVisible({
      timeout: 10000,
    });
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10000 });
  }

  async expectAddItemButtonVisible() {
    await expect(this.addItemButton).toBeVisible();
  }

  async expectEditWishlistButtonVisible() {
    await expect(this.editWishlistButton).toBeVisible();
  }

  async expectCopyLinkButtonVisible() {
    await expect(this.copyLinkButton).toBeVisible();
  }

  async expectAddItemButtonNotVisible() {
    await expect(this.addItemButton).not.toBeVisible();
  }

  async expectEditWishlistButtonNotVisible() {
    await expect(this.editWishlistButton).not.toBeVisible();
  }

  async expectCopyLinkButtonNotVisible() {
    await expect(this.copyLinkButton).not.toBeVisible();
  }
}
