"use client";

import { useState } from "react";

import { EditItemDialog } from "@/components/edit-item-dialog";
import { ItemCard } from "@/components/item-card";

interface Item {
  id: string;
  name: string;
  link?: string;
  price?: string;
  notes?: string;
  isReserved: boolean;
  reservedByToken: string | null;
}

interface AdminItemsListProps {
  items: Item[];
}

export function AdminItemsList({ items }: AdminItemsListProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (itemId: string, data: {
    name: string;
    link?: string;
    price?: string;
    notes?: string;
  }) => {
    // TODO: Update item in mock store (Phase 1.3)
    console.log("Edit item:", itemId, data);
  };

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            variant="admin"
            onEdit={() => handleEdit(item)}
            onDelete={() => {
              // TODO: Open delete dialog
            }}
          />
        ))}
      </div>

      <EditItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={editingItem}
        onEdit={handleEditSubmit}
      />
    </>
  );
}
