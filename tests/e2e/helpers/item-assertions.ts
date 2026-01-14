import { Page, expect } from "@playwright/test";
/**
 * Shared assertion helpers for item-related checks.
 * These are generic assertions that work the same way across different pages.
 */
export class ItemAssertions {
  constructor(private page: Page) {}

  async expectItemLinkVisible(link: string) {
    await expect(this.page.locator(`a[href="${link}"]`)).toBeVisible();
  }

  async expectItemLinkNotVisible(link: string) {
    await expect(this.page.locator(`a[href="${link}"]`)).not.toBeVisible();
  }

  async expectItemNotesVisible(notes: string) {
    await expect(this.page.getByText(notes)).toBeVisible();
  }

  async expectItemNotesNotVisible(notes: string) {
    await expect(this.page.getByText(notes)).not.toBeVisible();
  }

  async expectItemVisible(itemName: string) {
    await expect(this.page.getByText(itemName)).toBeVisible();
  }

  async expectItemNotVisible(itemName: string) {
    await expect(this.page.getByText(itemName)).not.toBeVisible();
  }

  async expectTextVisible(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expect404Page() {
    await expect(this.page.getByText("404")).toBeVisible();
  }
}
