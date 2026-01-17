import { supabase } from "@/lib/supabase";

/**
 * Helper function to get guest token from database (for test setup only).
 * Note: This is only used for test setup, not for assertions.
 */
export async function getGuestTokenFromDb(adminToken: string): Promise<string> {
  const { data } = await supabase
    .from("wishlist")
    .select("guest_token")
    .eq("admin_token", adminToken)
    .single();

  return data?.guest_token || "";
}

/**
 * Helper function to get guest URL from database (for test setup only).
 * Note: This is only used for test setup, not for assertions.
 */
export async function getGuestUrlFromDb(adminToken: string): Promise<string> {
  const guestToken = await getGuestTokenFromDb(adminToken);
  const baseUrl =
    process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/guest/${guestToken}`;
}
