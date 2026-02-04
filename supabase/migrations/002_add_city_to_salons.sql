-- Add city column to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS city TEXT;
