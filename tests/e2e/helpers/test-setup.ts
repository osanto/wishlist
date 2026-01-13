import { HomePage } from "../pages/HomePage";
import { AdminPage } from "../pages/AdminPage";
import { getGuestUrlFromDb, getGuestTokenFromDb } from "./db-helpers";

interface SetupWishlistResult {
  adminToken: string;
  guestToken: string;
}

interface SetupWishlistWithItemResult {
  adminToken: string;
  guestToken: string;
  guestUrl: string;
  itemId: string;
}

/**
 * Helper function to set up a wishlist (without items) for testing.
 * Returns adminToken and guestToken.
 */
export async function setupWishlist(
  homePage: HomePage,
  adminPage: AdminPage,
  createdWishlists: string[]
): Promise<SetupWishlistResult> {
  await homePage.goto();
  await homePage.clickCreateWishlist();
  await adminPage.expectToBeOnAdminPage();
  const adminToken = await adminPage.getAdminTokenFromUrl();
  if (!adminToken) {
    throw new Error("Failed to get admin token");
  }
  createdWishlists.push(adminToken);
  await adminPage.waitForLoad();

  const guestToken = await getGuestTokenFromDb(adminToken);
  if (!guestToken) {
    throw new Error("Failed to get guest token");
  }

  return { adminToken, guestToken };
}

/**
 * Helper function to set up a wishlist with one item for testing.
 * Returns adminToken, guestUrl, and itemId.
 */
export async function setupWishlistWithItem(
  homePage: HomePage,
  adminPage: AdminPage,
  createdWishlists: string[],
  itemName: string,
  itemLink?: string,
  itemNotes?: string
): Promise<SetupWishlistWithItemResult> {
  // 1. Create wishlist
  const { adminToken, guestToken } = await setupWishlist(homePage, adminPage, createdWishlists);

  // 2. Add an item
  await adminPage.clickAddItem();
  await adminPage.addItemDialog.fillForm({
    name: itemName,
    link: itemLink || "",
    notes: itemNotes || "",
  });
  await adminPage.addItemDialog.submitAndWaitForClose();
  await adminPage.expectItemVisible(itemName);

  // 3. Get guest URL and item ID
  const guestUrl = await getGuestUrlFromDb(adminToken);
  const itemId = await adminPage.getFirstItemId();

  return { adminToken, guestToken, guestUrl, itemId };
}
