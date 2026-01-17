import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { GuestPageClient } from "@/components/guest-page-client";
import { PageHeader } from "@/components/page-header";
import { TokenHandler } from "@/components/token-handler";
import { getWishlistByGuestToken, getItemsForWishlist } from "@/lib/wishlist";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View and reserve wishlist items",
};

interface GuestPageProps {
  params: Promise<{
    guestToken: string;
  }>;
}

export default async function GuestPage({ params }: GuestPageProps) {
  const { guestToken } = await params;

  // Fetch real wishlist data from database
  const wishlist = await getWishlistByGuestToken(guestToken);

  // Show 404 if wishlist not found
  if (!wishlist) {
    notFound();
  }

  // Fetch real items from database
  const dbItems = await getItemsForWishlist(wishlist.id);

  // Transform database items to match component props
  const items = dbItems.map((item) => ({
    id: item.id,
    name: item.name,
    link: item.link || "",
    notes: item.notes || "",
    isReserved: item.is_reserved,
    reservedByToken: item.reserved_by_token,
  }));

  return (
    <>
      <TokenHandler token={guestToken} type="guest" />
      <AppHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl p-6 space-y-8">
          <PageHeader
            title={wishlist.title}
            description={wishlist.description || undefined}
          />

          {/* Items Section - now using real data from database */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Items</h2>

            {items.length === 0 ? (
              <EmptyState
                title="No items yet"
                description="The wishlist owner hasn't added any items yet"
              />
            ) : (
              <GuestPageClient guestToken={guestToken} items={items} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
