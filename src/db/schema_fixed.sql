-- =====================================================
-- BEAUTY PRO CRM - UNIFIED DATABASE SCHEMA (FIXED)
-- =====================================================
-- Description: Complete database structure for multi-tenant
--              beauty salon management system
-- Version: 1.1 (Fixed - No auth.users trigger)
-- Date: 2026-02-04
-- =====================================================

-- =====================================================
-- 1. ENUMS (Custom Types)
-- =====================================================

-- Drop existing type if exists (for re-runs)
DROP TYPE IF EXISTS user_role CASCADE;

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
  role user_role DEFAULT 'owner',
  
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own shop" ON public.shops;
DROP POLICY IF EXISTS "Owners can update their shop" ON public.shops;
DROP POLICY IF EXISTS "Authenticated users can create shops" ON public.shops;
DROP POLICY IF EXISTS "Owners can delete their shop" ON public.shops;

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

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
-- 5. HELPER FUNCTIONS (Instead of auth.users trigger)
-- =====================================================

-- =====================================================
-- 5.1. FUNCTION: Create or Get User Profile
-- =====================================================
-- Purpose: Create profile if it doesn't exist (called from client)
-- Usage: SELECT create_profile_if_not_exists('John Doe');

CREATE OR REPLACE FUNCTION public.create_profile_if_not_exists(
  p_full_name VARCHAR DEFAULT ''
)
RETURNS public.profiles AS $$
DECLARE
  v_profile public.profiles;
BEGIN
  -- Check if profile exists
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- If not exists, create it
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (auth.uid(), p_full_name, 'owner')
    RETURNING * INTO v_profile;
  END IF;
  
  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_profile_if_not_exists IS 'Creates user profile if it does not exist. Called from client after signup.';

-- =====================================================
-- 5.2. FUNCTION: Update Timestamp on Row Update
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates updated_at timestamp on row modification';

-- =====================================================
-- 5.3. TRIGGERS: Auto-update timestamps
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_shops_updated_at ON public.shops;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

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

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_profiles_shop_id;
DROP INDEX IF EXISTS idx_shops_owner_id;
DROP INDEX IF EXISTS idx_profiles_role;

-- Index on profiles.shop_id for fast shop-based queries
CREATE INDEX idx_profiles_shop_id ON public.profiles(shop_id);

-- Index on shops.owner_id for fast owner lookups
CREATE INDEX idx_shops_owner_id ON public.shops(owner_id);

-- Index on profiles.role for role-based queries
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 7. NOTES & USAGE
-- =====================================================

/*
USAGE INSTRUCTIONS (UPDATED):

1. Run this schema in Supabase SQL Editor
2. Profile Creation (Client-side):
   - After user signs up, call: SELECT create_profile_if_not_exists('User Name');
   - Or from React: supabase.rpc('create_profile_if_not_exists', { p_full_name: 'John' })
   
3. First-time user flow:
   - User signs up → Client calls create_profile_if_not_exists()
   - Profile created with role='owner'
   - User creates their shop → shop.owner_id = user.id
   - User updates their profile.shop_id to link to the shop

4. RLS ensures:
   - Users can only edit their own profile
   - Shop owners can only manage their own shop
   - All profiles are publicly readable (for staff lists, etc.)

WHY NO AUTH.USERS TRIGGER?
- Regular users don't have permission to create triggers on auth.users
- Instead, we use RPC function create_profile_if_not_exists()
- Call this from your signup flow in the client

CLIENT-SIDE INTEGRATION:
After successful signup in your login/signup page:

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: { full_name: 'John Doe' }
  }
});

if (!error) {
  // Create profile
  await supabase.rpc('create_profile_if_not_exists', {
    p_full_name: 'John Doe'
  });
}
```

TESTING:
1. Run this schema
2. Sign up a new user
3. Call: SELECT create_profile_if_not_exists('Test User');
4. Check: SELECT * FROM public.profiles;
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================
