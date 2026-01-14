import { Page, expect, Locator } from "@playwright/test";
import { ItemAssertions } from "../helpers/item-assertions";

export class GuestPage {
  private readonly wishlistTitle: Locator;
  private readonly addItemButton: Locator;
  private readonly editWishlistButton: Locator;
  private readonly shareSection: Locator;
  private readonly copyLinkButton: Locator;
  private readonly editItemButton: Locator;
  private readonly deleteItemButton: Locator;
  private readonly reserveConfirmButton: Locator;
  private readonly cancelReservationConfirmButton: Locator;
  public readonly assertions: ItemAssertions;

  constructor(public page: Page) {
    this.wishlistTitle = page.locator('[data-test-id="wishlist-title"]');
    this.addItemButton = page.locator('[data-test-id="add-item-button"]');
    this.editWishlistButton = page.locator('[data-test-id="edit-wishlist-button"]');
    this.shareSection = page.locator('[data-test-id="share-with-guests-section"]');
    this.copyLinkButton = page.locator('[data-test-id="copy-link-button"]');
    this.editItemButton = page.locator('[data-test-id="edit-item-button"]');
    this.deleteItemButton = page.locator('[data-test-id="delete-item-button"]');
    this.reserveConfirmButton = page.locator('[data-test-id="reserve-item-confirm-button"]');
    this.cancelReservationConfirmButton = page.locator('[data-test-id="cancel-reservation-confirm-button"]');
    
    // Initialize assertions helper
    this.assertions = new ItemAssertions(page);
  }

  async goto(guestToken: string) {
    await this.page.goto(`/guest/${guestToken}`, { waitUntil: "networkidle" });
  }

  async expectWishlistTitle(title: string) {
    await expect(this.wishlistTitle).toBeVisible();
    await expect(this.wishlistTitle).toHaveText(title);
  }

  async expectWishlistTitleNotVisible() {
    await expect(this.wishlistTitle).not.toBeVisible();
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

  async clickReserveButton(itemId: string) {
    const reserveButton = this.page.locator(`[data-test-id="reserve-button-${itemId}"]`);
    await reserveButton.click();
  }

  async confirmReserve() {
    await this.reserveConfirmButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async expectItemReservedByMe(itemId: string) {
    const badge = this.page.locator(`[data-test-id="you-reserved-badge-${itemId}"]`);
    await expect(badge).toBeVisible();
  }

  async expectItemReservedByOther(itemId: string) {
    const badge = this.page.locator(`[data-test-id="reserved-badge-${itemId}"]`);
    await expect(badge).toBeVisible();
  }

  async expectItemAvailable(itemId: string) {
    const reserveButton = this.page.locator(`[data-test-id="reserve-button-${itemId}"]`);
    await expect(reserveButton).toBeVisible();
  }

  async clickCancelReservationButton(itemId: string) {
    const cancelButton = this.page.locator(`[data-test-id="cancel-reservation-${itemId}"]`);
    await cancelButton.click();
  }

  async confirmCancelReservation() {
    await this.cancelReservationConfirmButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async getFirstItemId(): Promise<string> {
    // Get the first item's ID from the item card data-test-id
    const firstItemCard = this.page.locator('[data-test-id^="item-card-"]').first();
    const itemId = await firstItemCard.getAttribute('data-test-id');
    return itemId!.replace('item-card-', '');
  }
}
