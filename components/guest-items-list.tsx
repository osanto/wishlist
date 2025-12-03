"use client";

import { useState } from "react";

import { CancelReservationDialog } from "@/components/cancel-reservation-dialog";
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
  const [cancellingItem, setCancellingItem] = useState<Item | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleReserve = (item: Item) => {
    setReservingItem(item);
    setIsReserveModalOpen(true);
  };

  const handleReserveConfirm = (itemId: string) => {
    // TODO: Reserve item in mock store (Phase 1.3)
    console.log("Reserve item:", itemId);
  };

  const handleCancelReservation = (item: Item) => {
    setCancellingItem(item);
    setIsCancelDialogOpen(true);
  };

  const handleCancelReservationConfirm = (itemId: string) => {
    // TODO: Cancel reservation in mock store (Phase 1.3)
    console.log("Cancel reservation:", itemId);
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
              onCancelReservation={() => handleCancelReservation(item)}
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

      <CancelReservationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        item={cancellingItem}
        onCancelReservation={handleCancelReservationConfirm}
      />
    </>
  );
}
