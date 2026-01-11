import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { addItemAction } from '@/app/actions/items';
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
    const mockInsert = vi.fn(() => ({ 
      select: mockSelect,
    }));
    
    return {
      select: mockSelect,
      insert: mockInsert,
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

describe('addItemAction', () => {
  const mockAdminToken = 'valid-admin-token-123';
  const mockWishlistId = 'wishlist-id-456';
  const mockItemData = {
    name: 'Wireless Headphones',
    link: 'https://example.com/headphones',
    notes: 'Black or silver preferred',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should add item when valid admin token is provided', async () => {
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

    // Second call: item insert
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'new-item-id',
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
    });

    const result = await addItemAction(mockAdminToken, mockItemData);

    // Verify wishlist was validated
    expect(supabase.from).toHaveBeenCalledWith('wishlist');

    // Verify item was inserted
    expect(supabase.from).toHaveBeenCalledWith('items');

    // Verify success response
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe(mockItemData.name);
  });

  it('should return error when admin token is invalid', async () => {
    const invalidToken = 'invalid-token-999';
    const mockFrom = supabase.from as Mock;

    // Mock wishlist validation failure
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'No rows found', code: 'PGRST116' },
          }),
        }),
      }),
    });

    const result = await addItemAction(invalidToken, mockItemData);

    // Verify error response
    expect(result.error).toBe('Invalid admin token');
    expect(result.data).toBeUndefined();

    // Verify wishlist validation was attempted
    expect(supabase.from).toHaveBeenCalledWith('wishlist');
  });

  it('should return error when item name is empty', async () => {
    const invalidItemData = {
      name: '',
      link: 'https://example.com',
      notes: 'Some notes',
    };

    const result = await addItemAction(mockAdminToken, invalidItemData);

    // Verify validation error
    expect(result.error).toBe('Item name is required');
    expect(result.data).toBeUndefined();

    // Verify no database calls were made
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should return error when item name is only whitespace', async () => {
    const invalidItemData = {
      name: '   ',
      link: 'https://example.com',
      notes: 'Some notes',
    };

    const result = await addItemAction(mockAdminToken, invalidItemData);

    // Verify validation error
    expect(result.error).toBe('Item name is required');
    expect(result.data).toBeUndefined();
  });

  it('should handle database errors gracefully', async () => {
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

    // Second call: item insert failure
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error', code: 'DB_ERROR' },
          }),
        }),
      }),
    });

    const result = await addItemAction(mockAdminToken, mockItemData);

    // Verify error response
    expect(result.error).toBe('Failed to add item');
    expect(result.data).toBeUndefined();

    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
  });

  it('should allow optional fields (link and notes) to be empty', async () => {
    const minimalItemData = {
      name: 'Simple Item',
      link: '',
      notes: '',
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

    // Second call: item insert
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'new-item-id',
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
    });

    const result = await addItemAction(mockAdminToken, minimalItemData);

    // Verify success
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe(minimalItemData.name);
  });
});
