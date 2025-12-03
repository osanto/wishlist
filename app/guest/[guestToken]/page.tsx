import { GuestItemsList } from "@/components/guest-items-list";
import { PageHeader } from "@/components/page-header";

// Mock data for Phase 1
const mockWishlist = {
  id: "mock-wishlist-id",
  title: "My Wishlist",
  description: "Things I'd love to receive!",
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
  const { guestToken: _guestToken } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-6 space-y-8">
        <PageHeader
          title={mockWishlist.title}
          description={mockWishlist.description}
        />

        {/* Items Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Items</h2>

          {mockItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <h3 className="text-lg font-medium">No items yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                The wishlist owner hasn&apos;t added any items yet
              </p>
            </div>
          ) : (
            <GuestItemsList
              items={mockItems}
              currentUserReservationToken={currentUserReservationToken}
            />
          )}
        </div>
      </div>
    </div>
  );
}
