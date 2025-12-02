import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist | View & Reserve",
  description: "View wishlist and reserve items",
};

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
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" data-test-id="wishlist-title">
            {mockWishlist.title}
          </h1>
          <p className="text-muted-foreground">{mockWishlist.description}</p>
        </div>

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
            <div className="space-y-4">
              {mockItems.map((item) => {
                const isReservedByMe =
                  item.isReserved &&
                  item.reservedByToken === currentUserReservationToken;
                const isReservedByOther =
                  item.isReserved &&
                  item.reservedByToken !== currentUserReservationToken;

                return (
                  <div
                    key={item.id}
                    data-test-id={`item-card-${item.id}`}
                    className="rounded-lg border bg-card p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          {isReservedByMe && (
                            <span
                              data-test-id={`you-reserved-badge-${item.id}`}
                              className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground"
                            >
                              You reserved this
                            </span>
                          )}
                          {isReservedByOther && (
                            <span
                              data-test-id={`reserved-badge-${item.id}`}
                              className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                            >
                              Reserved
                            </span>
                          )}
                        </div>
                        {item.price && (
                          <p className="text-sm font-medium">{item.price}</p>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Item
                          </a>
                        )}
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      {!isReservedByOther && (
                        <div>
                          {isReservedByMe ? (
                            <button
                              data-test-id={`cancel-reservation-${item.id}`}
                              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              Cancel Reservation
                            </button>
                          ) : (
                            <button
                              data-test-id={`reserve-button-${item.id}`}
                              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                              Reserve
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
