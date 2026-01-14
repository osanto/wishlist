import { test, expect } from "./fixtures/wishlist.fixture";
import { GuestPage } from "./pages/GuestPage";
import { setupWishlistWithItem } from "./helpers/test-setup";

test.describe("Guest Reservations", () => {
  test("guest can reserve, persist, and cancel reservation", async ({
    context,
    homePage,
    adminPage,
    guestPage,
    createdWishlists,
  }) => {
    // Test data
    const item = {
      name: "Wireless Headphones",
      link: "https://example.com/headphones",
      notes: "Black or silver",
    };

    // 1. Set up wishlist with an item
    const { guestUrl, itemId } = await setupWishlistWithItem(
      homePage,
      adminPage,
      createdWishlists,
      item.name,
      item.link,
      item.notes
    );

    // 2. Open guest page in new context (different user)
    const guestContext = await context.browser()!.newContext();
    const guestPageNew = await guestContext.newPage();
    const guest = new GuestPage(guestPageNew);
    await guestPageNew.goto(guestUrl, { waitUntil: "networkidle" });

    // 3. Reserve the item
    await guest.expectItemAvailable(itemId);
    await guest.clickReserveButton(itemId);
    await guest.confirmReserve();

    // 4. Verify "You reserved this" badge is visible
    await guest.expectItemReservedByMe(itemId);

    // 5. Reload the page (same browser context, so localStorage persists)
    await guestPageNew.reload({ waitUntil: "networkidle" });

    // 6. Verify "You reserved this" badge is still visible after reload
    await guest.expectItemReservedByMe(itemId);

    // 7. Cancel the reservation
    await guest.clickCancelReservationButton(itemId);
    await guest.confirmCancelReservation();

    // 8. Verify reserve button is visible again
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
    // Test data
    const item = {
      name: "Monitor",
      link: "https://example.com/monitor",
      notes: "27 inch 4K",
    };

    // 1. Set up wishlist with an item
    const { guestUrl, itemId } = await setupWishlistWithItem(
      homePage,
      adminPage,
      createdWishlists,
      item.name,
      item.link,
      item.notes
    );

    // 2. First guest reserves the item
    const guest1Context = await context.browser()!.newContext();
    const guest1Page = await guest1Context.newPage();
    const guest1 = new GuestPage(guest1Page);
    await guest1Page.goto(guestUrl, { waitUntil: "networkidle" });

    await guest1.clickReserveButton(itemId);
    await guest1.confirmReserve();

    // 3. Verify first guest sees "You reserved this"
    await guest1.expectItemReservedByMe(itemId);

    // 4. Second guest opens the page (different browser context = different localStorage)
    const guest2Context = await context.browser()!.newContext();
    const guest2Page = await guest2Context.newPage();
    const guest2 = new GuestPage(guest2Page);
    await guest2Page.goto(guestUrl, { waitUntil: "networkidle" });

    // 5. Verify second guest sees "Reserved" badge (cannot reserve)
    await guest2.expectItemReservedByOther(itemId);

    // Cleanup
    await guest1Context.close();
    await guest2Context.close();
  });
});
