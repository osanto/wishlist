"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { CancelReservationDialog } from "@/components/cancel-reservation-dialog";
import { ItemCard } from "@/components/item-card";
import { ReserveItemModal } from "@/components/reserve-item-modal";
import {
  reserveItemAction,
  cancelReservationAction,
} from "@/app/actions/items";

interface Item {
  id: string;
  name: string;
  link?: string;
  notes?: string;
  isReserved: boolean;
  reservedByToken: string | null;
}

interface GuestItemsListProps {
  guestToken: string;
  items: Item[];
  currentUserReservationToken: string;
}

export function GuestItemsList({
  guestToken,
  items,
  currentUserReservationToken,
}: GuestItemsListProps) {
  const [reservingItem, setReservingItem] = useState<Item | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [cancellingItem, setCancellingItem] = useState<Item | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReserve = (item: Item) => {
    setReservingItem(item);
    setIsReserveModalOpen(true);
  };

  const handleReserveConfirm = async (itemId: string) => {
    startTransition(async () => {
      const result = await reserveItemAction(
        guestToken,
        itemId,
        currentUserReservationToken
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        setIsReserveModalOpen(false);
        toast.success("Item reserved!");
      }
    });
  };

  const handleCancelReservation = (item: Item) => {
    setCancellingItem(item);
    setIsCancelDialogOpen(true);
  };

  const handleCancelReservationConfirm = async (itemId: string) => {
    startTransition(async () => {
      const result = await cancelReservationAction(
        guestToken,
        itemId,
        currentUserReservationToken
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        setIsCancelDialogOpen(false);
        toast.success("Reservation cancelled!");
      }
    });
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
