"use client";

import { v4 as uuidv4 } from "uuid";

/**
 * Client-side token storage utilities for managing tokens in localStorage
 */

const ADMIN_TOKEN_KEY = "wishlist_admin_token";
const GUEST_TOKEN_KEY = "wishlist_guest_token";
const RESERVATION_TOKEN_KEY = "wishlist_reservation_token";

/**
 * Get or create a reservation token for the current user
 * This token identifies which guest made which reservations
 */
export function getOrCreateReservationToken(): string {
  if (typeof window === "undefined") {
    return ""; // Server-side, return empty string
  }

  let token = localStorage.getItem(RESERVATION_TOKEN_KEY);
  
  if (!token) {
    token = uuidv4();
    localStorage.setItem(RESERVATION_TOKEN_KEY, token);
  }
  
  return token;
}

/**
 * Get the current reservation token (without creating one)
 */
export function getReservationToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(RESERVATION_TOKEN_KEY);
}

/**
 * Save admin token to localStorage
 */
export function saveAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

/**
 * Get admin token from localStorage
 */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * Save guest token to localStorage
 */
export function saveGuestToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

/**
 * Get guest token from localStorage
 */
export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

/**
 * Clear all tokens (for testing or logout)
 */
export function clearAllTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(GUEST_TOKEN_KEY);
  localStorage.removeItem(RESERVATION_TOKEN_KEY);
}
