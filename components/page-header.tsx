import { ShareLinkSection } from "@/components/share-link-section";

interface PageHeaderProps {
  title: string;
  description?: string;
  shareUrl?: string;
}

export function PageHeader({ title, description, shareUrl }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold" data-test-id="wishlist-title">
        {title}
      </h1>
      {description && <p className="text-muted-foreground">{description}</p>}
      {shareUrl && (
        <div className="mt-6 rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Share with Guests</h2>
          <ShareLinkSection guestUrl={shareUrl} />
        </div>
      )}
    </div>
  );
}
