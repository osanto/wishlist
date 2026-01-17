import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getWishlistByAdminToken } from "@/lib/wishlist";
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase", () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  return {
    supabase: {
      from: mockFrom,
    },
  };
});

describe("getWishlistByAdminToken", () => {
  const mockAdminToken = "valid-admin-token-123";
  const mockWishlist = {
    id: "wishlist-id-123",
    admin_token: mockAdminToken,
    guest_token: "guest-token-456",
    title: "My Test Wishlist",
    description: "Test description",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid cluttering test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return wishlist when valid admin token is provided", async () => {
    // Get the mocked chain
    const mockChain = supabase
      .from("wishlist")
      .select("*")
      .eq("admin_token", mockAdminToken);

    // Mock successful database response
    (mockChain.single as Mock).mockResolvedValueOnce({
      data: mockWishlist,
      error: null,
    });

    const result = await getWishlistByAdminToken(mockAdminToken);

    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith("wishlist");

    // Verify result
    expect(result).toEqual(mockWishlist);
    expect(result?.id).toBe("wishlist-id-123");
    expect(result?.title).toBe("My Test Wishlist");
    expect(result?.guest_token).toBe("guest-token-456");
  });

  it("should return null when invalid admin token is provided", async () => {
    const invalidToken = "invalid-token-999";

    // Get the mocked chain
    const mockChain = supabase
      .from("wishlist")
      .select("*")
      .eq("admin_token", invalidToken);

    // Mock database response with error (not found)
    (mockChain.single as Mock).mockResolvedValueOnce({
      data: null,
      error: { message: "No rows found", code: "PGRST116" },
    });

    const result = await getWishlistByAdminToken(invalidToken);

    // Verify Supabase was called
    expect(supabase.from).toHaveBeenCalledWith("wishlist");

    // Verify result is null
    expect(result).toBeNull();
  });

  it("should return null when database error occurs", async () => {
    const errorMessage = "Database connection failed";

    // Get the mocked chain
    const mockChain = supabase
      .from("wishlist")
      .select("*")
      .eq("admin_token", mockAdminToken);

    // Mock database error
    (mockChain.single as Mock).mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage, code: "CONNECTION_ERROR" },
    });

    const result = await getWishlistByAdminToken(mockAdminToken);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith("Error fetching wishlist:", {
      message: errorMessage,
      code: "CONNECTION_ERROR",
    });

    // Verify result is null
    expect(result).toBeNull();
  });

  it("should return null when data is undefined", async () => {
    // Get the mocked chain
    const mockChain = supabase
      .from("wishlist")
      .select("*")
      .eq("admin_token", mockAdminToken);

    // Mock response with undefined data (edge case)
    (mockChain.single as Mock).mockResolvedValueOnce({
      data: undefined,
      error: null,
    });

    const result = await getWishlistByAdminToken(mockAdminToken);

    // Verify result is null
    expect(result).toBeNull();
  });
});
