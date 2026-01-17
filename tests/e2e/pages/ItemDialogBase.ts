import { Page, Locator } from "@playwright/test";

/**
 * Base class for item dialogs (Add/Edit).
 * Provides common functionality for filling out item forms.
 */
export abstract class ItemDialogBase {
  protected readonly nameInput: Locator;
  protected readonly linkInput: Locator;
  protected readonly notesInput: Locator;
  protected readonly submitButton: Locator;
  protected readonly cancelButton: Locator;

  constructor(
    protected page: Page,
    testIdPrefix: string
  ) {
    this.nameInput = page.locator(
      `[data-test-id="${testIdPrefix}-name-input"]`
    );
    this.linkInput = page.locator(
      `[data-test-id="${testIdPrefix}-link-input"]`
    );
    this.notesInput = page.locator(
      `[data-test-id="${testIdPrefix}-notes-input"]`
    );
    this.submitButton = page.locator(
      `[data-test-id="${testIdPrefix}-submit-button"]`
    );
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
  }

  async waitForOpen() {
    await this.nameInput.waitFor({ state: "visible" });
  }

  async waitForClose() {
    await this.nameInput.waitFor({ state: "hidden" });
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillLink(link: string) {
    await this.linkInput.fill(link);
  }

  async fillNotes(notes: string) {
    await this.notesInput.fill(notes);
  }

  async fillForm(data: { name: string; link?: string; notes?: string }) {
    await this.waitForOpen();
    await this.fillName(data.name);
    if (data.link !== undefined) {
      await this.fillLink(data.link);
    }
    if (data.notes !== undefined) {
      await this.fillNotes(data.notes);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async submitAndWaitForClose() {
    await this.submit();
    await this.waitForClose();
  }
}
