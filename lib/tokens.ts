import { v4 as uuidv4 } from "uuid";

/**
 * Generates a unique admin token for wishlist owners.
 * This token grants full access to manage the wishlist and items.
 */
export function generateAdminToken(): string {
  return uuidv4();
}

/**
 * Generates a unique guest token for sharing with guests.
 * This token grants read-only access and ability to reserve items.
 */
export function generateGuestToken(): string {
  return uuidv4();
}

/**
 * Generates a unique reservation token for tracking anonymous reservations.
 * This token is stored only in the guest's browser (localStorage).
 */
export function generateReservationToken(): string {
  return uuidv4();
}
