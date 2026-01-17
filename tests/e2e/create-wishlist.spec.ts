import { test, expect } from "./fixtures/wishlist.fixture";
import { supabase } from "@/lib/supabase";

test.describe("Create Wishlist Flow", () => {
  test("user can create a wishlist and is redirected to admin page", async ({
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // 1. Visit homepage and create wishlist
    await homePage.goto();
    await homePage.clickCreateWishlist();

    // 2. Verify redirect to admin page
    await adminPage.expectToBeOnAdminPage();
    await adminPage.waitForLoad();

    // 3. Extract and verify admin token
    const adminToken = await adminPage.getAdminTokenFromUrl();
    expect(adminToken).not.toBeNull();
    expect(adminToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    createdWishlists.push(adminToken!);

    // 4. Verify admin page loaded with default title
    await adminPage.expectWishlistTitle("My Wishlist");
  });

  test("created wishlist persists in database with correct data", async ({
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // 1. Create wishlist via UI
    await homePage.goto();
    await homePage.clickCreateWishlist();
    await adminPage.expectToBeOnAdminPage();

    // 2. Extract admin token
    const adminToken = await adminPage.getAdminTokenFromUrl();
    expect(adminToken).not.toBeNull();
    createdWishlists.push(adminToken!);

    // 3. Query database to verify wishlist exists
    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("admin_token", adminToken)
      .single();

    // 4. Verify wishlist data
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.title).toBe("My Wishlist");
    expect(data?.admin_token).toBe(adminToken);
    expect(data?.guest_token).toMatch(/^[0-9a-f-]{36}$/i);
    expect(data?.admin_token).not.toBe(data?.guest_token);
  });

  test("multiple wishlists can be created with unique tokens", async ({
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // 1. Create first wishlist
    await homePage.goto();
    await homePage.clickCreateWishlist();
    await adminPage.expectToBeOnAdminPage();
    const adminToken1 = await adminPage.getAdminTokenFromUrl();
    expect(adminToken1).not.toBeNull();
    createdWishlists.push(adminToken1!);

    // 2. Create second wishlist
    await homePage.goto();
    await homePage.clickCreateWishlist();
    await adminPage.expectToBeOnAdminPage();
    const adminToken2 = await adminPage.getAdminTokenFromUrl();
    expect(adminToken2).not.toBeNull();
    createdWishlists.push(adminToken2!);

    // 3. Verify tokens are different
    expect(adminToken1).not.toBe(adminToken2);

    // 4. Verify both exist in database
    const { data: wishlist1 } = await supabase
      .from("wishlist")
      .select("id")
      .eq("admin_token", adminToken1)
      .single();
    const { data: wishlist2 } = await supabase
      .from("wishlist")
      .select("id")
      .eq("admin_token", adminToken2)
      .single();

    expect(wishlist1).toBeDefined();
    expect(wishlist2).toBeDefined();
  });

  test("admin page shows 404 for invalid token", async ({ page }) => {
    // 1. Visit admin page with invalid token
    const fakeAdminToken = "invalid-token-that-does-not-exist";
    await page.goto(`/admin/${fakeAdminToken}`);
    await page.waitForLoadState("networkidle");

    // 2. Verify 404 page is shown
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("404");

    // 3. Verify wishlist data is NOT shown
    const wishlistTitle = page.getByTestId("wishlist-title");
    await expect(wishlistTitle).not.toBeVisible();
  });

  test("guest can access wishlist page but not see admin controls", async ({
    context,
    homePage,
    adminPage,
    guestPage,
    createdWishlists,
  }) => {
    // 1. Create wishlist as admin
    await homePage.goto();
    await homePage.clickCreateWishlist();
    await adminPage.expectToBeOnAdminPage();

    // 2. Extract admin token
    const adminToken = await adminPage.getAdminTokenFromUrl();
    expect(adminToken).not.toBeNull();
    createdWishlists.push(adminToken!);

    // 3. Get guest token from database
    const { data: wishlist } = await supabase
      .from("wishlist")
      .select("guest_token")
      .eq("admin_token", adminToken)
      .single();

    expect(wishlist).toBeDefined();
    expect(wishlist?.guest_token).toBeDefined();
    const guestToken = wishlist?.guest_token;

    // 4. Open guest page in new browser context (simulates different user)
    const guestPageContext = await context.newPage();
    const guestPageObject = new (await import("./pages/GuestPage")).GuestPage(
      guestPageContext
    );

    // 5. Navigate to guest page
    await guestPageObject.goto(guestToken!);

    // 6. Verify guest page loads and shows wishlist
    await guestPageObject.expectPageLoaded();
    await guestPageObject.expectWishlistTitle("My Wishlist");

    // 7. Verify no admin controls are visible
    await guestPageObject.expectNoAdminControls();

    // Cleanup
    await guestPageContext.close();
  });

  test("admin can edit wishlist title and description", async ({
    context,
    homePage,
    adminPage,
    createdWishlists,
  }) => {
    // 1. Create wishlist
    await homePage.goto();
    await homePage.clickCreateWishlist();
    await adminPage.expectToBeOnAdminPage();
    await adminPage.waitForLoad();

    // 2. Extract admin token
    const adminToken = await adminPage.getAdminTokenFromUrl();
    expect(adminToken).not.toBeNull();
    createdWishlists.push(adminToken!);

    // 3. Verify default title
    await adminPage.expectWishlistTitle("My Wishlist");

    // 4. Get guest token from database
    const { data: wishlist } = await supabase
      .from("wishlist")
      .select("guest_token")
      .eq("admin_token", adminToken)
      .single();
    const guestToken = wishlist?.guest_token;
    expect(guestToken).not.toBeNull();

    // 5. Open edit wishlist dialog
    await adminPage.clickEditWishlist();
    await adminPage.editWishlistDialog.expectDialogOpen();

    // 6. Edit title and description
    await adminPage.editWishlistDialog.fillForm({
      title: "Birthday Wishlist 2026",
      description: "Things I'd love for my birthday!",
    });
    await adminPage.editWishlistDialog.submitAndWaitForClose();

    // 7. Verify updated title appears in admin view
    await adminPage.expectWishlistTitle("Birthday Wishlist 2026");

    // 8. Verify changes persist in database
    const { data: updatedWishlist } = await supabase
      .from("wishlist")
      .select("title, description")
      .eq("admin_token", adminToken)
      .single();

    expect(updatedWishlist?.title).toBe("Birthday Wishlist 2026");
    expect(updatedWishlist?.description).toBe(
      "Things I'd love for my birthday!"
    );

    // 9. Verify updated title also appears in guest view
    const guestPageContext = await context.newPage();
    await guestPageContext.goto(`/guest/${guestToken}`, {
      waitUntil: "networkidle",
    });

    const guestWishlistTitle = guestPageContext.locator(
      '[data-test-id="wishlist-title"]'
    );
    await expect(guestWishlistTitle).toHaveText("Birthday Wishlist 2026");

    // Cleanup
    await guestPageContext.close();
  });
});
