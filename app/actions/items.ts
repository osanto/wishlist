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
