import { test, expect } from "./fixtures/wishlist.fixture";
import { setupWishlist } from "./helpers/test-setup";
import { GuestPage } from "./pages/GuestPage";

test.describe("Wishlist Management", () => {
  test("user can create a wishlist, is redirected, and wishlist persists after refresh", async ({
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // 1. Set up wishlist (creates and verifies redirect)
    await setupWishlist(homePage, adminPage, createdWishlists);

    // 2. Verify admin page loaded with default title
    await adminPage.expectWishlistTitle("My Wishlist");

    // 3. Refresh the page to verify wishlist persists
    await adminPage.page.reload({ waitUntil: "networkidle" });

    // 4. Verify wishlist is still there after refresh
    await adminPage.expectWishlistTitle("My Wishlist");
    await adminPage.expectEmptyState();
  });

  test("admin can edit wishlist title and description", async ({
    context,
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // Test data
    const updatedTitle = "Birthday Wishlist 2026";
    const updatedDescription = "Things I'd love for my birthday!";

    // 1. Set up wishlist
    const { guestToken } = await setupWishlist(
      homePage,
      adminPage,
      createdWishlists
    );

    // 2. Verify default title
    await adminPage.expectWishlistTitle("My Wishlist");

    // 3. Open edit wishlist dialog
    await adminPage.clickEditWishlist();
    await adminPage.editWishlistDialog.expectDialogOpen();

    // 4. Edit title and description
    await adminPage.editWishlistDialog.fillForm({
      title: updatedTitle,
      description: updatedDescription,
    });
    await adminPage.editWishlistDialog.submitAndWaitForClose();

    // 5. Verify updated title appears in admin view
    await adminPage.expectWishlistTitle(updatedTitle);

    // 6. Refresh page to verify changes persist
    await adminPage.page.reload({ waitUntil: "networkidle" });
    await adminPage.expectWishlistTitle(updatedTitle);

    // 7. Verify updated title also appears in guest view
    const guestPageContext = await context.newPage();
    const guestPage = new GuestPage(guestPageContext);
    await guestPageContext.goto(`/guest/${guestToken}`, {
      waitUntil: "networkidle",
    });

    await guestPage.expectWishlistTitle(updatedTitle);

    // 8. Verify description appears in guest view (if displayed)
    await guestPage.assertions.expectTextVisible(updatedDescription);

    // Cleanup
    await guestPageContext.close();
  });
});

test.describe("404 Error Handling", () => {
  test("admin page shows 404 for invalid token", async ({
    page,
    adminPage,
  }) => {
    // Test data
    const invalidToken = "invalid-token-that-does-not-exist";

    // 1. Visit admin page with invalid token
    await page.goto(`/admin/${invalidToken}`);
    await page.waitForLoadState("networkidle");

    // 2. Verify 404 page is shown
    await adminPage.assertions.expect404Page();

    // 3. Verify wishlist data is NOT shown
    await adminPage.expectWishlistTitleNotVisible();
  });

  test("guest page shows 404 for invalid token", async ({
    page,
    guestPage,
  }) => {
    // Test data
    const invalidToken = "invalid-token-that-does-not-exist";

    // 1. Visit guest page with invalid token
    await page.goto(`/guest/${invalidToken}`);
    await page.waitForLoadState("networkidle");

    // 2. Verify 404 page is shown
    await guestPage.assertions.expect404Page();

    // 3. Verify wishlist data is NOT shown
    await guestPage.expectWishlistTitleNotVisible();
  });
});

test.describe("Guest Access", () => {
  test("guest can access wishlist page but not see admin controls", async ({
    context,
    homePage,
    adminPage,
    guestPage,
    createdWishlists,
  }) => {
    // 1. Set up wishlist
    const { guestToken } = await setupWishlist(
      homePage,
      adminPage,
      createdWishlists
    );

    // 2. Open guest page in new browser context (simulates different user)
    const guestPageContext = await context.newPage();
    const guestPageObject = new GuestPage(guestPageContext);

    // 3. Navigate to guest page
    await guestPageObject.goto(guestToken);

    // 4. Verify guest page loads and shows wishlist
    await guestPageObject.expectPageLoaded();
    await guestPageObject.expectWishlistTitle("My Wishlist");

    // 5. Verify no admin controls are visible
    await guestPageObject.expectNoAdminControls();

    // Cleanup
    await guestPageContext.close();
  });
});
