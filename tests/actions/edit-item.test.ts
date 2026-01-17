import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { editItemAction } from "@/app/actions/items";
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase", () => {
  const createMockChain = () => {
    const mockSingle = vi.fn();
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({
      eq: mockEq,
      single: mockSingle,
    }));
    const mockUpdate = vi.fn(() => ({
      eq: mockEq,
      select: mockSelect,
    }));

    return {
      select: mockSelect,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle,
    };
  };

  return {
    supabase: {
      from: vi.fn(() => createMockChain()),
    },
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("editItemAction", () => {
  const mockAdminToken = "valid-admin-token-123";
  const mockWishlistId = "wishlist-id-456";
  const mockItemId = "item-id-789";
  const mockItemData = {
    itemId: mockItemId,
    name: "Updated Headphones",
    link: "https://example.com/updated",
    notes: "Updated notes",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should update item when valid admin token is provided", async () => {
    const mockFrom = supabase.from as Mock;

    // First call: wishlist validation
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Second call: verify item belongs to wishlist
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { wishlist_id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Third call: update item
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: mockItemId,
                wishlist_id: mockWishlistId,
                name: mockItemData.name,
                link: mockItemData.link,
                notes: mockItemData.notes,
                reserved_by_token: null,
                is_reserved: false,
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      }),
    });

    const result = await editItemAction(mockAdminToken, mockItemData);

    // Verify success response
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe(mockItemData.name);
    expect(result.data?.link).toBe(mockItemData.link);
    expect(result.data?.notes).toBe(mockItemData.notes);
  });

  it("should return error when admin token is invalid", async () => {
    const mockFrom = supabase.from as Mock;

    // Mock wishlist validation failure
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "No rows found", code: "PGRST116" },
          }),
        }),
      }),
    });

    const result = await editItemAction("invalid-token", mockItemData);

    expect(result.error).toBe("Invalid admin token");
    expect(result.data).toBeUndefined();
  });

  it("should return error when item name is empty", async () => {
    const invalidItemData = {
      itemId: mockItemId,
      name: "",
      link: "https://example.com",
      notes: "Some notes",
    };

    const result = await editItemAction(mockAdminToken, invalidItemData);

    expect(result.error).toBe("Item name is required");
    expect(result.data).toBeUndefined();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("should return error when item name is only whitespace", async () => {
    const invalidItemData = {
      itemId: mockItemId,
      name: "   ",
      link: "https://example.com",
      notes: "Some notes",
    };

    const result = await editItemAction(mockAdminToken, invalidItemData);

    expect(result.error).toBe("Item name is required");
    expect(result.data).toBeUndefined();
  });

  it("should return error when item does not exist", async () => {
    const mockFrom = supabase.from as Mock;

    // First call: wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Second call: item not found
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "No rows found", code: "PGRST116" },
          }),
        }),
      }),
    });

    const result = await editItemAction(mockAdminToken, mockItemData);

    expect(result.error).toBe("Item not found");
    expect(result.data).toBeUndefined();
  });

  it("should return error when item belongs to different wishlist", async () => {
    const mockFrom = supabase.from as Mock;
    const differentWishlistId = "different-wishlist-id";

    // First call: wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Second call: item belongs to different wishlist
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { wishlist_id: differentWishlistId },
            error: null,
          }),
        }),
      }),
    });

    const result = await editItemAction(mockAdminToken, mockItemData);

    expect(result.error).toBe("Item does not belong to this wishlist");
    expect(result.data).toBeUndefined();
  });

  it("should handle database errors gracefully", async () => {
    const mockFrom = supabase.from as Mock;

    // First call: wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Second call: verify item belongs to wishlist
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { wishlist_id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Third call: update failure
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error", code: "DB_ERROR" },
            }),
          }),
        }),
      }),
    });

    const result = await editItemAction(mockAdminToken, mockItemData);

    expect(result.error).toBe("Failed to update item");
    expect(result.data).toBeUndefined();
  });

  it("should allow optional fields (link and notes) to be empty", async () => {
    const minimalItemData = {
      itemId: mockItemId,
      name: "Simple Item",
      link: "",
      notes: "",
    };
    const mockFrom = supabase.from as Mock;

    // First call: wishlist validation
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Second call: verify item belongs to wishlist
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { wishlist_id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Third call: update item
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: mockItemId,
                wishlist_id: mockWishlistId,
                name: minimalItemData.name,
                link: null,
                notes: null,
                reserved_by_token: null,
                is_reserved: false,
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      }),
    });

    const result = await editItemAction(mockAdminToken, minimalItemData);

    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe(minimalItemData.name);
    expect(result.data?.link).toBeNull();
    expect(result.data?.notes).toBeNull();
  });
});
