import { Page, expect, Locator } from "@playwright/test";

export class GuestPage {
  private readonly wishlistTitle: Locator;
  private readonly addItemButton: Locator;
  private readonly editWishlistButton: Locator;
  private readonly shareSection: Locator;
  private readonly copyLinkButton: Locator;
  private readonly editItemButton: Locator;
  private readonly deleteItemButton: Locator;

  constructor(private page: Page) {
    this.wishlistTitle = page.locator('[data-test-id="wishlist-title"]');
    this.addItemButton = page.locator('[data-test-id="add-item-button"]');
    this.editWishlistButton = page.locator('[data-test-id="edit-wishlist-button"]');
    this.shareSection = page.locator('[data-test-id="share-with-guests-section"]');
    this.copyLinkButton = page.locator('[data-test-id="copy-link-button"]');
    this.editItemButton = page.locator('[data-test-id="edit-item-button"]');
    this.deleteItemButton = page.locator('[data-test-id="delete-item-button"]');
  }

  async goto(guestToken: string) {
    await this.page.goto(`/guest/${guestToken}`, { waitUntil: "networkidle" });
  }

  async expectWishlistTitle(title: string) {
    await expect(this.wishlistTitle).toBeVisible({ timeout: 10000 });
    await expect(this.wishlistTitle).toHaveText(title);
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveTitle(/Wishlist/i);
  }

  async expectNoAdminControls() {
    await expect(this.addItemButton).not.toBeVisible();
    await expect(this.editWishlistButton).not.toBeVisible();
    await expect(this.shareSection).not.toBeVisible();
    await expect(this.copyLinkButton).not.toBeVisible();
    await expect(this.editItemButton).not.toBeVisible();
    await expect(this.deleteItemButton).not.toBeVisible();
  }

  async expectItemVisible(itemName: string) {
    await expect(this.page.getByText(itemName)).toBeVisible();
  }
}
