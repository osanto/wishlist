import { test, expect } from "./fixtures/wishlist.fixture";
import { GuestPage } from "./pages/GuestPage";
import { supabase } from "@/lib/supabase";

/**
 * Helper function to get guest URL from database for test setup.
 * Note: This is only used for test setup, not for assertions.
 */
async function getGuestUrlFromDb(adminToken: string): Promise<string> {
  const { data } = await supabase
    .from("wishlist")
    .select("guest_token")
    .eq("admin_token", adminToken)
    .single();
  
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/guest/${data!.guest_token}`;
}

test.describe("Guest Reservation Flow", () => {
  test("guest can reserve, persist, and cancel reservation", async ({
    context,
    homePage,
    adminPage,
    guestPage,
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

    // 2. Add an item
    await adminPage.clickAddItem();
    await adminPage.addItemDialog.fillForm({
      name: "Wireless Headphones",
      link: "https://example.com/headphones",
      notes: "Black or silver",
    });
    await adminPage.addItemDialog.submitAndWaitForClose();
    await adminPage.expectItemVisible("Wireless Headphones");

    // 3. Get the guest URL from database (for test setup) and item ID from the UI
    const guestUrl = await getGuestUrlFromDb(adminToken!);
    const itemId = await adminPage.getFirstItemId();

    // 4. Open guest page in new context (different user)
    const guestContext = await context.browser()!.newContext();
    const guestPageNew = await guestContext.newPage();
    const guest = new GuestPage(guestPageNew);
    await guestPageNew.goto(guestUrl, { waitUntil: "networkidle" });

    // 5. Reserve the item
    await guest.expectItemAvailable(itemId);
    await guest.clickReserveButton(itemId);
    await guest.confirmReserve();

    // 6. Verify "You reserved this" badge is visible
    await guest.expectItemReservedByMe(itemId);

    // 7. Reload the page (same browser context, so localStorage persists)
    await guestPageNew.reload({ waitUntil: "networkidle" });

    // 8. Verify "You reserved this" badge is still visible after reload
    await guest.expectItemReservedByMe(itemId);

    // 9. Cancel the reservation
    await guest.clickCancelReservationButton(itemId);
    await guest.confirmCancelReservation();

    // 10. Verify reserve button is visible again
    await guest.expectItemAvailable(itemId);

    // Cleanup
    await guestContext.close();
  });

  test("other guests see reserved items and cannot reserve them", async ({
    context,
    homePage,
    adminPage,
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

    // 2. Add an item
    await adminPage.clickAddItem();
    await adminPage.addItemDialog.fillForm({
      name: "Monitor",
      link: "https://example.com/monitor",
      notes: "27 inch 4K",
    });
    await adminPage.addItemDialog.submitAndWaitForClose();
    await adminPage.expectItemVisible("Monitor");

    // 3. Get the guest URL from database (for test setup) and item ID from the UI
    const guestUrl = await getGuestUrlFromDb(adminToken!);
    const itemId = await adminPage.getFirstItemId();

    // 4. First guest reserves the item
    const guest1Context = await context.browser()!.newContext();
    const guest1Page = await guest1Context.newPage();
    const guest1 = new GuestPage(guest1Page);
    await guest1Page.goto(guestUrl, { waitUntil: "networkidle" });

    await guest1.clickReserveButton(itemId);
    await guest1.confirmReserve();

    // 5. Verify first guest sees "You reserved this"
    await guest1.expectItemReservedByMe(itemId);

    // 6. Second guest opens the page (different browser context = different localStorage)
    const guest2Context = await context.browser()!.newContext();
    const guest2Page = await guest2Context.newPage();
    const guest2 = new GuestPage(guest2Page);
    
    // Wait a bit to ensure revalidation has completed
    await guest1Page.waitForTimeout(1000);
    
    await guest2Page.goto(guestUrl, { waitUntil: "networkidle" });

    // 7. Verify second guest sees "Reserved" badge (cannot reserve)
    await guest2.expectItemReservedByOther(itemId);

    // Cleanup
    await guest1Context.close();
    await guest2Context.close();
  });
});
