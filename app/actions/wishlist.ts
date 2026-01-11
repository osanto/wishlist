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
