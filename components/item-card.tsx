"use client";

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    link?: string;
    notes?: string;
    isReserved: boolean;
  };
  variant: "admin" | "guest";
  reservationStatus?: "available" | "reserved-by-me" | "reserved-by-other";
  onEdit?: () => void;
  onDelete?: () => void;
  onReserve?: () => void;
  onCancelReservation?: () => void;
}

export function ItemCard({
  item,
  variant,
  reservationStatus,
  onEdit,
  onDelete,
  onReserve,
  onCancelReservation,
}: ItemCardProps) {
  return (
    <div
      data-test-id={`item-card-${item.id}`}
      className="rounded-lg border bg-card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            {variant === "admin" && item.isReserved && (
              <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-500/30">
                Reserved
              </span>
            )}
            {variant === "guest" && reservationStatus === "reserved-by-me" && (
              <span
                data-test-id={`you-reserved-badge-${item.id}`}
                className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground"
              >
                You reserved this
              </span>
            )}
            {variant === "guest" &&
              reservationStatus === "reserved-by-other" && (
                <span
                  data-test-id={`reserved-badge-${item.id}`}
                  className="inline-flex items-center rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-500/30"
                >
                  Reserved
                </span>
              )}
          </div>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View Item
            </a>
          )}
          {item.notes && (
            <p className="text-sm text-muted-foreground">{item.notes}</p>
          )}
        </div>

        {variant === "admin" && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              data-test-id={`edit-item-${item.id}`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              data-test-id={`delete-item-${item.id}`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm hover:bg-destructive hover:text-destructive-foreground"
            >
              Delete
            </button>
          </div>
        )}

        {variant === "guest" && reservationStatus !== "reserved-by-other" && (
          <div>
            {reservationStatus === "reserved-by-me" ? (
              <button
                onClick={onCancelReservation}
                data-test-id={`cancel-reservation-${item.id}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Cancel Reservation
              </button>
            ) : (
              <button
                onClick={onReserve}
                data-test-id={`reserve-button-${item.id}`}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Reserve
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
