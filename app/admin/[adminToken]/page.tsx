"use client";

import { ItemCard } from "@/components/item-card";

// Mock data for Phase 1
const mockWishlist = {
  id: "mock-wishlist-id",
  title: "My Wishlist",
  description: "Things I'd love to receive!",
  guestToken: "mock-guest-token",
};

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
    reservedByToken: "some-reservation-token",
  },
];

interface AdminPageProps {
  params: Promise<{
    adminToken: string;
  }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { adminToken: _adminToken } = await params;

  const guestUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/guest/${mockWishlist.guestToken}`
      : `/guest/${mockWishlist.guestToken}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" data-test-id="wishlist-title">
            {mockWishlist.title}
          </h1>
          <p className="text-muted-foreground">{mockWishlist.description}</p>
        </div>

        {/* Share Link Section */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Share with Guests</h2>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={guestUrl}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              data-test-id="guest-link-input"
            />
            <button
              data-test-id="copy-link-button"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Items</h2>
            <button
              data-test-id="add-item-button"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add Item
            </button>
          </div>

          {mockItems.length === 0 ? (
            <div
              className="rounded-lg border border-dashed p-12 text-center"
              data-test-id="empty-state"
            >
              <h3 className="text-lg font-medium">No items yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Click &quot;Add Item&quot; to start building your wishlist
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  variant="admin"
                  onEdit={() => {
                    // TODO: Open edit dialog
                  }}
                  onDelete={() => {
                    // TODO: Open delete dialog
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
