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

interface UnreserveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => Promise<void>;
}

export function UnreserveItemDialog({
  open,
  onOpenChange,
  itemName,
  onConfirm,
}: UnreserveItemDialogProps) {
  const [isUnreserving, setIsUnreserving] = useState(false);

  const handleConfirm = async () => {
    setIsUnreserving(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsUnreserving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-test-id="unreserve-item-dialog">
        <DialogHeader>
          <DialogTitle>Unreserve Item</DialogTitle>
        </DialogHeader>
        <div className="py-1">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to unreserve &quot;{itemName}&quot;? This
            action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUnreserving}
            data-test-id="cancel-unreserve-button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isUnreserving}
            data-test-id="confirm-unreserve-button"
          >
            {isUnreserving ? "Unreserving..." : "Unreserve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
