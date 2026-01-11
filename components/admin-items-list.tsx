"use client";

import { useState, useTransition } from "react";

import { DeleteItemDialog } from "@/components/delete-item-dialog";
import { EditItemDialog } from "@/components/edit-item-dialog";
import { ItemCard } from "@/components/item-card";
import { editItemAction } from "@/app/actions/items";

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
  adminToken: string;
}

export function AdminItemsList({ items, adminToken }: AdminItemsListProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (
    itemId: string,
    data: {
      name: string;
      link?: string;
      notes?: string;
    }
  ) => {
    startTransition(async () => {
      const result = await editItemAction(adminToken, {
        itemId,
        name: data.name,
        link: data.link || "",
        notes: data.notes || "",
      });

      if (result.error) {
        // TODO: Show error toast
        console.error("Error editing item:", result.error);
        alert(`Error: ${result.error}`);
      } else {
        // Success - page will automatically refresh due to revalidatePath
        console.log("Item updated successfully:", result.data);
        setIsEditDialogOpen(false);
      }
    });
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
