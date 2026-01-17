"use client";

import { useState } from "react";

import { Pencil1Icon } from "@radix-ui/react-icons";

import { EditWishlistDialog } from "@/components/edit-wishlist-dialog";
import { ShareLinkSection } from "@/components/share-link-section";

interface PageHeaderClientProps {
  wishlist: {
    id: string;
    title: string;
    description?: string;
  };
  shareUrl?: string;
  onEditWishlist: (
    wishlistId: string,
    data: { title: string; description?: string }
  ) => void;
}

export function PageHeaderClient({
  wishlist,
  shareUrl,
  onEditWishlist,
}: PageHeaderClientProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (
    wishlistId: string,
    data: { title: string; description?: string }
  ) => {
    onEditWishlist(wishlistId, data);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold" data-test-id="wishlist-title">
            {wishlist.title}
          </h1>
          <button
            onClick={() => setIsEditDialogOpen(true)}
            data-test-id="edit-wishlist-button"
            aria-label="Edit wishlist"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil1Icon />
          </button>
        </div>
        {wishlist.description && (
          <p className="text-muted-foreground">{wishlist.description}</p>
        )}
        {shareUrl && (
          <div className="mt-6 rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Share with Guests</h2>
            <ShareLinkSection guestUrl={shareUrl} />
          </div>
        )}
      </div>

      <EditWishlistDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        wishlist={wishlist}
        onEdit={handleEdit}
      />
    </>
  );
}
