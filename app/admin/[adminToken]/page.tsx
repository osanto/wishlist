import { type Metadata } from "next";
import { headers } from "next/headers";

import { AdminPageClient } from "@/components/admin-page-client";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "Manage Wishlist | Wishlist",
  description: "Manage your wishlist items",
};

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

  // Get the origin from headers for the full URL
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const guestUrl = `${protocol}://${host}/guest/${mockWishlist.guestToken}`;

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl p-6 space-y-8">
        <AdminPageHeader wishlist={mockWishlist} shareUrl={guestUrl} />

          {/* Items Section */}
          <AdminPageClient items={mockItems} guestUrl={guestUrl} />
        </div>
      </div>
    </>
  );
}
