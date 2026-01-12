"use client";

import { useEffect, useState } from "react";
import { GuestItemsList } from "@/components/guest-items-list";
import { getOrCreateReservationToken } from "@/lib/token-storage";

interface GuestPageClientProps {
  items: Array<{
    id: string;
    name: string;
    link: string;
    notes: string;
    isReserved: boolean;
    reservedByToken: string | null;
  }>;
}

/**
 * Client component that handles reservation token generation
 * and passes it to the items list
 */
export function GuestPageClient({ items }: GuestPageClientProps) {
  const [reservationToken, setReservationToken] = useState<string>("");

  useEffect(() => {
    // Get or create reservation token on client side
    const token = getOrCreateReservationToken();
    setReservationToken(token);
  }, []);

  // Don't render until we have the token (prevents hydration mismatch)
  if (!reservationToken) {
    return (
      <GuestItemsList
        items={items}
        currentUserReservationToken=""
      />
    );
  }

  return (
    <GuestItemsList
      items={items}
      currentUserReservationToken={reservationToken}
    />
  );
}
