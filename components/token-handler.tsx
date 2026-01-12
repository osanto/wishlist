"use client";

import { useEffect } from "react";
import { saveAdminToken, saveGuestToken } from "@/lib/token-storage";

interface TokenHandlerProps {
  token: string;
  type: "admin" | "guest";
}

/**
 * Client component that handles token persistence
 * - Saves token to localStorage for future use
 * - Does NOT clean URL (Next.js needs the token in the URL for routing)
 */
export function TokenHandler({ token, type }: TokenHandlerProps) {
  useEffect(() => {
    // Save token to localStorage for future features
    if (type === "admin") {
      saveAdminToken(token);
    } else {
      saveGuestToken(token);
    }
  }, [token, type]);

  return null; // This component doesn't render anything
}
