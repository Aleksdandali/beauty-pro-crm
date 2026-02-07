-- ═══════════════════════════════════════════════════════════════════════════
-- 006 — Auth: user_salons table + RLS policies for multi-tenant isolation
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. User ↔ Salon relationship table
CREATE TABLE IF NOT EXISTS user_salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  role VARCHAR DEFAULT 'owner' CHECK (role IN ('owner','admin','master')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, salon_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_salons_user_id ON user_salons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_salons_salon_id ON user_salons(salon_id);

-- Enable RLS on user_salons
ALTER TABLE user_salons ENABLE ROW LEVEL SECURITY;

-- Users can only see their own salon links
CREATE POLICY "Users see own salons" ON user_salons
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. OPTIONAL: Salon isolation RLS policies
--    Uncomment these when ready to replace the "allow_all" policies.
--    WARNING: Make sure all existing users have user_salons entries first!
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper function: get user's salon IDs
CREATE OR REPLACE FUNCTION get_user_salon_ids()
RETURNS SETOF UUID AS $$
  SELECT salon_id FROM user_salons WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

/*
-- NOTE: Uncomment these when ready for production isolation.
-- For now, keep allow_all policies during development.

-- salons
DROP POLICY IF EXISTS "allow_all" ON salons;
CREATE POLICY "Salon isolation" ON salons FOR ALL USING (id IN (SELECT get_user_salon_ids()));

-- clients
DROP POLICY IF EXISTS "allow_all" ON clients;
CREATE POLICY "Salon isolation" ON clients FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- staff
DROP POLICY IF EXISTS "allow_all" ON staff;
CREATE POLICY "Salon isolation" ON staff FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- services
DROP POLICY IF EXISTS "allow_all" ON services;
CREATE POLICY "Salon isolation" ON services FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- appointments
DROP POLICY IF EXISTS "allow_all" ON appointments;
CREATE POLICY "Salon isolation" ON appointments FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- inventory_items
DROP POLICY IF EXISTS "allow_all" ON inventory_items;
CREATE POLICY "Salon isolation" ON inventory_items FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- expenses
DROP POLICY IF EXISTS "allow_all" ON expenses;
CREATE POLICY "Salon isolation" ON expenses FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- payroll
DROP POLICY IF EXISTS "allow_all" ON payroll;
CREATE POLICY "Salon isolation" ON payroll FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- sterilization_cycles
DROP POLICY IF EXISTS "allow_all" ON sterilization_cycles;
CREATE POLICY "Salon isolation" ON sterilization_cycles FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- sterilization_equipment
DROP POLICY IF EXISTS "allow_all" ON sterilization_equipment;
CREATE POLICY "Salon isolation" ON sterilization_equipment FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- sterilization_instrument_sets
DROP POLICY IF EXISTS "allow_all" ON sterilization_instrument_sets;
CREATE POLICY "Salon isolation" ON sterilization_instrument_sets FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));

-- sterilization_storage
DROP POLICY IF EXISTS "allow_all" ON sterilization_storage;
CREATE POLICY "Salon isolation" ON sterilization_storage FOR ALL USING (salon_id IN (SELECT get_user_salon_ids()));
*/

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Link existing demo data to first user (run manually after first login)
-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT INTO user_salons (user_id, salon_id, role)
-- VALUES ('<YOUR_SUPABASE_USER_ID>', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'owner');
--
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || 
--   '{"salon_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "role": "owner"}'::jsonb
-- WHERE id = '<YOUR_SUPABASE_USER_ID>';
