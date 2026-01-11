import { test, expect } from "@playwright/test";
import { deleteWishlistAction } from "@/app/actions/wishlist";
import { supabase } from "@/lib/supabase";

test.describe("Create Wishlist Flow", () => {
  test("user can create a wishlist and is redirected to admin page", async ({
    page,
  }) => {
    // 1. Visit homepage
    await page.goto("/", { waitUntil: "networkidle" });

    // 2. Click "Create Wishlist" button
    await page.click('[data-test-id="create-wishlist-button"]');

    // 3. Wait for redirect to admin page
    await page.waitForURL(/\/admin\/[a-f0-9-]+/);

    // 4. Extract admin token from URL
    const url = page.url();
    const adminToken = url.split("/admin/")[1];

    // 5. Verify admin token is a valid UUID
    expect(adminToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    // 6. Verify admin page loaded successfully
    await page.waitForLoadState("networkidle");
    await expect(page.locator('h1:has-text("My Wishlist")')).toBeVisible();

    // 7. Clean up: Delete the wishlist using server action
    try {
      await deleteWishlistAction(adminToken);
    } catch (error) {
      console.error("Failed to clean up test wishlist:", error);
    }
  });

  test("created wishlist persists in database with correct data", async ({
    page,
  }) => {
    // 1. Create wishlist via UI
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.click('[data-test-id="create-wishlist-button"]');
    await page.waitForURL(/\/admin\/[a-f0-9-]+/);

    // 2. Extract admin token from URL
    const url = page.url();
    const adminToken = url.split("/admin/")[1];

    // 3. Query database to verify wishlist exists
    const { data: wishlist, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("admin_token", adminToken)
      .single();

    // 4. Assert: Wishlist exists in database
    expect(error).toBeNull();
    expect(wishlist).toBeDefined();
    expect(wishlist?.admin_token).toBe(adminToken);
    expect(wishlist?.title).toBe("My Wishlist");
    expect(wishlist?.description).toBeNull();

    // 5. Assert: Guest token was also generated
    expect(wishlist?.guest_token).toBeTruthy();
    expect(wishlist?.guest_token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    // 6. Assert: Admin and guest tokens are different
    expect(wishlist?.admin_token).not.toBe(wishlist?.guest_token);

    // 7. Clean up
    await deleteWishlistAction(adminToken);
  });

  test("multiple wishlists can be created with unique tokens", async ({
    page,
  }) => {
    // 1. Create first wishlist
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.click('[data-test-id="create-wishlist-button"]');
    await page.waitForURL(/\/admin\/[a-f0-9-]+/);
    const url1 = page.url();
    const adminToken1 = url1.split("/admin/")[1];

    // 2. Create second wishlist
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.click('[data-test-id="create-wishlist-button"]');
    await page.waitForURL(/\/admin\/[a-f0-9-]+/);
    const url2 = page.url();
    const adminToken2 = url2.split("/admin/")[1];

    // 3. Assert: Different tokens
    expect(adminToken1).not.toBe(adminToken2);

    // 4. Assert: Both wishlists exist in database
    const { data: wishlists, error } = await supabase
      .from("wishlist")
      .select("*")
      .in("admin_token", [adminToken1, adminToken2]);

    expect(error).toBeNull();
    expect(wishlists).toHaveLength(2);

    // 5. Clean up both wishlists
    await deleteWishlistAction(adminToken1);
    await deleteWishlistAction(adminToken2);
  });

  test("admin page shows 404 for invalid token", async ({ page }) => {
    // 1. Visit admin page with fake/invalid token
    const fakeAdminToken = "invalid-token-that-does-not-exist";
    await page.goto(`/admin/${fakeAdminToken}`);
    await page.waitForLoadState("networkidle");

    // 2. Assert: 404 page is shown
    // Check for Next.js default 404 page elements
    const pageContent = await page.textContent("body");
    
    expect(pageContent).toContain("404");
    
    // 3. Assert: Wishlist data is NOT shown
    // The wishlist title element should not exist
    const wishlistTitle = page.getByTestId("wishlist-title");
    await expect(wishlistTitle).not.toBeVisible();
  });

  test("guest can access wishlist page but not see admin controls", async ({ page, context }) => {
    let adminToken: string | null = null;

    try {
      // 1. Create wishlist as admin
      await page.goto("/", { waitUntil: "networkidle" });
      const createButton = page.getByRole('button', { name: 'Create Wishlist' });
      await expect(createButton).toBeVisible({ timeout: 15000 });
      await createButton.click();
      await page.waitForURL(/\/admin\/[a-f0-9-]+/, { timeout: 15000 });

      // 2. Extract admin token from URL
      const adminUrl = page.url();
      const adminMatch = adminUrl.match(/\/admin\/([0-9a-f-]{36})/);
      adminToken = adminMatch ? adminMatch[1] : null;
      expect(adminToken).not.toBeNull();

      // 3. Get guest token from database
      const { data: wishlist } = await supabase
        .from("wishlist")
        .select("guest_token")
        .eq("admin_token", adminToken)
        .single();

      expect(wishlist).toBeDefined();
      expect(wishlist?.guest_token).toBeDefined();
      const guestToken = wishlist?.guest_token;

      // 4. Verify guest token is a valid UUID
      expect(guestToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

      // 5. Verify admin and guest tokens are different
      expect(guestToken).not.toBe(adminToken);

      // 6. Open guest page in new browser context (simulates different user)
      const guestPage = await context.newPage();
      await guestPage.goto(`/guest/${guestToken}`, { waitUntil: "domcontentloaded" });

      // 7. Assert: Guest page loads successfully (shows mock data for now)
      // Wait for title using text content (more reliable for hydration)
      await expect(guestPage.getByRole('heading', { name: /My Wishlist/i })).toBeVisible({ timeout: 15000 });
      await expect(guestPage).toHaveTitle(/Wishlist/i);

      // 8. Verify guest does NOT see admin controls
      const addItemButton = guestPage.getByTestId("add-item-button");
      await expect(addItemButton).not.toBeVisible();

      // 9. Verify guest does NOT see edit wishlist button
      const editWishlistButton = guestPage.getByTestId("edit-wishlist-button");
      await expect(editWishlistButton).not.toBeVisible();

      // 10. Verify guest does NOT see "Share with Guests" section
      const shareSection = guestPage.getByText(/Share with Guests/i);
      await expect(shareSection).not.toBeVisible();

      // 11. Verify guest does NOT see copy link button
      const copyLinkButton = guestPage.getByTestId("copy-link-button");
      await expect(copyLinkButton).not.toBeVisible();

      // 12. Verify guest does NOT see edit/delete buttons for items
      const editItemButton = guestPage.getByTestId("edit-item-button");
      await expect(editItemButton).not.toBeVisible();
      
      const deleteItemButton = guestPage.getByTestId("delete-item-button");
      await expect(deleteItemButton).not.toBeVisible();

      // Cleanup guest page
      await guestPage.close();
    } finally {
      // Cleanup wishlist
      if (adminToken) {
        await deleteWishlistAction(adminToken);
      }
    }
  });
});
