"use client";

import { toast } from "sonner";

import { Link2Icon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";

interface ShareLinkSectionProps {
  guestUrl: string;
}

export function ShareLinkSection({ guestUrl }: ShareLinkSectionProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(guestUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Button onClick={handleCopy} data-test-id="copy-link-button">
      <Link2Icon />
      Copy Link
    </Button>
  );
}
