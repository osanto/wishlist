"use client";

import { useState } from "react";

import { PageHeaderClient } from "@/components/page-header-client";

interface AdminPageHeaderProps {
  wishlist: {
    id: string;
    title: string;
    description?: string;
  };
  shareUrl: string;
}

export function AdminPageHeader({
  wishlist: initialWishlist,
  shareUrl,
}: AdminPageHeaderProps) {
  const [wishlist, setWishlist] = useState(initialWishlist);

  const handleEditWishlist = (
    wishlistId: string,
    data: { title: string; description?: string }
  ) => {
    // TODO: Update wishlist in mock store (Phase 1.3)
    console.log("Edit wishlist:", wishlistId, data);
    setWishlist({
      ...wishlist,
      title: data.title,
      description: data.description,
    });
  };

  return (
    <PageHeaderClient
      wishlist={wishlist}
      shareUrl={shareUrl}
      onEditWishlist={handleEditWishlist}
    />
  );
}

