import { test, expect } from "./fixtures/wishlist.fixture";
import { setupWishlist, setupWishlistWithItem } from "./helpers/test-setup";

test.describe("Admin Item Management", () => {
  test("admin can add an item to wishlist and guest can see it", async ({
    context,
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // Test data
    const item = {
      name: "Wireless Headphones",
      link: "https://example.com/headphones",
      notes: "Black or silver preferred",
    };

    // 1. Set up wishlist
    const { guestToken } = await setupWishlist(homePage, adminPage, createdWishlists);

    // 2. Open add item dialog
    await adminPage.clickAddItem();

    // 3. Fill in item details and submit
    await adminPage.addItemDialog.fillForm({
      name: item.name,
      link: item.link,
      notes: item.notes,
    });
    await adminPage.addItemDialog.submitAndWaitForClose();

    // 4. Verify item appears in admin view
    await adminPage.expectItemVisible(item.name);

    // 5. Verify item also appears in guest view
    const guestPage = await context.newPage();
    await guestPage.goto(`/guest/${guestToken}`);
    await guestPage.waitForLoadState("networkidle");
    await expect(guestPage.getByText(item.name)).toBeVisible();

    // Cleanup
    await guestPage.close();
  });

  test("admin can edit an item", async ({
    page,
    context,
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // Test data
    const originalItem = {
      name: "Original Item",
      link: "https://example.com/original",
      notes: "Original notes",
    };
    const updatedItem = {
      name: "Updated Item",
      link: "https://example.com/updated",
      notes: "Updated notes",
    };

    // 1. Set up wishlist with an item
    const { guestToken } = await setupWishlistWithItem(
      homePage,
      adminPage,
      createdWishlists,
      originalItem.name,
      originalItem.link,
      originalItem.notes
    );
    await adminPage.expectItemVisible(originalItem.name);

    // 2. Click edit button on the item
    await adminPage.clickEditItemButton();

    // 3. Update the item in the edit dialog
    await adminPage.editItemDialog.fillForm({
      name: updatedItem.name,
      link: updatedItem.link,
      notes: updatedItem.notes,
    });
    await adminPage.editItemDialog.submitAndWaitForClose();

    // 4. Verify updated item appears in admin view
    await adminPage.expectItemVisible(updatedItem.name);
    
    // 5. Verify original name is no longer visible in admin view
    await expect(page.getByText(originalItem.name)).not.toBeVisible();

    // 6. Verify updated link and notes are present in admin view
    const pageContent = await page.content();
    expect(pageContent).toContain(updatedItem.link);
    expect(pageContent).toContain(updatedItem.notes);
    
    // 7. Verify original link and notes are no longer present in admin view
    expect(pageContent).not.toContain(originalItem.link);
    expect(pageContent).not.toContain(originalItem.notes);

    // 8. Verify updated item also appears in guest view
    const guestPage = await context.newPage();
    await guestPage.goto(`/guest/${guestToken}`);
    await guestPage.waitForLoadState("networkidle");
    await expect(guestPage.getByText(updatedItem.name)).toBeVisible();
    
    // 9. Verify original item name is not visible in guest view
    await expect(guestPage.getByText(originalItem.name)).not.toBeVisible();

    // 10. Verify updated link and notes in guest view
    const guestPageContent = await guestPage.content();
    expect(guestPageContent).toContain(updatedItem.link);
    expect(guestPageContent).toContain(updatedItem.notes);
    expect(guestPageContent).not.toContain(originalItem.link);
    expect(guestPageContent).not.toContain(originalItem.notes);

    // Cleanup
    await guestPage.close();
  });

  test("admin can delete an item", async ({
    context,
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // Test data
    const item = {
      name: "Item to Delete",
      link: "https://example.com/delete",
      notes: "This will be deleted",
    };

    // 1. Set up wishlist with an item
    const { guestToken } = await setupWishlistWithItem(
      homePage,
      adminPage,
      createdWishlists,
      item.name,
      item.link,
      item.notes
    );

    // 2. Open guest page in a new tab to verify item is visible
    const guestPage = await context.newPage();
    await guestPage.goto(`/guest/${guestToken}`);
    await guestPage.waitForLoadState("networkidle");
    await expect(guestPage.getByText(item.name)).toBeVisible();

    // 3. Back to admin page - click delete button on the item
    await adminPage.clickDeleteItemButton();

    // 4. Confirm deletion in the dialog
    await adminPage.deleteItemDialog.confirmAndWaitForClose();

    // 5. Verify item is no longer visible in admin view
    await adminPage.expectItemNotVisible(item.name);

    // 6. Verify item is also no longer visible in guest view
    await guestPage.reload();
    await guestPage.waitForLoadState("networkidle");
    await expect(guestPage.getByText(item.name)).not.toBeVisible();

    // Cleanup
    await guestPage.close();
  });

  test("admin can unreserve any item", async ({
    context,
    homePage,
    adminPage,
    guestPage: guestPageFixture,
    createdWishlists,
  }) => {
    // Test data
    const item = {
      name: "Item to Reserve",
      link: "https://example.com",
      notes: "Test notes",
    };

    // 1. Set up wishlist with an item
    const { guestToken, itemId } = await setupWishlistWithItem(
      homePage,
      adminPage,
      createdWishlists,
      item.name,
      item.link,
      item.notes
    );

    // 2. Open guest page in new context and reserve the item
    const newPage = await context.newPage();
    const { GuestPage } = await import("./pages/GuestPage");
    const guestPage = new GuestPage(newPage);
    await guestPage.goto(guestToken);

    // 3. Reserve the item
    await guestPage.clickReserveButton(itemId);
    await guestPage.confirmReserve();

    // 4. Verify item shows as reserved by me
    await guestPage.expectItemReservedByMe(itemId);

    // 5. Go back to admin page and verify the Reserved badge is visible
    await adminPage.page.reload({ waitUntil: "networkidle" });
    await expect(adminPage.page.getByText("Reserved")).toBeVisible();

    // 6. Click unreserve button and confirm
    await adminPage.clickUnreserveItem(itemId);
    await adminPage.unreserveItemDialog.confirmAndWaitForClose();
    
    // 7. Wait for the action to complete and verify badge is gone
    await expect(adminPage.page.getByText("Reserved")).not.toBeVisible({ timeout: 5000 });

    // 8. Verify guest page shows item as available again
    await guestPage.page.reload({ waitUntil: "networkidle" });
    await guestPage.expectItemAvailable(itemId);

    // Cleanup
    await newPage.close();
  });
});
