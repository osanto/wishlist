import { type Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AdminPageClient } from "@/components/admin-page-client";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AppHeader } from "@/components/app-header";
import { getWishlistByAdminToken, getItemsForWishlist } from "@/lib/wishlist";

export const metadata: Metadata = {
  title: "Manage Wishlist | Wishlist",
  description: "Manage your wishlist items",
};

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

          {/* Items Section - now using real data from database */}
          <AdminPageClient items={items} guestUrl={guestUrl} adminToken={adminToken} />
        </div>
      </div>
    </>
  );
}
