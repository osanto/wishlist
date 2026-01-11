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
