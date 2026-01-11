// Database types matching the Supabase schema

export interface Wishlist {
  id: string;
  admin_token: string;
  guest_token: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  wishlist_id: string;
  name: string;
  link: string | null;
  notes: string | null;
  reserved_by_token: string | null;
  is_reserved: boolean;
  created_at: string;
}

// Server action response types
export interface ActionResponse<T = void> {
  data?: T;
  error?: string;
}
