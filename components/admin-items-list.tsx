"use client";

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
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          variant="admin"
          onEdit={() => {
            // TODO: Open edit dialog
          }}
          onDelete={() => {
            // TODO: Open delete dialog
          }}
        />
      ))}
    </div>
  );
}
