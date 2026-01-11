import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { GuestItemsList } from "@/components/guest-items-list";
import { PageHeader } from "@/components/page-header";
import { getWishlistByGuestToken } from "@/lib/wishlist";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View and reserve wishlist items",
};

// Mock items for Phase 1 (will be replaced with real items later)
const mockItems = [
  {
    id: "1",
    name: "Wireless Headphones",
    link: "https://example.com/headphones",
    price: "$99.99",
    notes: "Prefer black or silver color",
    isReserved: false,
    reservedByToken: null,
  },
  {
    id: "2",
    name: "Coffee Maker",
    link: "https://example.com/coffee",
    price: "$149.99",
    notes: "",
    isReserved: true,
    reservedByToken: "other-user-token",
  },
  {
    id: "3",
    name: "Book Set",
    link: "https://example.com/books",
    price: "$45.00",
    notes: "Fantasy series preferred",
    isReserved: true,
    reservedByToken: "my-mock-reservation-token", // This simulates user's own reservation
  },
];

// Simulate the current user's reservation token (in real app, this comes from localStorage)
const currentUserReservationToken = "my-mock-reservation-token";

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

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl p-6 space-y-8">
        <PageHeader
          title={wishlist.title}
          description={wishlist.description || undefined}
        />

          {/* Items Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Items</h2>

            {mockItems.length === 0 ? (
              <EmptyState
                title="No items yet"
                description="The wishlist owner hasn't added any items yet"
              />
            ) : (
              <GuestItemsList
                items={mockItems}
                currentUserReservationToken={currentUserReservationToken}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
