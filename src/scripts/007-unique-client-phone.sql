-- ═══════════════════════════════════════════════════════════════════════════════
-- 007: UNIQUE constraint on clients(salon_id, phone)
-- Prevents duplicate clients with the same phone number within a salon.
-- NULL phones are excluded (NULL != NULL in PostgreSQL).
-- ═══════════════════════════════════════════════════════════════════════════════

-- First, find and remove exact duplicates (keep the one with most visits or most recent)
-- This is a safety step — if duplicates already exist, the UNIQUE constraint will fail.

-- Step 1: Identify duplicates
DO $$
DECLARE
  dup RECORD;
  keep_id UUID;
BEGIN
  FOR dup IN
    SELECT salon_id, phone, array_agg(id ORDER BY total_visits DESC NULLS LAST, created_at ASC) AS ids
    FROM clients
    WHERE phone IS NOT NULL AND phone != ''
    GROUP BY salon_id, phone
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the first one (most visits), delete the rest
    keep_id := dup.ids[1];
    
    -- Update appointments to point to the kept client
    UPDATE appointments SET client_id = keep_id 
    WHERE client_id = ANY(dup.ids[2:array_length(dup.ids, 1)]);
    
    -- Delete duplicate clients
    DELETE FROM clients 
    WHERE id = ANY(dup.ids[2:array_length(dup.ids, 1)]);
    
    RAISE NOTICE 'Merged % duplicates for phone % in salon %, kept %', 
      array_length(dup.ids, 1) - 1, dup.phone, dup.salon_id, keep_id;
  END LOOP;
END $$;

-- Step 2: Create the unique constraint (only for non-empty phones)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_client_phone_per_salon 
  ON clients(salon_id, phone) 
  WHERE phone IS NOT NULL AND phone != '';

-- Verify
SELECT 'Unique constraint created successfully' AS status;
