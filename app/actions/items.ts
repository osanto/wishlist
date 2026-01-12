"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { Item, ActionResponse } from "@/lib/types";

interface AddItemInput {
  name: string;
  link: string;
  notes: string;
}

/**
 * Adds a new item to a wishlist.
 * Validates admin token before adding.
 */
export async function addItemAction(
  adminToken: string,
  itemData: AddItemInput
): Promise<ActionResponse<Item>> {
  try {
    // Validate input
    const trimmedName = itemData.name.trim();
    if (!trimmedName) {
      return { error: "Item name is required" };
    }

    // Validate admin token and get wishlist ID
    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("admin_token", adminToken)
      .single();

    if (wishlistError || !wishlist) {
      console.error("Error validating admin token:", wishlistError);
      return { error: "Invalid admin token" };
    }

    // Prepare item data (convert empty strings to null for optional fields)
    const newItem = {
      wishlist_id: wishlist.id,
      name: trimmedName,
      link: itemData.link.trim() || null,
      notes: itemData.notes.trim() || null,
      reserved_by_token: null,
      is_reserved: false,
    };

    // Insert item into database
    const { data: item, error: insertError } = await supabase
      .from("items")
      .insert(newItem)
      .select()
      .single();

    if (insertError || !item) {
      console.error("Error adding item:", insertError);
      return { error: "Failed to add item" };
    }

    // Revalidate the admin page to show the new item
    revalidatePath(`/admin/${adminToken}`);

    return { data: item };
  } catch (error) {
    console.error("Error in addItemAction:", error);
    return { error: "Failed to add item" };
  }
}

interface EditItemInput {
  itemId: string;
  name: string;
  link: string;
  notes: string;
}

/**
 * Edits an existing item in a wishlist.
 * Validates admin token before editing.
 */
export async function editItemAction(
  adminToken: string,
  itemData: EditItemInput
): Promise<ActionResponse<Item>> {
  try {
    // Validate input
    const trimmedName = itemData.name.trim();
    if (!trimmedName) {
      return { error: "Item name is required" };
    }

    // Validate admin token and get wishlist ID
    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("admin_token", adminToken)
      .single();

    if (wishlistError || !wishlist) {
      console.error("Error validating admin token:", wishlistError);
      return { error: "Invalid admin token" };
    }

    // Verify item belongs to this wishlist
    const { data: existingItem, error: itemError } = await supabase
      .from("items")
      .select("wishlist_id")
      .eq("id", itemData.itemId)
      .single();

    if (itemError || !existingItem) {
      console.error("Error fetching item:", itemError);
      return { error: "Item not found" };
    }

    if (existingItem.wishlist_id !== wishlist.id) {
      return { error: "Item does not belong to this wishlist" };
    }

    // Update item in database
    const { data: updatedItem, error: updateError } = await supabase
      .from("items")
      .update({
        name: trimmedName,
        link: itemData.link.trim() || null,
        notes: itemData.notes.trim() || null,
      })
      .eq("id", itemData.itemId)
      .select()
      .single();

    if (updateError || !updatedItem) {
      console.error("Error updating item:", updateError);
      return { error: "Failed to update item" };
    }

    // Revalidate the admin page to show the updated item
    revalidatePath(`/admin/${adminToken}`);

    return { data: updatedItem };
  } catch (error) {
    console.error("Error in editItemAction:", error);
    return { error: "Failed to update item" };
  }
}

/**
 * Deletes an item from a wishlist.
 * Validates admin token and item ownership before deleting.
 */
export async function deleteItemAction(
  adminToken: string,
  itemId: string
): Promise<ActionResponse<void>> {
  try {
    // Validate admin token and get wishlist ID
    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("admin_token", adminToken)
      .single();

    if (wishlistError || !wishlist) {
      console.error("Error validating admin token for delete:", wishlistError);
      return { error: "Invalid admin token" };
    }

    // Verify item belongs to this wishlist
    const { data: existingItem, error: itemError } = await supabase
      .from("items")
      .select("id")
      .eq("id", itemId)
      .eq("wishlist_id", wishlist.id)
      .single();

    if (itemError || !existingItem) {
      console.error("Error finding item for delete:", itemError);
      return { error: "Item not found or does not belong to this wishlist" };
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      console.error("Error deleting item:", deleteError);
      return { error: "Failed to delete item" };
    }

    // Revalidate the admin page
    revalidatePath(`/admin/${adminToken}`);

    return { data: undefined };
  } catch (error) {
    console.error("Unexpected error in deleteItemAction:", error);
    return { error: "An unexpected error occurred." };
  }
}

/**
 * Reserves an item for a guest.
 * Validates guest token and checks if item is available before reserving.
 */
export async function reserveItemAction(
  guestToken: string,
  itemId: string,
  reservationToken: string
): Promise<ActionResponse<Item>> {
  try {
    // Validate guest token and get wishlist ID
    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("guest_token", guestToken)
      .single();

    if (wishlistError || !wishlist) {
      console.error("Error validating guest token:", wishlistError);
      return { error: "Invalid guest token" };
    }

    // Check if item exists and belongs to this wishlist
    const { data: existingItem, error: itemError } = await supabase
      .from("items")
      .select("id, wishlist_id, is_reserved, reserved_by_token")
      .eq("id", itemId)
      .single();

    if (itemError || !existingItem) {
      console.error("Error fetching item:", itemError);
      return { error: "Item not found" };
    }

    if (existingItem.wishlist_id !== wishlist.id) {
      return { error: "Item does not belong to this wishlist" };
    }

    // Check if item is already reserved
    if (existingItem.is_reserved) {
      return { error: "Item is already reserved" };
    }

    // Reserve the item
    const { data: reservedItem, error: updateError } = await supabase
      .from("items")
      .update({
        is_reserved: true,
        reserved_by_token: reservationToken,
      })
      .eq("id", itemId)
      .select()
      .single();

    if (updateError || !reservedItem) {
      console.error("Error reserving item:", updateError);
      return { error: "Failed to reserve item" };
    }

    // Revalidate the guest page to show the reservation
    revalidatePath(`/guest/${guestToken}`);

    return { data: reservedItem };
  } catch (error) {
    console.error("Error in reserveItemAction:", error);
    return { error: "Failed to reserve item" };
  }
}

/**
 * Cancels a reservation for an item.
 * Validates guest token and checks if the user owns the reservation before canceling.
 */
export async function cancelReservationAction(
  guestToken: string,
  itemId: string,
  reservationToken: string
): Promise<ActionResponse<Item>> {
  try {
    // Validate guest token and get wishlist ID
    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("guest_token", guestToken)
      .single();

    if (wishlistError || !wishlist) {
      console.error("Error validating guest token:", wishlistError);
      return { error: "Invalid guest token" };
    }

    // Check if item exists and belongs to this wishlist
    const { data: existingItem, error: itemError } = await supabase
      .from("items")
      .select("id, wishlist_id, is_reserved, reserved_by_token")
      .eq("id", itemId)
      .single();

    if (itemError || !existingItem) {
      console.error("Error fetching item:", itemError);
      return { error: "Item not found" };
    }

    if (existingItem.wishlist_id !== wishlist.id) {
      return { error: "Item does not belong to this wishlist" };
    }

    // Check if item is reserved
    if (!existingItem.is_reserved) {
      return { error: "Item is not reserved" };
    }

    // Check if the reservation belongs to this user
    if (existingItem.reserved_by_token !== reservationToken) {
      return { error: "You can only cancel your own reservations" };
    }

    // Cancel the reservation
    const { data: unreservedItem, error: updateError } = await supabase
      .from("items")
      .update({
        is_reserved: false,
        reserved_by_token: null,
      })
      .eq("id", itemId)
      .select()
      .single();

    if (updateError || !unreservedItem) {
      console.error("Error canceling reservation:", updateError);
      return { error: "Failed to cancel reservation" };
    }

    // Revalidate the guest page to show the cancellation
    revalidatePath(`/guest/${guestToken}`);

    return { data: unreservedItem };
  } catch (error) {
    console.error("Error in cancelReservationAction:", error);
    return { error: "Failed to cancel reservation" };
  }
}

/**
 * Admin action to unreserve any item (override guest reservation).
 * Validates admin token before unreserving.
 */
export async function unreserveItemAction(
  adminToken: string,
  itemId: string
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    // Validate admin token
    const { getWishlistByAdminToken } = await import("@/lib/wishlist");
    const wishlist = await getWishlistByAdminToken(adminToken);

    if (!wishlist) {
      return { error: "Invalid admin token" };
    }

    // Unreserve the item (no checks - admin can override any reservation)
    const { data, error } = await supabase
      .from("items")
      .update({
        is_reserved: false,
        reserved_by_token: null,
      })
      .eq("id", itemId);

    if (error) {
      console.error("Error unreserving item:", error);
      return { error: "Failed to unreserve item" };
    }

    // Revalidate both admin and guest pages
    revalidatePath(`/admin/${adminToken}`);
    revalidatePath(`/guest/${wishlist.guest_token}`);

    return { data: { success: true } };
  } catch (error) {
    console.error("Error in unreserveItemAction:", error);
    return { error: "Failed to unreserve item" };
  }
}
