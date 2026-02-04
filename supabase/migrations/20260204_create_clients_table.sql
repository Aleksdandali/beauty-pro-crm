-- =====================================================
-- CLIENTS TABLE (Customer Management)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.clients (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Salon Association (Multi-tenant)
  salon_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  
  -- Client Information
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  birthday DATE,
  notes TEXT,
  
  -- Business Metrics
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  last_visit TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.clients IS 'Customer database for multi-tenant salon management';
COMMENT ON COLUMN public.clients.salon_id IS 'Links client to specific salon (multi-tenant isolation)';
COMMENT ON COLUMN public.clients.total_visits IS 'Total number of appointments completed';
COMMENT ON COLUMN public.clients.total_spent IS 'Total revenue generated from this client';

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CLIENTS TABLE POLICIES
-- =====================================================

-- Policy: Users can only view clients from their own salon
CREATE POLICY "Users can view clients from their salon"
  ON public.clients
  FOR SELECT
  USING (
    salon_id IN (
      SELECT shop_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert clients into their own salon
CREATE POLICY "Users can create clients in their salon"
  ON public.clients
  FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT shop_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can update clients from their own salon
CREATE POLICY "Users can update clients in their salon"
  ON public.clients
  FOR UPDATE
  USING (
    salon_id IN (
      SELECT shop_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete clients from their own salon
CREATE POLICY "Users can delete clients in their salon"
  ON public.clients
  FOR DELETE
  USING (
    salon_id IN (
      SELECT shop_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- INDEXES FOR CLIENTS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_clients_salon_id ON public.clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);

-- =====================================================
-- TRIGGER FOR CLIENTS
-- =====================================================

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PERMISSIONS FOR CLIENTS
-- =====================================================

GRANT ALL ON TABLE public.clients TO postgres;
GRANT ALL ON TABLE public.clients TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clients TO authenticated;
