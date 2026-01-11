import { supabase } from "@/lib/supabase";
import { Wishlist } from "@/lib/types";

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
