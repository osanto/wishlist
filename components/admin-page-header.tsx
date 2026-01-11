"use client";

import { useTransition } from "react";

import { PageHeaderClient } from "@/components/page-header-client";
import { editWishlistAction } from "@/app/actions/wishlist";

interface AdminPageHeaderProps {
  wishlist: {
    id: string;
    title: string;
    description?: string;
  };
  shareUrl: string;
  adminToken: string;
}

export function AdminPageHeader({
  wishlist,
  shareUrl,
  adminToken,
}: AdminPageHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleEditWishlist = async (
    wishlistId: string,
    data: { title: string; description?: string }
  ) => {
    startTransition(async () => {
      const result = await editWishlistAction(adminToken, {
        title: data.title,
        description: data.description,
      });

      if (result.error) {
        console.error("Error editing wishlist:", result.error);
        alert(`Error: ${result.error}`);
      } else {
        console.log("Wishlist updated successfully");
      }
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

