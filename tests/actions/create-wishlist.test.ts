import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWishlistAction } from "@/app/actions/wishlist";

// Mock Next.js redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT: ${url}`);
  }),
}));

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock token generators
vi.mock("@/lib/tokens", () => ({
  generateAdminToken: vi.fn(() => "mock-admin-token-123"),
  generateGuestToken: vi.fn(() => "mock-guest-token-456"),
}));

import { supabase } from "@/lib/supabase";
import { generateAdminToken, generateGuestToken } from "@/lib/tokens";
import { redirect } from "next/navigation";

describe("createWishlistAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create wishlist with generated tokens and redirect to admin page", async () => {
    // Arrange: Mock successful database insert
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: "wishlist-id-123",
            admin_token: "mock-admin-token-123",
            guest_token: "mock-guest-token-456",
            title: "My Wishlist",
            description: null,
          },
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any);

    // Act & Assert: Should throw redirect error (Next.js pattern)
    await expect(createWishlistAction()).rejects.toThrow(
      "REDIRECT: /admin/mock-admin-token-123"
    );

    // Assert: Token generators were called
    expect(generateAdminToken).toHaveBeenCalledOnce();
    expect(generateGuestToken).toHaveBeenCalledOnce();

    // Assert: Supabase insert was called with correct data
    expect(supabase.from).toHaveBeenCalledWith("wishlist");
    expect(mockInsert).toHaveBeenCalledWith({
      admin_token: "mock-admin-token-123",
      guest_token: "mock-guest-token-456",
      title: "My Wishlist",
      description: null,
    });

    // Assert: Redirect was called with admin token
    expect(redirect).toHaveBeenCalledWith("/admin/mock-admin-token-123");
  });

  it("should handle database errors gracefully", async () => {
    // Arrange: Mock database error
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: "Database connection failed",
            code: "CONNECTION_ERROR",
          },
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any);

    // Act & Assert: Should throw error
    await expect(createWishlistAction()).rejects.toThrow(
      "Failed to create wishlist"
    );

    // Assert: Token generators were still called
    expect(generateAdminToken).toHaveBeenCalledOnce();
    expect(generateGuestToken).toHaveBeenCalledOnce();

    // Assert: Insert was attempted
    expect(supabase.from).toHaveBeenCalledWith("wishlist");
    expect(mockInsert).toHaveBeenCalled();

    // Assert: Redirect was NOT called (error happened first)
    expect(redirect).not.toHaveBeenCalled();
  });
});
