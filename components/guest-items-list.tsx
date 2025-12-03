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

interface GuestItemsListProps {
  items: Item[];
  currentUserReservationToken: string;
}

export function GuestItemsList({
  items,
  currentUserReservationToken,
}: GuestItemsListProps) {
  return (
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
            onReserve={() => {
              // TODO: Handle reservation
            }}
            onCancelReservation={() => {
              // TODO: Handle cancel reservation
            }}
          />
        );
      })}
    </div>
  );
}
