"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { generateAdminToken, generateGuestToken } from "@/lib/tokens";
import { ActionResponse } from "@/lib/types";

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

interface EditWishlistInput {
  title: string;
  description?: string;
}

/**
 * Edits a wishlist's title and description.
 * Validates admin token before updating.
 */
export async function editWishlistAction(
  adminToken: string,
  data: EditWishlistInput
): Promise<ActionResponse<void>> {
  try {
    // Validate input
    const trimmedTitle = data.title.trim();
    if (!trimmedTitle) {
      return { error: "Title is required" };
    }

    // Validate admin token and get wishlist ID
    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("admin_token", adminToken)
      .single();

    if (wishlistError || !wishlist) {
      console.error("Error validating admin token for edit:", wishlistError);
      return { error: "Invalid admin token" };
    }

    // Update wishlist
    const { error: updateError } = await supabase
      .from("wishlist")
      .update({
        title: trimmedTitle,
        description: data.description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("admin_token", adminToken);

    if (updateError) {
      console.error("Error updating wishlist:", updateError);
      return { error: "Failed to update wishlist" };
    }

    // Revalidate the admin page
    revalidatePath(`/admin/${adminToken}`);

    return { data: undefined };
  } catch (error) {
    console.error("Unexpected error in editWishlistAction:", error);
    return { error: "An unexpected error occurred." };
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
