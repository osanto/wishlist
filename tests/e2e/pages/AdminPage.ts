import { Page, expect, Locator } from "@playwright/test";
import { AddItemDialog } from "./AddItemDialog";
import { EditItemDialog } from "./EditItemDialog";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { EditWishlistDialog } from "./EditWishlistDialog";
import { UnreserveItemDialog } from "./UnreserveItemDialog";
import { ItemAssertions } from "../helpers/item-assertions";

export class AdminPage {
  private readonly addItemButton: Locator;
  private readonly wishlistTitle: Locator;
  private readonly editWishlistButton: Locator;
  private readonly copyLinkButton: Locator;
  private readonly emptyState: Locator;

  // Dialog instances (composition)
  public readonly addItemDialog: AddItemDialog;
  public readonly editItemDialog: EditItemDialog;
  public readonly deleteItemDialog: DeleteItemDialog;
  public readonly editWishlistDialog: EditWishlistDialog;
  public readonly unreserveItemDialog: UnreserveItemDialog;
  public readonly assertions: ItemAssertions;

  constructor(public page: Page) {
    this.addItemButton = page.locator('[data-test-id="add-item-button"]');
    this.wishlistTitle = page.locator('[data-test-id="wishlist-title"]');
    this.editWishlistButton = page.locator(
      '[data-test-id="edit-wishlist-button"]'
    );
    this.copyLinkButton = page.locator('[data-test-id="copy-link-button"]');
    this.emptyState = page.locator('[data-test-id="empty-state"]');

    // Initialize dialogs
    this.addItemDialog = new AddItemDialog(page);
    this.editItemDialog = new EditItemDialog(page);
    this.deleteItemDialog = new DeleteItemDialog(page);
    this.editWishlistDialog = new EditWishlistDialog(page);
    this.unreserveItemDialog = new UnreserveItemDialog(page);

    // Initialize assertions helper
    this.assertions = new ItemAssertions(page);
  }

  async goto(adminToken: string) {
    await this.page.goto(`/admin/${adminToken}`, { waitUntil: "networkidle" });
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async expectWishlistTitle(title: string) {
    await expect(this.wishlistTitle).toBeVisible();
    await expect(this.wishlistTitle).toHaveText(title);
  }

  async expectWishlistTitleNotVisible() {
    await expect(this.wishlistTitle).not.toBeVisible();
  }

  async expectToBeOnAdminPage() {
    await this.page.waitForURL(/\/admin\/[a-f0-9-]+/);
  }

  async getAdminTokenFromUrl(): Promise<string | null> {
    const url = this.page.url();
    const match = url.match(/\/admin\/([0-9a-f-]{36})/);
    return match ? match[1] : null;
  }

  async clickAddItem() {
    await this.addItemButton.waitFor({ state: "visible" });
    await this.addItemButton.click({ force: true }); // Force click to bypass hydration issues
  }

  async clickEditWishlist() {
    await this.editWishlistButton.waitFor({ state: "visible" });
    await this.editWishlistButton.click({ force: true });
  }

  async clickEditItemButton() {
    // Click the first edit button (using partial match for dynamic ID)
    const editButton = this.page
      .locator('[data-test-id^="edit-item-"]')
      .first();
    await editButton.waitFor({ state: "visible" });
    await editButton.click({ force: true });
  }

  async clickDeleteItemButton() {
    // Click the first delete button (using partial match for dynamic ID)
    const deleteButton = this.page
      .locator('[data-test-id^="delete-item-"]')
      .first();
    await deleteButton.waitFor({ state: "visible" });
    await deleteButton.click({ force: true });
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
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

  async getGuestUrl(): Promise<string> {
    // Grant clipboard permissions (only works in Chromium)
    try {
      await this.page
        .context()
        .grantPermissions(["clipboard-read", "clipboard-write"]);
    } catch (e) {
      // Firefox/WebKit don't support clipboard-read permission, but clipboard API still works
    }

    // Click the copy button to copy the guest URL to clipboard
    await this.copyLinkButton.click();

    // Read from clipboard using Playwright's evaluate
    const guestUrl = await this.page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    return guestUrl;
  }

  async getFirstItemId(): Promise<string> {
    // Get the first item's ID from the reserve button data-test-id
    const firstItemCard = this.page
      .locator('[data-test-id^="item-card-"]')
      .first();
    const itemId = await firstItemCard.getAttribute("data-test-id");
    return itemId!.replace("item-card-", "");
  }

  async clickUnreserveItem(itemId: string) {
    await this.page
      .locator(`[data-test-id="unreserve-item-${itemId}"]`)
      .click();
  }

  async expectReservedBadgeVisible() {
    await expect(this.page.getByText("Reserved")).toBeVisible();
  }

  async expectReservedBadgeNotVisible() {
    await expect(this.page.getByText("Reserved")).not.toBeVisible();
  }
}
