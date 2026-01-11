import { test, expect } from "./fixtures/wishlist.fixture";
import { supabase } from "@/lib/supabase";

test.describe("Admin Item Management", () => {
  test("admin can add an item to wishlist", async ({
    homePage,
    adminPage,
    addItemDialog,
    createdWishlists,
  }) => {
    // 1. Create wishlist
    await homePage.goto();
    await homePage.clickCreateWishlist();

    // 2. Wait for redirect and extract admin token
    await adminPage.expectToBeOnAdminPage();
    const adminToken = await adminPage.getAdminTokenFromUrl();
    expect(adminToken).not.toBeNull();
    createdWishlists.push(adminToken!); // Track for cleanup

    // 3. Wait for page to fully load
    await adminPage.waitForLoad();

    // 4. Open add item dialog
    await adminPage.clickAddItem();

    // 5. Fill in item details and submit
    await addItemDialog.fillForm({
      name: "Wireless Headphones",
      link: "https://example.com/headphones",
      notes: "Black or silver preferred",
    });
    await addItemDialog.submitAndWaitForClose();

    // 6. Verify item appears on the page
    await adminPage.expectItemVisible("Wireless Headphones");
  });
});
