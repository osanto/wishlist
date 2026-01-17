import { test, expect } from "./fixtures/wishlist.fixture";
import { setupWishlist, setupWishlistWithItem } from "./helpers/test-setup";
import { GuestPage } from "./pages/GuestPage";

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
    const { guestToken } = await setupWishlist(
      homePage,
      adminPage,
      createdWishlists
    );

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
    await adminPage.assertions.expectItemVisible(item.name);

    // 5. Verify item also appears in guest view
    const guestPageContext = await context.newPage();
    const guestPage = new GuestPage(guestPageContext);
    await guestPage.goto(guestToken);
    await guestPage.assertions.expectItemVisible(item.name);

    // Cleanup
    await guestPageContext.close();
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
    await adminPage.assertions.expectItemVisible(originalItem.name);

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
    await adminPage.assertions.expectItemVisible(updatedItem.name);

    // 5. Verify original name is no longer visible in admin view
    await adminPage.assertions.expectItemNotVisible(originalItem.name);

    // 6. Verify updated link and notes are present in admin view
    await adminPage.assertions.expectItemLinkVisible(updatedItem.link);
    await adminPage.assertions.expectItemNotesVisible(updatedItem.notes);

    // 7. Verify original link and notes are no longer present in admin view
    await adminPage.assertions.expectItemLinkNotVisible(originalItem.link);
    await adminPage.assertions.expectItemNotesNotVisible(originalItem.notes);

    // 8. Verify updated item also appears in guest view
    const guestPageContext = await context.newPage();
    const guestPage = new GuestPage(guestPageContext);
    await guestPage.goto(guestToken);
    await guestPage.assertions.expectItemVisible(updatedItem.name);

    // 9. Verify original item name is not visible in guest view
    await guestPage.assertions.expectItemNotVisible(originalItem.name);

    // 10. Verify updated link and notes in guest view
    await guestPage.assertions.expectItemLinkVisible(updatedItem.link);
    await guestPage.assertions.expectItemNotesVisible(updatedItem.notes);
    await guestPage.assertions.expectItemLinkNotVisible(originalItem.link);
    await guestPage.assertions.expectItemNotesNotVisible(originalItem.notes);

    // Cleanup
    await guestPageContext.close();
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
    const guestPageContext = await context.newPage();
    const guestPage = new GuestPage(guestPageContext);
    await guestPage.goto(guestToken);
    await guestPage.assertions.expectItemVisible(item.name);

    // 3. Back to admin page - click delete button on the item
    await adminPage.clickDeleteItemButton();

    // 4. Confirm deletion in the dialog
    await adminPage.deleteItemDialog.confirmAndWaitForClose();

    // 5. Verify item is no longer visible in admin view
    await adminPage.assertions.expectItemNotVisible(item.name);

    // 6. Verify item is also no longer visible in guest view
    await guestPageContext.reload();
    await guestPageContext.waitForLoadState("networkidle");
    await guestPage.assertions.expectItemNotVisible(item.name);

    // Cleanup
    await guestPageContext.close();
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
    const guestPage = new GuestPage(newPage);
    await guestPage.goto(guestToken);

    // 3. Reserve the item
    await guestPage.clickReserveButton(itemId);
    await guestPage.confirmReserve();

    // 4. Verify item shows as reserved by me
    await guestPage.expectItemReservedByMe(itemId);

    // 5. Go back to admin page and verify the Reserved badge is visible
    await adminPage.page.reload({ waitUntil: "networkidle" });
    await adminPage.expectReservedBadgeVisible();

    // 6. Click unreserve button and confirm
    await adminPage.clickUnreserveItem(itemId);
    await adminPage.unreserveItemDialog.confirmAndWaitForClose();

    // 7. Wait for the action to complete and verify badge is gone
    await adminPage.expectReservedBadgeNotVisible();

    // 8. Verify guest page shows item as available again
    await guestPage.page.reload({ waitUntil: "networkidle" });
    await guestPage.expectItemAvailable(itemId);

    // Cleanup
    await newPage.close();
  });

  test("item link opens in new tab on admin and guest pages", async ({
    context,
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // Test data
    const item = {
      name: "Test Item with Link",
      link: "https://example.com/test-item",
      notes: "Test notes",
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

    // 2. Verify link is visible in admin view
    await adminPage.assertions.expectItemLinkVisible(item.link);

    // 3. Click the "View Item" link on admin page and wait for new page
    const [adminLinkPage] = await Promise.all([
      context.waitForEvent("page"),
      adminPage.page.locator(`a[href="${item.link}"]`).click(),
    ]);

    // 4. Verify new page opened with correct URL
    await expect(adminLinkPage).toHaveURL(item.link);
    await adminLinkPage.close();

    // 5. Open guest page and verify link works there too
    const guestPageContext = await context.newPage();
    const guestPage = new GuestPage(guestPageContext);
    await guestPage.goto(guestToken);
    await guestPage.assertions.expectItemLinkVisible(item.link);

    // 6. Click the "View Item" link on guest page and wait for new page
    const [guestLinkPage] = await Promise.all([
      context.waitForEvent("page"),
      guestPageContext.locator(`a[href="${item.link}"]`).click(),
    ]);

    // 7. Verify new page opened with correct URL
    await expect(guestLinkPage).toHaveURL(item.link);

    // 8. Cleanup
    await guestLinkPage.close();
    await guestPageContext.close();
  });
});
