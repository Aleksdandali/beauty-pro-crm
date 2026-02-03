-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create salons table
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT,
    phone TEXT,
    email TEXT,
    currency TEXT DEFAULT 'UAH',
    timezone TEXT DEFAULT 'Europe/Kiev',
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    specialization TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, user_id)
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    birthday DATE,
    notes TEXT,
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    last_visit TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_brands table
CREATE TABLE inventory_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, slug)
);

-- Create inventory_products table
CREATE TABLE inventory_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES inventory_brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    unit TEXT DEFAULT 'шт',
    quantity DECIMAL(10, 2) DEFAULT 0,
    min_quantity DECIMAL(10, 2) DEFAULT 0,
    cost_price DECIMAL(10, 2) NOT NULL,
    retail_price DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, sku)
);

-- Create inventory_transactions table
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'adjustment', 'sale')),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_staff_salon_id ON staff(salon_id);
CREATE INDEX idx_clients_salon_id ON clients(salon_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_services_salon_id ON services(salon_id);
CREATE INDEX idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_inventory_brands_salon_id ON inventory_brands(salon_id);
CREATE INDEX idx_inventory_products_salon_id ON inventory_products(salon_id);
CREATE INDEX idx_inventory_products_brand_id ON inventory_products(brand_id);
CREATE INDEX idx_inventory_transactions_salon_id ON inventory_transactions(salon_id);
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_brands_updated_at BEFORE UPDATE ON inventory_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_products_updated_at BEFORE UPDATE ON inventory_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for salons
CREATE POLICY "Users can view their own salons" ON salons FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.uid() IN (SELECT user_id FROM staff WHERE salon_id = salons.id)
);

CREATE POLICY "Users can insert their own salons" ON salons FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Salon owners can update their salons" ON salons FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Salon owners can delete their salons" ON salons FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for staff
CREATE POLICY "Staff can view salon staff" ON staff FOR SELECT USING (
    salon_id IN (SELECT id FROM salons WHERE owner_id = auth.uid() OR id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()))
);

CREATE POLICY "Salon owners and admins can insert staff" ON staff FOR INSERT WITH CHECK (
    salon_id IN (
        SELECT id FROM salons WHERE owner_id = auth.uid()
        UNION
        SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Salon owners and admins can update staff" ON staff FOR UPDATE USING (
    salon_id IN (
        SELECT id FROM salons WHERE owner_id = auth.uid()
        UNION
        SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Salon owners can delete staff" ON staff FOR DELETE USING (
    salon_id IN (SELECT id FROM salons WHERE owner_id = auth.uid())
);

-- Create RLS policies for clients (accessible by all staff of the salon)
CREATE POLICY "Staff can view salon clients" ON clients FOR SELECT USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can insert clients" ON clients FOR INSERT WITH CHECK (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can update clients" ON clients FOR UPDATE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can delete clients" ON clients FOR DELETE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Create similar RLS policies for services
CREATE POLICY "Staff can view salon services" ON services FOR SELECT USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can insert services" ON services FOR INSERT WITH CHECK (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Staff can update services" ON services FOR UPDATE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Staff can delete services" ON services FOR DELETE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Create RLS policies for appointments
CREATE POLICY "Staff can view salon appointments" ON appointments FOR SELECT USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can insert appointments" ON appointments FOR INSERT WITH CHECK (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can update appointments" ON appointments FOR UPDATE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can delete appointments" ON appointments FOR DELETE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

-- Create RLS policies for inventory_brands
CREATE POLICY "Staff can view salon brands" ON inventory_brands FOR SELECT USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can insert brands" ON inventory_brands FOR INSERT WITH CHECK (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Staff can update brands" ON inventory_brands FOR UPDATE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Staff can delete brands" ON inventory_brands FOR DELETE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Create RLS policies for inventory_products
CREATE POLICY "Staff can view salon products" ON inventory_products FOR SELECT USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can insert products" ON inventory_products FOR INSERT WITH CHECK (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can update products" ON inventory_products FOR UPDATE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can delete products" ON inventory_products FOR DELETE USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Create RLS policies for inventory_transactions
CREATE POLICY "Staff can view salon transactions" ON inventory_transactions FOR SELECT USING (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can insert transactions" ON inventory_transactions FOR INSERT WITH CHECK (
    salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid())
);

-- Create function to automatically create salon and staff entry on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_salon_id UUID;
    salon_slug TEXT;
BEGIN
    -- Generate a unique slug from salon name
    salon_slug := lower(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'salon_name', 'My Salon'), '[^a-zA-Z0-9]+', '-', 'g'));
    
    -- Create salon for the new user
    INSERT INTO salons (name, slug, owner_id)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'salon_name', 'My Salon'),
        salon_slug || '-' || substring(NEW.id::text from 1 for 8),
        NEW.id
    )
    RETURNING id INTO new_salon_id;
    
    -- Create staff entry for the owner
    INSERT INTO staff (salon_id, user_id, role, name, email)
    VALUES (
        new_salon_id,
        NEW.id,
        'owner',
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create function to update client statistics
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE clients
        SET 
            total_visits = total_visits + 1,
            total_spent = total_spent + NEW.price,
            last_visit = NEW.end_time
        WHERE id = NEW.client_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update client stats on appointment completion
CREATE TRIGGER update_client_stats_trigger
    AFTER UPDATE OF status ON appointments
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_client_stats();
