import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getItemsForWishlist } from "@/lib/wishlist";
import { supabase } from "@/lib/supabase";
import { Item } from "@/lib/types";

// Mock Supabase
vi.mock("@/lib/supabase", () => {
  const mockOrder = vi.fn();
  const mockEq = vi.fn(() => ({ order: mockOrder }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  return {
    supabase: {
      from: mockFrom,
    },
  };
});

describe("getItemsForWishlist", () => {
  const mockWishlistId = "wishlist-123";
  const mockItems: Item[] = [
    {
      id: "item-1",
      wishlist_id: mockWishlistId,
      name: "Wireless Headphones",
      link: "https://example.com/headphones",
      notes: "Black or silver preferred",
      reserved_by_token: null,
      is_reserved: false,
      created_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "item-2",
      wishlist_id: mockWishlistId,
      name: "Coffee Maker",
      link: "https://example.com/coffee",
      notes: null,
      reserved_by_token: "reservation-token-123",
      is_reserved: true,
      created_at: "2024-01-01T11:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid cluttering test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return items when wishlist has items", async () => {
    // Get the mocked chain
    const mockChain = supabase
      .from("items")
      .select("*")
      .eq("wishlist_id", mockWishlistId);

    // Mock successful database response
    (mockChain.order as Mock).mockResolvedValueOnce({
      data: mockItems,
      error: null,
    });

    const result = await getItemsForWishlist(mockWishlistId);

    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith("items");
    expect(mockChain.order).toHaveBeenCalledWith("created_at", {
      ascending: true,
    });

    // Verify result
    expect(result).toEqual(mockItems);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Wireless Headphones");
    expect(result[1].name).toBe("Coffee Maker");
  });

  it("should return empty array when wishlist has no items", async () => {
    // Get the mocked chain
    const mockChain = supabase
      .from("items")
      .select("*")
      .eq("wishlist_id", mockWishlistId);

    // Mock database response with empty array
    (mockChain.order as Mock).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const result = await getItemsForWishlist(mockWishlistId);

    // Verify Supabase was called
    expect(supabase.from).toHaveBeenCalledWith("items");

    // Verify result is empty array
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("should return empty array when database error occurs", async () => {
    const errorMessage = "Database connection failed";

    // Get the mocked chain
    const mockChain = supabase
      .from("items")
      .select("*")
      .eq("wishlist_id", mockWishlistId);

    // Mock database error
    (mockChain.order as Mock).mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage, code: "CONNECTION_ERROR" },
    });

    const result = await getItemsForWishlist(mockWishlistId);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith("Error fetching items:", {
      message: errorMessage,
      code: "CONNECTION_ERROR",
    });

    // Verify result is empty array
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("should return empty array when data is undefined", async () => {
    // Get the mocked chain
    const mockChain = supabase
      .from("items")
      .select("*")
      .eq("wishlist_id", mockWishlistId);

    // Mock response with undefined data (edge case)
    (mockChain.order as Mock).mockResolvedValueOnce({
      data: undefined,
      error: null,
    });

    const result = await getItemsForWishlist(mockWishlistId);

    // Verify result is empty array
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("should order items by created_at ascending", async () => {
    // Get the mocked chain
    const mockChain = supabase
      .from("items")
      .select("*")
      .eq("wishlist_id", mockWishlistId);

    // Mock successful database response
    (mockChain.order as Mock).mockResolvedValueOnce({
      data: mockItems,
      error: null,
    });

    await getItemsForWishlist(mockWishlistId);

    // Verify order was called with correct parameters
    expect(mockChain.order).toHaveBeenCalledWith("created_at", {
      ascending: true,
    });
  });
});
