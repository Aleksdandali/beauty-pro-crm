# 📊 Database Schema Documentation

## 🎯 Overview

This directory contains the unified database schema for **Beauty Pro CRM** - a multi-tenant beauty salon management system.

## 📁 Files

- `schema.sql` - Complete database structure with tables, triggers, and RLS policies

## 🚀 Quick Start

### Option 1: Apply via Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy contents of `schema.sql`
5. Click **Run**

### Option 2: Apply via Supabase CLI

```bash
# Make sure you're linked to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Run the schema
npx supabase db push --db-url "$DATABASE_URL"

# Or directly execute
psql "$DATABASE_URL" < src/db/schema.sql
```

## 📊 Database Structure

### Tables

#### 1. `public.shops`
Multi-tenant shops/salons table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Shop name |
| `address` | TEXT | Shop address |
| `phone` | VARCHAR(50) | Contact phone |
| `email` | VARCHAR(255) | Contact email |
| `owner_id` | UUID | References `auth.users` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

#### 2. `public.profiles`
User profiles linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (matches `auth.users.id`) |
| `full_name` | VARCHAR(255) | User's full name |
| `avatar_url` | TEXT | Avatar image URL |
| `phone` | VARCHAR(50) | Contact phone |
| `role` | user_role | User role (enum) |
| `shop_id` | UUID | References `public.shops` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### Enums

#### `user_role`
- `owner` - Salon owner (full access)
- `admin` - Administrator (almost full access)
- `master` - Beauty master/specialist
- `client` - Customer/client

## 🔐 Security (RLS Policies)

### Shops Table
- ✅ Users can view their own shop
- ✅ Owners can update their shop
- ✅ Authenticated users can create shops
- ✅ Owners can delete their shop

### Profiles Table
- ✅ All profiles are publicly readable
- ✅ Users can create their own profile
- ✅ Users can update only their own profile
- ✅ Users can delete only their own profile

## ⚙️ Automatic Triggers

### 1. `handle_new_user()`
**Purpose:** Automatically creates a profile entry when a user signs up via Supabase Auth.

**Trigger:** `on_auth_user_created` (AFTER INSERT on `auth.users`)

**Default Role:** `owner` (change line 117 in schema.sql to modify)

**Flow:**
```
User signs up
    ↓
auth.users entry created
    ↓
Trigger fires
    ↓
public.profiles entry created with role='owner'
```

### 2. `update_updated_at_column()`
**Purpose:** Automatically updates `updated_at` timestamp on row modification.

**Applied to:**
- `public.shops`
- `public.profiles`

## 🏗️ Multi-Tenant Architecture

### How it works:

1. **Shop Isolation:**
   - Each shop has a unique `id`
   - Users belong to one shop via `profiles.shop_id`

2. **User Flow:**
   ```
   User signs up → Profile created (role='owner')
                ↓
   User creates shop → shop.owner_id = user.id
                ↓
   User links to shop → profile.shop_id = shop.id
   ```

3. **Data Isolation:**
   - RLS policies enforce shop-level isolation
   - Users only see data from their shop
   - Queries filter by `shop_id` automatically

## 🧪 Testing

### 1. Test User Registration

```sql
-- Sign up a new user via Supabase Auth UI or API
-- Then check:
SELECT * FROM public.profiles WHERE id = 'NEW_USER_ID';
-- Should see automatic profile entry with role='owner'
```

### 2. Test RLS Policies

```sql
-- As User A, try to view User B's profile
SELECT * FROM public.profiles WHERE id = 'USER_B_ID';
-- Should work (public read)

-- As User A, try to update User B's profile
UPDATE public.profiles 
SET full_name = 'Hacked' 
WHERE id = 'USER_B_ID';
-- Should FAIL (RLS blocks it)
```

### 3. Test Shop Creation

```sql
-- As authenticated user
INSERT INTO public.shops (name, owner_id)
VALUES ('My Salon', auth.uid());
-- Should work

-- Link profile to shop
UPDATE public.profiles
SET shop_id = 'SHOP_ID'
WHERE id = auth.uid();
-- Should work
```

## 🔧 Customization

### Change Default Role

Edit line 117 in `schema.sql`:

```sql
-- Current (default to owner):
'owner'::user_role

-- Change to client:
'client'::user_role
```

### Add New Roles

Edit the enum:

```sql
CREATE TYPE user_role AS ENUM (
  'owner',
  'admin',
  'master',
  'client',
  'guest'  -- Add new role
);
```

Then re-run the schema (drop the enum first if it exists).

## 📝 Notes

- **Default Role:** New users get `owner` role (good for first-time setup)
- **Multi-tenant:** Each shop is isolated by `shop_id`
- **RLS:** Enforces data isolation at database level
- **Triggers:** Automatic profile creation and timestamp updates
- **Performance:** Indexes on frequently queried columns

## 🐛 Troubleshooting

### Profile not created automatically?

1. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Check function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. Re-create trigger:
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   -- Then re-run schema.sql
   ```

### RLS blocking legitimate queries?

1. Check current user:
   ```sql
   SELECT auth.uid();
   ```

2. Check policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. Temporarily disable RLS (TESTING ONLY):
   ```sql
   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
   ```

## 📚 Related Documentation

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
- [Multi-tenant Architecture](https://supabase.com/docs/guides/auth/row-level-security#multi-tenant-apps)

---

**Created:** 2026-02-04  
**Version:** 1.0  
**Maintainer:** Beauty Pro CRM Team
