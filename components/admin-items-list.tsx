"use client";

import { useState } from "react";

import { DeleteItemDialog } from "@/components/delete-item-dialog";
import { EditItemDialog } from "@/components/edit-item-dialog";
import { ItemCard } from "@/components/item-card";

interface Item {
  id: string;
  name: string;
  link?: string;
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
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (itemId: string, data: {
    name: string;
    link?: string;
    notes?: string;
  }) => {
    // TODO: Update item in mock store (Phase 1.3)
    console.log("Edit item:", itemId, data);
  };

  const handleDelete = (item: Item) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (itemId: string) => {
    // TODO: Delete item from mock store (Phase 1.3)
    console.log("Delete item:", itemId);
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
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>

      <EditItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={editingItem}
        onEdit={handleEditSubmit}
      />

      <DeleteItemDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        item={deletingItem}
        onDelete={handleDeleteConfirm}
      />
    </>
  );
}
