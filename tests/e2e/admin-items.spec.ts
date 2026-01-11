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

  test("admin can edit an item", async ({
    page,
    homePage,
    adminPage,
    addItemDialog,
    editItemDialog,
    createdWishlists,
  }) => {
    // 1. Create wishlist and add an item
    await homePage.goto();
    await homePage.clickCreateWishlist();
    await adminPage.expectToBeOnAdminPage();
    const adminToken = await adminPage.getAdminTokenFromUrl();
    expect(adminToken).not.toBeNull();
    createdWishlists.push(adminToken!);
    await adminPage.waitForLoad();

    // 2. Add initial item
    await adminPage.clickAddItem();
    await addItemDialog.fillForm({
      name: "Original Item",
      link: "https://example.com/original",
      notes: "Original notes",
    });
    await addItemDialog.submitAndWaitForClose();
    await adminPage.expectItemVisible("Original Item");

    // 3. Click edit button on the item
    await adminPage.clickEditItemButton();

    // 4. Update the item in the edit dialog
    await editItemDialog.fillForm({
      name: "Updated Item",
      link: "https://example.com/updated",
      notes: "Updated notes",
    });
    await editItemDialog.submitAndWaitForClose();

    // 5. Verify updated item appears on the page
    await adminPage.expectItemVisible("Updated Item");
    
    // 6. Verify original name is no longer visible
    await expect(page.getByText("Original Item")).not.toBeVisible();

    // 7. Verify updated link and notes are present in the page content
    const pageContent = await page.content();
    expect(pageContent).toContain("https://example.com/updated");
    expect(pageContent).toContain("Updated notes");
    
    // 8. Verify original link and notes are no longer present
    expect(pageContent).not.toContain("https://example.com/original");
    expect(pageContent).not.toContain("Original notes");
  });

  test("admin can delete an item", async ({
    context,
    homePage,
    adminPage,
    addItemDialog,
    deleteItemDialog,
    createdWishlists,
  }) => {
    // 1. Create wishlist and add an item
    await homePage.goto();
    await homePage.clickCreateWishlist();
    await adminPage.expectToBeOnAdminPage();
    const adminToken = await adminPage.getAdminTokenFromUrl();
    expect(adminToken).not.toBeNull();
    createdWishlists.push(adminToken!);
    await adminPage.waitForLoad();

    // 2. Get guest token from database
    const { data: wishlist } = await supabase
      .from("wishlist")
      .select("guest_token")
      .eq("admin_token", adminToken)
      .single();
    const guestToken = wishlist?.guest_token;
    expect(guestToken).not.toBeNull();

    // 3. Add an item
    await adminPage.clickAddItem();
    await addItemDialog.fillForm({
      name: "Item to Delete",
      link: "https://example.com/delete",
      notes: "This will be deleted",
    });
    await addItemDialog.submitAndWaitForClose();
    await adminPage.expectItemVisible("Item to Delete");

    // 4. Open guest page in a new tab to verify item is visible
    const guestPage = await context.newPage();
    await guestPage.goto(`http://localhost:3000/guest/${guestToken}`);
    await guestPage.waitForLoadState("networkidle");
    await expect(guestPage.getByText("Item to Delete")).toBeVisible();

    // 5. Back to admin page - click delete button on the item
    await adminPage.clickDeleteItemButton();

    // 6. Confirm deletion in the dialog
    await deleteItemDialog.confirmAndWaitForClose();

    // 7. Verify item is no longer visible in admin view
    await adminPage.expectItemNotVisible("Item to Delete");

    // 8. Verify item is also no longer visible in guest view
    await guestPage.reload();
    await guestPage.waitForLoadState("networkidle");
    await expect(guestPage.getByText("Item to Delete")).not.toBeVisible();

    // Cleanup
    await guestPage.close();
  });
});
