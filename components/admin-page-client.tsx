"use client";

import { useState } from "react";

import { AddItemDialog } from "@/components/add-item-dialog";
import { AdminItemsList } from "@/components/admin-items-list";

interface Item {
  id: string;
  name: string;
  link?: string;
  price?: string;
  notes?: string;
  isReserved: boolean;
  reservedByToken: string | null;
}

interface AdminPageClientProps {
  items: Item[];
  guestUrl: string;
}

export function AdminPageClient({
  items,
  guestUrl: _guestUrl,
}: AdminPageClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddItem = (data: {
    name: string;
    link?: string;
    notes?: string;
  }) => {
    // TODO: Add item to mock store (Phase 1.3)
    console.log("Add item:", data);
    // Dialog will close automatically
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Items</h2>
          <button
            onClick={() => setIsDialogOpen(true)}
            data-test-id="add-item-button"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
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
          <AdminItemsList items={items} />
        )}
      </div>

      <AddItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAdd={handleAddItem}
      />
    </>
  );
}
