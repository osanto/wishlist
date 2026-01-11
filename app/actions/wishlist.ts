"use server";

import { redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { generateAdminToken, generateGuestToken } from "@/lib/tokens";

/**
 * Creates a new wishlist with default title and description.
 * Generates unique admin and guest tokens.
 * Redirects to the admin page with the admin token.
 */
export async function createWishlistAction() {
  try {
    // Generate unique tokens
    const adminToken = generateAdminToken();
    const guestToken = generateGuestToken();

    // Insert new wishlist into database
    const { data, error } = await supabase
      .from("wishlist")
      .insert({
        admin_token: adminToken,
        guest_token: guestToken,
        title: "My Wishlist",
        description: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating wishlist:", error);
      throw new Error("Failed to create wishlist");
    }

    // Redirect to admin page with the admin token
    redirect(`/admin/${adminToken}`);
  } catch (error) {
    console.error("Error in createWishlistAction:", error);
    throw error;
  }
}

/**
 * Deletes a wishlist and all associated items.
 * Validates admin token before deletion.
 * Items are automatically deleted via CASCADE constraint.
 */
export async function deleteWishlistAction(adminToken: string) {
  try {
    // Verify wishlist exists and admin token is valid
    const { data: wishlist, error: selectError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("admin_token", adminToken)
      .single();

    if (selectError || !wishlist) {
      throw new Error("Invalid admin token or wishlist not found");
    }

    // Delete wishlist (items cascade delete automatically)
    const { error: deleteError } = await supabase
      .from("wishlist")
      .delete()
      .eq("admin_token", adminToken);

    if (deleteError) {
      console.error("Error deleting wishlist:", deleteError);
      throw new Error("Failed to delete wishlist");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteWishlistAction:", error);
    throw error;
  }
}
