import { Page } from "@playwright/test";
import { ItemDialogBase } from "./ItemDialogBase";

export class EditItemDialog extends ItemDialogBase {
  constructor(page: Page) {
    super(page, "edit-item");
  }
}
