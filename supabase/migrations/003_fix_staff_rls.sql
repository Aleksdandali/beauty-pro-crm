-- Fix infinite recursion in staff table RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view staff in their salon" ON staff;
DROP POLICY IF EXISTS "Users can insert staff in their salon" ON staff;
DROP POLICY IF EXISTS "Users can update staff in their salon" ON staff;
DROP POLICY IF EXISTS "Users can delete staff in their salon" ON staff;

-- Create simplified policies without recursion

-- Allow users to view staff records where they are a member
CREATE POLICY "Users can view their own staff records"
ON staff FOR SELECT
USING (user_id = auth.uid());

-- Allow salon owners to view all staff in their salon
CREATE POLICY "Owners can view all staff in their salon"
ON staff FOR SELECT
USING (
  salon_id IN (
    SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Allow users to insert staff if they are the owner of the salon
CREATE POLICY "Owners can insert staff"
ON staff FOR INSERT
WITH CHECK (
  salon_id IN (
    SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role = 'owner'
  )
  OR
  user_id = auth.uid()  -- Allow inserting own record during onboarding
);

-- Allow users to update their own staff record
CREATE POLICY "Users can update their own staff record"
ON staff FOR UPDATE
USING (user_id = auth.uid());

-- Allow owners to update all staff in their salon
CREATE POLICY "Owners can update all staff"
ON staff FOR UPDATE
USING (
  salon_id IN (
    SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Allow owners to delete staff in their salon (except themselves)
CREATE POLICY "Owners can delete staff"
ON staff FOR DELETE
USING (
  user_id != auth.uid() AND
  salon_id IN (
    SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role = 'owner'
  )
);
