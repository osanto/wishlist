import { describe, it, expect, vi, beforeEach } from "vitest";
import { unreserveItemAction } from "@/app/actions/items";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock Next.js revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock wishlist helpers
vi.mock("@/lib/wishlist", () => ({
  getWishlistByAdminToken: vi.fn(),
}));

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getWishlistByAdminToken } from "@/lib/wishlist";

describe("unreserveItemAction", () => {
  const mockAdminToken = "admin-token-123";
  const mockItemId = "item-id-456";
  const mockWishlistId = "wishlist-id-789";
  const mockGuestToken = "guest-token-abc";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully unreserve an item", async () => {
    // Mock wishlist validation
    vi.mocked(getWishlistByAdminToken).mockResolvedValue({
      id: mockWishlistId,
      admin_token: mockAdminToken,
      guest_token: mockGuestToken,
      title: "Test Wishlist",
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Mock Supabase update
    const mockEq = vi.fn().mockResolvedValue({
      data: { id: mockItemId },
      error: null,
    });
    const mockUpdate = vi.fn().mockReturnValue({
      eq: mockEq,
    });
    const mockFrom = vi.fn().mockReturnValue({
      update: mockUpdate,
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom as any);

    const result = await unreserveItemAction(mockAdminToken, mockItemId);

    expect(result).toEqual({ data: { success: true } });
    expect(getWishlistByAdminToken).toHaveBeenCalledWith(mockAdminToken);
    expect(supabase.from).toHaveBeenCalledWith("items");
    expect(mockUpdate).toHaveBeenCalledWith({
      is_reserved: false,
      reserved_by_token: null,
    });
    expect(mockEq).toHaveBeenCalledWith("id", mockItemId);
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/${mockAdminToken}`);
    expect(revalidatePath).toHaveBeenCalledWith(`/guest/${mockGuestToken}`);
  });

  it("should return error if admin token is invalid", async () => {
    vi.mocked(getWishlistByAdminToken).mockResolvedValue(null);

    const result = await unreserveItemAction(mockAdminToken, mockItemId);

    expect(result).toEqual({ error: "Invalid admin token" });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should return error if item is not found", async () => {
    vi.mocked(getWishlistByAdminToken).mockResolvedValue({
      id: mockWishlistId,
      admin_token: mockAdminToken,
      guest_token: mockGuestToken,
      title: "Test Wishlist",
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const mockEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Item not found" },
    });
    const mockUpdate = vi.fn().mockReturnValue({
      eq: mockEq,
    });
    const mockFrom = vi.fn().mockReturnValue({
      update: mockUpdate,
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom as any);

    const result = await unreserveItemAction(mockAdminToken, mockItemId);

    expect(result).toEqual({ error: "Failed to unreserve item" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should return error if database update fails", async () => {
    vi.mocked(getWishlistByAdminToken).mockResolvedValue({
      id: mockWishlistId,
      admin_token: mockAdminToken,
      guest_token: mockGuestToken,
      title: "Test Wishlist",
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const mockEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });
    const mockUpdate = vi.fn().mockReturnValue({
      eq: mockEq,
    });
    const mockFrom = vi.fn().mockReturnValue({
      update: mockUpdate,
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom as any);

    const result = await unreserveItemAction(mockAdminToken, mockItemId);

    expect(result).toEqual({ error: "Failed to unreserve item" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
