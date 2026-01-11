import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { deleteItemAction } from '@/app/actions/items';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const createMockChain = () => {
    const mockSingle = vi.fn();
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({
      eq: mockEq,
      single: mockSingle,
    }));
    const mockDelete = vi.fn(() => ({
      eq: mockEq,
    }));

    return {
      select: mockSelect,
      delete: mockDelete,
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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('deleteItemAction', () => {
  const mockAdminToken = 'valid-admin-token-123';
  const mockWishlistId = 'wishlist-id-456';
  const mockItemId = 'item-id-789';

  let mockFrom: Mock;
  let consoleErrorSpy: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = supabase.from as Mock;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should delete item when valid admin token and item ID are provided', async () => {
    // Mock wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: mockWishlistId }, error: null }),
    });

    // Mock item existence check success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn((col: string, val: string) => {
        if (col === 'id') expect(val).toBe(mockItemId);
        if (col === 'wishlist_id') expect(val).toBe(mockWishlistId);
        return {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: mockItemId }, error: null }),
        };
      }),
    });

    // Mock item deletion success
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await deleteItemAction(mockAdminToken, mockItemId);

    expect(result.error).toBeUndefined();
    expect(result.data).toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('wishlist');
    expect(supabase.from).toHaveBeenCalledWith('items');
  });

  it('should return error when admin token is invalid', async () => {
    // Mock wishlist validation failure
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found', code: '404' } }),
    });

    const result = await deleteItemAction('invalid-token', mockItemId);

    expect(result.error).toBe('Invalid admin token');
    expect(result.data).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error validating admin token for delete:', { message: 'Not found', code: '404' });
  });

  it('should return error when item does not belong to the wishlist', async () => {
    // Mock wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: mockWishlistId }, error: null }),
    });

    // Mock item existence check failure (item not found for this wishlist)
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'No rows found', code: 'PGRST116' } }),
    });

    const result = await deleteItemAction(mockAdminToken, mockItemId);

    expect(result.error).toBe('Item not found or does not belong to this wishlist');
    expect(result.data).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error finding item for delete:', { message: 'No rows found', code: 'PGRST116' });
  });

  it('should handle database errors gracefully during item deletion', async () => {
    // Mock wishlist validation success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: mockWishlistId }, error: null }),
    });

    // Mock item existence check success
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: mockItemId }, error: null }),
    });

    // Mock item deletion failure
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'DB delete failed', code: 'DB_ERROR' } }),
    });

    const result = await deleteItemAction(mockAdminToken, mockItemId);

    expect(result.error).toBe('Failed to delete item');
    expect(result.data).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting item:', { message: 'DB delete failed', code: 'DB_ERROR' });
  });
});
