import { supabase } from "@/lib/supabase";
import { Wishlist, Item } from "@/lib/types";

/**
 * Fetches a wishlist by admin token.
 * Returns the wishlist data or null if not found.
 */
export async function getWishlistByAdminToken(
  adminToken: string
): Promise<Wishlist | null> {
  const { data, error } = await supabase
    .from("wishlist")
    .select("*")
    .eq("admin_token", adminToken)
    .single();

  if (error || !data) {
    console.error("Error fetching wishlist:", error);
    return null;
  }

  return data;
}

/**
 * Fetches a wishlist by guest token.
 * Returns the wishlist data or null if not found.
 */
export async function getWishlistByGuestToken(
  guestToken: string
): Promise<Wishlist | null> {
  const { data, error } = await supabase
    .from("wishlist")
    .select("*")
    .eq("guest_token", guestToken)
    .single();

  if (error || !data) {
    console.error("Error fetching wishlist:", error);
    return null;
  }

  return data;
}

/**
 * Fetches all items for a given wishlist.
 * Returns an array of items or empty array if none found.
 */
export async function getItemsForWishlist(wishlistId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("wishlist_id", wishlistId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching items:", error);
    return [];
  }

  return data || [];
}
