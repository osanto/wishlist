// Load environment variables BEFORE any other imports
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

import { test as base } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { AdminPage } from "../pages/AdminPage";
import { GuestPage } from "../pages/GuestPage";
import { AddItemDialog } from "../pages/AddItemDialog";
import { EditItemDialog } from "../pages/EditItemDialog";
import { deleteWishlistAction } from "@/app/actions/wishlist";

type WishlistFixtures = {
  homePage: HomePage;
  adminPage: AdminPage;
  guestPage: GuestPage;
  addItemDialog: AddItemDialog;
  editItemDialog: EditItemDialog;
  createdWishlists: string[]; // Track admin tokens for cleanup
};

export const test = base.extend<WishlistFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  guestPage: async ({ page }, use) => {
    await use(new GuestPage(page));
  },

  addItemDialog: async ({ page }, use) => {
    await use(new AddItemDialog(page));
  },

  editItemDialog: async ({ page }, use) => {
    await use(new EditItemDialog(page));
  },

  createdWishlists: async ({}, use) => {
    const adminTokens: string[] = [];
    
    // Provide the array to the test
    await use(adminTokens);
    
    // Cleanup after test
    for (const token of adminTokens) {
      try {
        await deleteWishlistAction(token);
      } catch (error) {
        console.error(`Failed to cleanup wishlist ${token}:`, error);
      }
    }
  },
});

export { expect } from "@playwright/test";
