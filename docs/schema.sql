-- Wishlist App Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_token TEXT NOT NULL UNIQUE,
  guest_token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'My Wishlist',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES wishlist(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  link TEXT,
  notes TEXT,
  reserved_by_token TEXT,
  is_reserved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_admin_token ON wishlist(admin_token);
CREATE INDEX IF NOT EXISTS idx_wishlist_guest_token ON wishlist(guest_token);
CREATE INDEX IF NOT EXISTS idx_items_wishlist_id ON items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_items_reserved ON items(is_reserved);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wishlist table
DROP TRIGGER IF EXISTS update_wishlist_updated_at ON wishlist;
CREATE TRIGGER update_wishlist_updated_at
  BEFORE UPDATE ON wishlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
