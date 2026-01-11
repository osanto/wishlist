import { Page, Locator } from "@playwright/test";

export class AddItemDialog {
  private readonly nameInput: Locator;
  private readonly linkInput: Locator;
  private readonly notesInput: Locator;
  private readonly submitButton: Locator;
  private readonly cancelButton: Locator;

  constructor(private page: Page) {
    this.nameInput = page.locator('[data-test-id="item-name-input"]');
    this.linkInput = page.locator('[data-test-id="item-link-input"]');
    this.notesInput = page.locator('[data-test-id="item-notes-input"]');
    this.submitButton = page.locator('[data-test-id="item-submit-button"]');
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
  }

  async waitForOpen() {
    await this.nameInput.waitFor({ state: "visible", timeout: 10000 });
  }

  async waitForClose() {
    await this.nameInput.waitFor({ state: "hidden", timeout: 10000 });
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
    if (data.link) {
      await this.fillLink(data.link);
    }
    if (data.notes) {
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
