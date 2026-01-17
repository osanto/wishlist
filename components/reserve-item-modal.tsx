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

interface ReserveItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onReserve: (itemId: string) => void;
}

export function ReserveItemModal({
  open,
  onOpenChange,
  item,
  onReserve,
}: ReserveItemModalProps) {
  const [isReserving, setIsReserving] = useState(false);

  const handleReserve = async () => {
    if (!item) return;

    setIsReserving(true);
    try {
      await onReserve(item.id);
      onOpenChange(false);
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reserve Item</DialogTitle>
        </DialogHeader>
        <div className="py-1">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to reserve &quot;{item?.name}&quot;? This will
            mark the item as reserved by you.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isReserving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleReserve}
            disabled={isReserving}
            data-test-id="reserve-item-confirm-button"
          >
            {isReserving ? "Reserving..." : "Reserve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
