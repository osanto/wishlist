import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { editWishlistAction } from "@/app/actions/wishlist";
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

describe("editWishlistAction", () => {
  const mockAdminToken = "valid-admin-token-123";
  const mockWishlistId = "wishlist-id-456";
  const mockEditData = {
    title: "Updated Wishlist Title",
    description: "Updated description",
  };

  let mockFrom: Mock;
  let consoleErrorSpy: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = supabase.from as Mock;
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should update wishlist when valid admin token and data are provided", async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    // Mock wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: mockWishlistId }, error: null }),
    });

    // Mock wishlist update success
    mockFrom.mockReturnValueOnce({
      update: mockUpdate,
      eq: mockEq,
    });

    const result = await editWishlistAction(mockAdminToken, mockEditData);

    expect(result.error).toBeUndefined();
    expect(result.data).toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("wishlist");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: mockEditData.title,
        description: mockEditData.description,
      })
    );
  });

  it("should return error when admin token is invalid", async () => {
    // Mock wishlist validation failure
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Not found", code: "404" },
      }),
    });

    const result = await editWishlistAction("invalid-token", mockEditData);

    expect(result.error).toBe("Invalid admin token");
    expect(result.data).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error validating admin token for edit:",
      { message: "Not found", code: "404" }
    );
  });

  it("should return error when title is empty", async () => {
    const invalidData = { ...mockEditData, title: "" };
    const result = await editWishlistAction(mockAdminToken, invalidData);

    expect(result.error).toBe("Title is required");
    expect(result.data).toBeUndefined();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("should return error when title is only whitespace", async () => {
    const invalidData = { ...mockEditData, title: "   " };
    const result = await editWishlistAction(mockAdminToken, invalidData);

    expect(result.error).toBe("Title is required");
    expect(result.data).toBeUndefined();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully during update", async () => {
    // Mock wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: mockWishlistId }, error: null }),
    });

    // Mock wishlist update failure
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: { message: "DB update failed", code: "DB_ERROR" },
      }),
    });

    const result = await editWishlistAction(mockAdminToken, mockEditData);

    expect(result.error).toBe("Failed to update wishlist");
    expect(result.data).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating wishlist:", {
      message: "DB update failed",
      code: "DB_ERROR",
    });
  });

  it("should convert empty string description to null", async () => {
    const dataWithEmptyDescription = {
      title: "Valid Title",
      description: "",
    };

    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    // Mock wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: mockWishlistId }, error: null }),
    });

    // Mock wishlist update success
    mockFrom.mockReturnValueOnce({
      update: mockUpdate,
      eq: mockEq,
    });

    const result = await editWishlistAction(
      mockAdminToken,
      dataWithEmptyDescription
    );

    expect(result.error).toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Valid Title",
        description: null,
      })
    );
  });

  it("should handle undefined description", async () => {
    const dataWithoutDescription = {
      title: "Valid Title",
    };

    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    // Mock wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: mockWishlistId }, error: null }),
    });

    // Mock wishlist update success
    mockFrom.mockReturnValueOnce({
      update: mockUpdate,
      eq: mockEq,
    });

    const result = await editWishlistAction(
      mockAdminToken,
      dataWithoutDescription
    );

    expect(result.error).toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Valid Title",
        description: null,
      })
    );
  });
});
