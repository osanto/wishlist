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
});
