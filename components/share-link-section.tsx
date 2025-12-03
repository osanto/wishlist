"use client";

import { useState } from "react";

import { Link2Icon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";

interface ShareLinkSectionProps {
  guestUrl: string;
}

export function ShareLinkSection({ guestUrl }: ShareLinkSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(guestUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      data-test-id="copy-link-button"
      variant={copied ? "outline" : "default"}
    >
      <Link2Icon />
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}

