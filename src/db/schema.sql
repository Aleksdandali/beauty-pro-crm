-- =====================================================
-- BEAUTY PRO CRM - UNIFIED DATABASE SCHEMA
-- =====================================================
-- Description: Complete database structure for multi-tenant
--              beauty salon management system
-- Version: 1.0
-- Date: 2026-02-04
-- =====================================================

-- =====================================================
-- 1. ENUMS (Custom Types)
-- =====================================================

-- User role types
CREATE TYPE user_role AS ENUM (
  'owner',    -- Salon owner (full access)
  'admin',    -- Administrator (almost full access)
  'master',   -- Beauty master/specialist
  'client'    -- Customer/client
);

-- =====================================================
-- 2. SHOPS/SALONS TABLE (Multi-tenant support)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.shops (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Shop Information
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Owner Reference
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.shops IS 'Shops/Salons for multi-tenant support';
COMMENT ON COLUMN public.shops.owner_id IS 'The user who owns/created this shop';

-- =====================================================
-- 3. PROFILES TABLE (User Profiles)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary Key (matches auth.users.id)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile Information
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(50),
  
  -- Role & Access
  role user_role DEFAULT 'client',
  
  -- Shop/Salon Association
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN public.profiles.id IS 'Matches auth.users.id (1-to-1 relationship)';
COMMENT ON COLUMN public.profiles.role IS 'User role: owner, admin, master, or client';
COMMENT ON COLUMN public.profiles.shop_id IS 'Links user to a specific shop (multi-tenant)';

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4.1. SHOPS TABLE POLICIES
-- =====================================================

-- Policy: Shop owners can view their own shop
CREATE POLICY "Users can view their own shop"
  ON public.shops
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Shop owners can update their own shop
CREATE POLICY "Owners can update their shop"
  ON public.shops
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Policy: Any authenticated user can create a shop (first-time setup)
CREATE POLICY "Authenticated users can create shops"
  ON public.shops
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Shop owners can delete their shop
CREATE POLICY "Owners can delete their shop"
  ON public.shops
  FOR DELETE
  USING (auth.uid() = owner_id);

-- =====================================================
-- 4.2. PROFILES TABLE POLICIES
-- =====================================================

-- Policy: Users can view all profiles (public read for basic info)
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- 5. AUTOMATIC TRIGGERS
-- =====================================================

-- =====================================================
-- 5.1. FUNCTION: Handle New User Registration
-- =====================================================
-- Purpose: Automatically create a profile entry when a user signs up
-- Trigger: ON INSERT to auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the newly registered user
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,                          -- User ID from auth.users
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), -- Extract full_name from metadata
    'owner'::user_role               -- Default role: 'owner' for first setup
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry when a user signs up via Supabase Auth';

-- =====================================================
-- 5.2. TRIGGER: Create Profile on User Registration
-- =====================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger to create profile automatically on user signup';

-- =====================================================
-- 5.3. FUNCTION: Update Timestamp on Row Update
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates updated_at timestamp on row modification';

-- =====================================================
-- 5.4. TRIGGERS: Auto-update timestamps
-- =====================================================

-- Trigger for shops table
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. INDEXES (Performance Optimization)
-- =====================================================

-- Index on profiles.shop_id for fast shop-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_shop_id ON public.profiles(shop_id);

-- Index on shops.owner_id for fast owner lookups
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON public.shops(owner_id);

-- Index on profiles.role for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 7. NOTES & USAGE
-- =====================================================

/*
USAGE INSTRUCTIONS:

1. Run this schema in Supabase SQL Editor or via migration
2. When a user signs up:
   - Supabase Auth creates entry in auth.users
   - Trigger automatically creates entry in public.profiles with role='owner'
3. First-time user flow:
   - User signs up → Profile created with role='owner'
   - User creates their shop → shop.owner_id = user.id
   - User updates their profile.shop_id to link to the shop
4. RLS ensures:
   - Users can only edit their own profile
   - Shop owners can only manage their own shop
   - All profiles are publicly readable (for staff lists, etc.)

MULTI-TENANT ARCHITECTURE:
- Each shop is isolated by shop_id
- Users belong to one shop (profiles.shop_id)
- RLS policies enforce data isolation at the database level

DEFAULT ROLE:
- New users get 'owner' role by default
- Change line 117 to 'client' if you want default clients instead
- Admins can manually update roles via dashboard

TESTING:
1. Sign up a new user via Supabase Auth
2. Check public.profiles - should have automatic entry
3. Create a shop with that user as owner
4. Verify RLS: User can only see/edit their data
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================
