import { type Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AdminPageClient } from "@/components/admin-page-client";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AppHeader } from "@/components/app-header";
import { getWishlistByAdminToken } from "@/lib/wishlist";

export const metadata: Metadata = {
  title: "Manage Wishlist | Wishlist",
  description: "Manage your wishlist items",
};

// Mock items data (still using mock for now - will connect later)
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
  const { adminToken } = await params;

  // Fetch real wishlist from database
  const wishlist = await getWishlistByAdminToken(adminToken);

  // If wishlist not found, show 404
  if (!wishlist) {
    notFound();
  }

  // Get the origin from headers for the full URL
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const guestUrl = `${protocol}://${host}/guest/${wishlist.guest_token}`;

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl p-6 space-y-8">
        <AdminPageHeader 
          wishlist={{
            id: wishlist.id,
            title: wishlist.title,
            description: wishlist.description || undefined,
          }} 
          shareUrl={guestUrl} 
        />

          {/* Items Section - still using mock data for now */}
          <AdminPageClient items={mockItems} guestUrl={guestUrl} />
        </div>
      </div>
    </>
  );
}
