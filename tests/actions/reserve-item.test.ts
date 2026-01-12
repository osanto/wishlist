import { describe, it, expect, vi, beforeEach } from "vitest";
import { reserveItemAction } from "@/app/actions/items";

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

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

describe("reserveItemAction", () => {
  const mockGuestToken = "guest-token-123";
  const mockReservationToken = "reservation-token-456";
  const mockItemId = "item-id-789";
  const mockWishlistId = "wishlist-id-abc";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully reserve an available item", async () => {
    // Mock: Validate guest token
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Mock: Check item exists and is not reserved
    const mockFromItem = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: mockItemId,
              wishlist_id: mockWishlistId,
              is_reserved: false,
              reserved_by_token: null,
            },
            error: null,
          }),
        }),
      }),
    });

    // Mock: Update item to reserved
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: mockItemId,
              wishlist_id: mockWishlistId,
              name: "Test Item",
              link: "https://example.com",
              notes: "Test notes",
              is_reserved: true,
              reserved_by_token: mockReservationToken,
            },
            error: null,
          }),
        }),
      }),
    });

    // Setup mock to return different values for different calls
    (supabase.from as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockFrom()) // First call: validate guest token
      .mockReturnValueOnce(mockFromItem()) // Second call: check item
      .mockReturnValueOnce({ update: mockUpdate }); // Third call: update item

    const result = await reserveItemAction(
      mockGuestToken,
      mockItemId,
      mockReservationToken
    );

    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.is_reserved).toBe(true);
    expect(result.data?.reserved_by_token).toBe(mockReservationToken);
    expect(revalidatePath).toHaveBeenCalledWith(`/guest/${mockGuestToken}`);
  });

  it("should return error for invalid guest token", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      }),
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockFrom());

    const result = await reserveItemAction(
      "invalid-token",
      mockItemId,
      mockReservationToken
    );

    expect(result.error).toBe("Invalid guest token");
    expect(result.data).toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should return error when item is already reserved", async () => {
    // Mock: Validate guest token
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Mock: Item is already reserved
    const mockFromItem = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: mockItemId,
              wishlist_id: mockWishlistId,
              is_reserved: true,
              reserved_by_token: "other-token",
            },
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockFrom())
      .mockReturnValueOnce(mockFromItem());

    const result = await reserveItemAction(
      mockGuestToken,
      mockItemId,
      mockReservationToken
    );

    expect(result.error).toBe("Item is already reserved");
    expect(result.data).toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should return error when item does not exist", async () => {
    // Mock: Validate guest token
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Mock: Item not found
    const mockFromItem = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      }),
    });

    (supabase.from as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockFrom())
      .mockReturnValueOnce(mockFromItem());

    const result = await reserveItemAction(
      mockGuestToken,
      mockItemId,
      mockReservationToken
    );

    expect(result.error).toBe("Item not found");
    expect(result.data).toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should return error when item belongs to different wishlist", async () => {
    // Mock: Validate guest token
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Mock: Item belongs to different wishlist
    const mockFromItem = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: mockItemId,
              wishlist_id: "different-wishlist-id",
              is_reserved: false,
              reserved_by_token: null,
            },
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockFrom())
      .mockReturnValueOnce(mockFromItem());

    const result = await reserveItemAction(
      mockGuestToken,
      mockItemId,
      mockReservationToken
    );

    expect(result.error).toBe("Item does not belong to this wishlist");
    expect(result.data).toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should return error when database update fails", async () => {
    // Mock: Validate guest token
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWishlistId },
            error: null,
          }),
        }),
      }),
    });

    // Mock: Check item exists
    const mockFromItem = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: mockItemId,
              wishlist_id: mockWishlistId,
              is_reserved: false,
              reserved_by_token: null,
            },
            error: null,
          }),
        }),
      }),
    });

    // Mock: Update fails
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Update failed" },
          }),
        }),
      }),
    });

    (supabase.from as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockFrom())
      .mockReturnValueOnce(mockFromItem())
      .mockReturnValueOnce({ update: mockUpdate });

    const result = await reserveItemAction(
      mockGuestToken,
      mockItemId,
      mockReservationToken
    );

    expect(result.error).toBe("Failed to reserve item");
    expect(result.data).toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
