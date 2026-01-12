"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AddItemDialog } from "@/components/add-item-dialog";
import { AdminItemsList } from "@/components/admin-items-list";
import { EmptyState } from "@/components/empty-state";
import { addItemAction } from "@/app/actions/items";

interface Item {
  id: string;
  name: string;
  link?: string;
  notes?: string;
  isReserved: boolean;
  reservedByToken: string | null;
}

interface AdminPageClientProps {
  items: Item[];
  guestUrl: string;
  adminToken: string;
}

export function AdminPageClient({
  items,
  guestUrl: _guestUrl,
  adminToken,
}: AdminPageClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddItem = async (data: {
    name: string;
    link?: string;
    notes?: string;
  }) => {
    startTransition(async () => {
      const result = await addItemAction(adminToken, {
        name: data.name,
        link: data.link || "",
        notes: data.notes || "",
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setIsDialogOpen(false);
        toast.success("Item added!");
      }
    });
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
          <EmptyState
            title="No items yet"
            description='Click "Add Item" to start building your wishlist'
            testId="empty-state"
          />
        ) : (
          <AdminItemsList items={items} adminToken={adminToken} />
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
