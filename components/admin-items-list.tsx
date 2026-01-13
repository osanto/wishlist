"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DeleteItemDialog } from "@/components/delete-item-dialog";
import { EditItemDialog } from "@/components/edit-item-dialog";
import { UnreserveItemDialog } from "@/components/unreserve-item-dialog";
import { ItemCard } from "@/components/item-card";
import {
  editItemAction,
  deleteItemAction,
  unreserveItemAction,
} from "@/app/actions/items";

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
  const [unreservingItem, setUnreservingItem] = useState<Item | null>(null);
  const [isUnreserveDialogOpen, setIsUnreserveDialogOpen] = useState(false);
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
        toast.error(result.error);
      } else {
        setIsEditDialogOpen(false);
        toast.success("Item updated!");
      }
    });
  };

  const handleDelete = (item: Item) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (itemId: string) => {
    startTransition(async () => {
      const result = await deleteItemAction(adminToken, itemId);

      if (result.error) {
        toast.error(result.error);
      } else {
        setIsDeleteDialogOpen(false);
        toast.success("Item deleted!");
      }
    });
  };

  const handleUnreserve = (item: Item) => {
    setUnreservingItem(item);
    setIsUnreserveDialogOpen(true);
  };

  const handleUnreserveConfirm = async () => {
    if (!unreservingItem) return;

    startTransition(async () => {
      const result = await unreserveItemAction(adminToken, unreservingItem.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        setIsUnreserveDialogOpen(false);
        toast.success("Reservation removed!");
      }
    });
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
            onUnreserve={() => handleUnreserve(item)}
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

      <UnreserveItemDialog
        open={isUnreserveDialogOpen}
        onOpenChange={setIsUnreserveDialogOpen}
        itemName={unreservingItem?.name || ""}
        onConfirm={handleUnreserveConfirm}
      />
    </>
  );
}
