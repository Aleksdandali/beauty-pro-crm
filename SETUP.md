# Beauty Pro CRM - Setup Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Supabase account (free tier is sufficient to start)
- Git (optional, for version control)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Supabase Setup

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Fill in:
   - **Project Name**: beauty-pro-crm
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to your location
5. Wait for the project to be created (~2 minutes)

### 2.2 Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the `anon` API key)
   - **service_role** key (click "Reveal" to see it)

### 2.3 Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 2.4 Run Database Migration

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase/migrations/001_initial_schema.sql`
5. Copy ALL the SQL content from that file
6. Paste it into the SQL Editor in Supabase
7. Click **Run** (or press Ctrl+Enter)
8. Wait for the query to complete (you should see "Success. No rows returned")

This will create:
- All database tables (salons, staff, clients, services, appointments, inventory)
- Row Level Security (RLS) policies for multi-tenant data isolation
- Indexes for performance
- Triggers for automatic updates
- Functions for user signup automation

## Step 3: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see all these tables:
   - salons
   - staff
   - clients
   - services
   - appointments
   - inventory_brands
   - inventory_products
   - inventory_transactions

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Create Your First Account

1. Go to http://localhost:3000
2. You'll be redirected to the sign-in page
3. Click "Sign Up" (Зареєструватися)
4. Fill in:
   - **Salon Name**: Your salon name
   - **Email**: Your email
   - **Password**: Strong password (min 6 characters)
5. Click "Sign Up"

The system will automatically:
- Create your salon
- Create your owner staff account
- Redirect you to the dashboard

## Architecture Overview

### Multi-Tenant System

Every salon has its own isolated data:
- Each user signs up and automatically gets a salon created
- All data (clients, appointments, services, inventory) is linked to a salon
- Row Level Security (RLS) ensures salons can only access their own data

### Authentication Flow

1. User signs up → Supabase Auth creates user
2. Trigger automatically creates salon + staff entry
3. User signs in → JWT token stored in cookies
4. All API requests use RLS to filter by salon_id

### Database Schema

```
salons (main tenant entity)
  ├── staff (employees of the salon)
  ├── clients (salon's clients)
  ├── services (services offered)
  ├── appointments (bookings)
  └── inventory
      ├── brands (DEZIK, GETLOUD, etc.)
      ├── products (inventory items)
      └── transactions (stock movements)
```

## Key Features

### 1. Dashboard
- Today's appointments overview
- Revenue statistics
- Client statistics
- Quick actions

### 2. Appointments Management
- Create/edit/delete appointments
- Multiple status tracking (scheduled, confirmed, in_progress, completed, cancelled, no_show)
- Client, staff, and service association
- Real-time updates

### 3. Client Management
- Client database with contact info
- Visit history and spending tracking
- Automatic statistics updates
- Birthday tracking

### 4. Services Catalog
- Service categories
- Duration and pricing
- Active/inactive status

### 5. Staff Management
- Multiple roles (owner, admin, staff)
- Specialization tracking
- Access control based on roles

### 6. Inventory System
- Multi-brand support (DEZIK, GETLOUD, custom)
- Stock levels and alerts
- Purchase/usage/adjustment tracking
- Cost and retail pricing

### 7. Multi-Language
- Ukrainian (default)
- English
- Easy to add more languages

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Localized routes
│   │   ├── auth/               # Authentication pages
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   └── (dashboard)/        # Protected dashboard routes
│   │       ├── dashboard/
│   │       ├── appointments/
│   │       ├── clients/
│   │       ├── services/
│   │       ├── staff/
│   │       ├── inventory/
│   │       └── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                      # Shadcn UI components
│   └── features/                # Feature components
│       ├── sidebar.tsx
│       └── header.tsx
├── lib/
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── middleware.ts      # Auth middleware
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-salon.ts
│   │   ├── use-clients.ts
│   │   └── use-appointments.ts
│   └── utils.ts                # Helper functions
├── messages/                    # Localization files
│   ├── uk.json
│   └── en.json
├── types/
│   ├── database.ts             # Supabase generated types
│   └── index.ts                # App types
└── i18n.ts                      # i18n configuration
```

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow component-based architecture
- Use Tailwind CSS for styling (ultra-minimalist design)
- Implement proper error handling

### Adding New Features

1. **Database**: Add migration in `supabase/migrations/`
2. **Types**: Update `src/types/database.ts` with new table types
3. **Hooks**: Create custom hooks in `src/lib/hooks/`
4. **Components**: Build reusable UI components
5. **Pages**: Add route in appropriate `app/[locale]/` folder
6. **Localization**: Add translations to `messages/*.json`

### Color Palette (Ultra-Minimalist)
- Primary: Black (#000000)
- Background: White (#FFFFFF)
- Borders: Zinc-200 (#E4E4E7)
- Text: Zinc-900 (#18181B)
- Muted: Zinc-500 (#71717A)
- Accents: Zinc-100 (#F4F4F5) for backgrounds

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Troubleshooting

### Issue: Can't sign up
- **Check**: Supabase project is active
- **Check**: Environment variables are correct
- **Check**: Migration was run successfully
- **Check**: Email confirmation is disabled in Supabase (Settings > Authentication)

### Issue: RLS errors
- **Check**: Migration created all policies
- **Check**: User is authenticated (JWT token exists)
- **Check**: Staff entry exists for the user

### Issue: No data showing
- **Check**: Salon was created for the user
- **Check**: Staff entry links user to salon
- **Check**: Browser console for errors

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Shadcn UI**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query

## License

Private project for Beauty Pro CRM.
