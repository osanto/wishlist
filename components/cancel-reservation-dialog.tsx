"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Item {
  id: string;
  name: string;
}

interface CancelReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onCancelReservation: (itemId: string) => void;
}

export function CancelReservationDialog({
  open,
  onOpenChange,
  item,
  onCancelReservation,
}: CancelReservationDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelReservation = async () => {
    if (!item) return;

    setIsCancelling(true);
    try {
      await onCancelReservation(item.id);
      onOpenChange(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Reservation</DialogTitle>
        </DialogHeader>
        <div className="py-1">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel your reservation for &quot;
            {item?.name}&quot;?
            <br />
            The item will become available for others to reserve.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCancelling}
          >
            Keep Reservation
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancelReservation}
            disabled={isCancelling}
            data-test-id="cancel-reservation-confirm-button"
          >
            {isCancelling ? "Cancelling..." : "Cancel Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

