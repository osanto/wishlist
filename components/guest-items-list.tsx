"use client";

import { useState } from "react";

import { ItemCard } from "@/components/item-card";
import { ReserveItemModal } from "@/components/reserve-item-modal";

interface Item {
  id: string;
  name: string;
  link?: string;
  notes?: string;
  isReserved: boolean;
  reservedByToken: string | null;
}

interface GuestItemsListProps {
  items: Item[];
  currentUserReservationToken: string;
}

export function GuestItemsList({
  items,
  currentUserReservationToken,
}: GuestItemsListProps) {
  const [reservingItem, setReservingItem] = useState<Item | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  const handleReserve = (item: Item) => {
    setReservingItem(item);
    setIsReserveModalOpen(true);
  };

  const handleReserveConfirm = (itemId: string) => {
    // TODO: Reserve item in mock store (Phase 1.3)
    console.log("Reserve item:", itemId);
  };

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => {
          const isReservedByMe =
            item.isReserved &&
            item.reservedByToken === currentUserReservationToken;
          const isReservedByOther =
            item.isReserved &&
            item.reservedByToken !== currentUserReservationToken;

          let reservationStatus:
            | "available"
            | "reserved-by-me"
            | "reserved-by-other" = "available";
          if (isReservedByMe) {
            reservationStatus = "reserved-by-me";
          } else if (isReservedByOther) {
            reservationStatus = "reserved-by-other";
          }

          return (
            <ItemCard
              key={item.id}
              item={item}
              variant="guest"
              reservationStatus={reservationStatus}
              onReserve={() => handleReserve(item)}
              onCancelReservation={() => {
                // TODO: Handle cancel reservation
              }}
            />
          );
        })}
      </div>

      <ReserveItemModal
        open={isReserveModalOpen}
        onOpenChange={setIsReserveModalOpen}
        item={reservingItem}
        onReserve={handleReserveConfirm}
      />
    </>
  );
}
