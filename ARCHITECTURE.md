# Beauty Pro CRM - Architecture Documentation

## System Overview

Beauty Pro CRM is a multi-tenant SaaS platform built with modern web technologies, designed for beauty salons to manage their operations efficiently. The system uses a serverless architecture with Supabase as the backend and Next.js 15 for the frontend.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide Icons
- **State Management**: TanStack Query v5 (React Query)
- **Form Validation**: Zod
- **Localization**: next-intl

### Backend
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage (future)
- **Real-time**: Supabase Realtime (future)

## Architecture Patterns

### 1. Multi-Tenant Architecture

#### Tenant Isolation Strategy
Each salon is a separate tenant with complete data isolation:

```
User → Auth → Staff → Salon → Data
                      └─ Clients
                      └─ Appointments
                      └─ Services
                      └─ Inventory
```

**Key Principles:**
- Every data table has a `salon_id` foreign key
- Row Level Security (RLS) enforces tenant boundaries
- Users can belong to multiple salons (via staff table)
- No cross-tenant data access is possible

#### Data Flow
```
1. User signs up → Supabase Auth creates user
2. Database trigger fires → Creates salon + staff entry
3. User signs in → JWT token with user_id
4. Client requests data → RLS filters by salon_id automatically
5. Only that salon's data is returned
```

### 2. Authentication & Authorization

#### Authentication Flow
```mermaid
User → Sign In → Supabase Auth → JWT Token → Cookie Storage
                                             → All API Requests
```

**Implementation:**
- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts`
- Middleware: `middleware.ts` (auth + i18n)

#### Authorization Levels
1. **Owner**: Full access to everything
2. **Admin**: Full access except salon deletion
3. **Staff**: Limited access to daily operations

**RLS Policies:**
- Read: All staff can view salon data
- Write: Depends on role and resource type
- Delete: Usually owner/admin only

### 3. Database Schema Design

#### Core Entities

**Salons (Tenant Entity)**
```sql
id          : UUID (PK)
name        : TEXT
slug        : TEXT (unique)
owner_id    : UUID → auth.users
currency    : TEXT
settings    : JSONB
```

**Staff (User-Salon Link)**
```sql
id            : UUID (PK)
salon_id      : UUID → salons
user_id       : UUID → auth.users
role          : ENUM (owner, admin, staff)
name          : TEXT
specialization: TEXT
```

**Clients**
```sql
id          : UUID (PK)
salon_id    : UUID → salons
name        : TEXT
phone       : TEXT
email       : TEXT
total_visits: INTEGER
total_spent : DECIMAL
```

**Appointments**
```sql
id         : UUID (PK)
salon_id   : UUID → salons
client_id  : UUID → clients
staff_id   : UUID → staff
service_id : UUID → services
start_time : TIMESTAMPTZ
status     : ENUM
price      : DECIMAL
```

#### Relationships
```
salons (1) ──── (N) staff
            └── (N) clients
            └── (N) services
            └── (N) appointments
            └── (N) inventory_brands
                    └── (N) inventory_products
                            └── (N) inventory_transactions
```

### 4. Frontend Architecture

#### Folder Structure
```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalization
│   │   ├── auth/         # Public routes
│   │   └── (dashboard)/  # Protected routes (layout)
│   ├── globals.css
│   ├── layout.tsx
│   └── providers.tsx     # React Query, etc.
│
├── components/
│   ├── ui/               # Shadcn components (reusable)
│   └── features/         # Business logic components
│
├── lib/
│   ├── supabase/        # Database clients
│   ├── hooks/           # Custom React hooks
│   └── utils.ts         # Helper functions
│
├── types/
│   ├── database.ts      # Generated from Supabase
│   └── index.ts         # App-specific types
│
└── messages/            # i18n translations
    ├── uk.json
    └── en.json
```

#### Component Architecture

**Atomic Design Principles:**
1. **Atoms**: `src/components/ui/` - Button, Input, Card
2. **Molecules**: Feature-specific combos
3. **Organisms**: `src/components/features/` - Sidebar, Header
4. **Templates**: Layout components
5. **Pages**: `src/app/[locale]/` - Full pages

#### State Management Strategy

**Server State (TanStack Query):**
- All database queries
- Automatic caching and revalidation
- Optimistic updates
- Background refetching

**Client State (React useState/useReducer):**
- Form inputs
- UI state (modals, dropdowns)
- Temporary data

**No Global State:**
- React Query cache serves as global state
- No Redux/Zustand needed
- Simpler mental model

### 5. Data Fetching Patterns

#### React Query Hooks Pattern
```typescript
// src/lib/hooks/use-clients.ts
export function useClients(salonId?: string) {
  return useQuery({
    queryKey: ["clients", salonId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("salon_id", salonId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
}
```

**Key Features:**
- Automatic caching with `queryKey`
- Conditional fetching with `enabled`
- Type-safe with TypeScript
- Automatic refetching on window focus

#### Mutation Pattern
```typescript
export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
```

### 6. Routing Structure

#### File-Based Routing (Next.js App Router)
```
/                           → Redirect to /uk or /en
/[locale]                   → Home (redirect to auth or dashboard)
/[locale]/auth/signin       → Sign in page
/[locale]/auth/signup       → Sign up page
/[locale]/(dashboard)/      → Protected layout
  ├── dashboard             → Main dashboard
  ├── appointments          → Appointments list
  ├── clients              → Clients list
  ├── services             → Services catalog
  ├── staff                → Staff management
  ├── inventory            → Inventory system
  └── settings             → Settings panel
```

#### Middleware Chain
```typescript
Request → Auth Check → i18n → Response
```

1. **Auth**: Update Supabase session
2. **i18n**: Set locale based on URL
3. **Response**: Merged headers

### 7. Styling Architecture

#### Tailwind Configuration
```javascript
// Ultra-minimalist palette
colors: {
  black: '#000000',      // Primary actions, text
  white: '#FFFFFF',      // Background
  zinc: {
    100: '#F4F4F5',     // Subtle backgrounds
    200: '#E4E4E7',     // Borders
    300: '#D4D4D8',     // Dividers
    500: '#71717A',     // Muted text
    900: '#18181B',     // Primary text
  }
}
```

#### Component Styling Pattern
```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardContent className="pt-6">
    <h4 className="font-semibold text-lg">{title}</h4>
    <p className="text-sm text-zinc-600">{description}</p>
  </CardContent>
</Card>
```

**Principles:**
- Use Tailwind utility classes
- Consistent spacing (4, 6, 8, 12, 16, 24)
- No custom CSS unless absolutely necessary
- Mobile-first responsive design

### 8. Localization Strategy

#### next-intl Implementation
```typescript
// src/i18n.ts
export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

#### Translation Usage
```tsx
const t = useTranslations("clients");

<h1>{t("title")}</h1>  // → "Клієнти" or "Clients"
<Button>{t("newClient")}</Button>
```

**Message Structure:**
```json
{
  "clients": {
    "title": "Clients",
    "newClient": "New Client",
    "name": "Name"
  }
}
```

### 9. Security Model

#### Row Level Security (RLS)

**Example Policy:**
```sql
CREATE POLICY "Staff can view salon clients" 
ON clients FOR SELECT 
USING (
  salon_id IN (
    SELECT salon_id 
    FROM staff 
    WHERE user_id = auth.uid()
  )
);
```

**Benefits:**
- Enforced at database level
- No way to bypass
- Works with all database clients
- Automatic filtering

#### Authentication Security
- JWT tokens stored in HTTP-only cookies
- Tokens expire after inactivity
- Refresh tokens automatically renewed
- CSRF protection via Supabase

#### Data Validation
- Client-side: React Hook Form + Zod
- Server-side: PostgreSQL constraints
- RLS: Access control
- Input sanitization automatic via Supabase

### 10. Performance Optimization

#### Current Optimizations
1. **Server Components**: Default rendering strategy
2. **React Query Caching**: Reduces API calls
3. **Database Indexes**: On foreign keys and common queries
4. **Lazy Loading**: Components loaded on demand
5. **Image Optimization**: Next.js automatic optimization

#### Future Optimizations
- Bundle splitting
- Service worker (PWA)
- GraphQL/API optimization
- Database query optimization
- CDN for static assets

### 11. Error Handling

#### Client-Side Errors
```tsx
try {
  await createClient(data);
  toast({ title: "Success" });
} catch (error) {
  toast({
    variant: "destructive",
    title: "Error",
    description: error.message,
  });
}
```

#### React Query Error Handling
```typescript
useQuery({
  queryKey: ["clients"],
  queryFn: fetchClients,
  onError: (error) => {
    console.error("Failed to fetch clients:", error);
  },
  retry: 3,
  retryDelay: 1000,
});
```

### 12. Testing Strategy (Future)

#### Planned Tests
1. **Unit Tests**: Utility functions, hooks
2. **Integration Tests**: API calls, database queries
3. **E2E Tests**: User flows (Playwright)
4. **Component Tests**: React Testing Library

### 13. Deployment Architecture

```
User → Vercel Edge → Next.js App → Supabase
                                  ↓
                            PostgreSQL
```

**Production Setup:**
- **Frontend**: Vercel (edge functions, CDN)
- **Backend**: Supabase (managed PostgreSQL)
- **CDN**: Vercel automatically
- **SSL**: Automatic via Vercel

### 14. Monitoring & Analytics (Future)

**Planned Integrations:**
- Error tracking: Sentry
- Analytics: Vercel Analytics
- Performance: Web Vitals
- User behavior: LogRocket
- Database: Supabase built-in metrics

## Design Decisions & Trade-offs

### Why Next.js 15?
- App Router for better routing
- Server Components reduce JS bundle
- Built-in API routes
- Excellent TypeScript support
- Great developer experience

### Why Supabase?
- PostgreSQL (proven, reliable)
- Built-in auth (no need for Auth0, etc.)
- Row Level Security (perfect for multi-tenant)
- Real-time capabilities
- Generous free tier

### Why TanStack Query?
- Best-in-class data fetching
- Automatic caching
- Optimistic updates
- Reduces boilerplate
- Great DevTools

### Why Shadcn UI?
- Full control over components
- No package dependencies
- Customizable with Tailwind
- Accessible by default
- Copy-paste, not import

## Best Practices

### Component Creation
1. Start with UI component from Shadcn
2. Create feature component combining UI components
3. Add business logic via hooks
4. Keep components small and focused
5. Use TypeScript for all props

### Database Queries
1. Always use RLS policies
2. Create indexes for foreign keys
3. Use transactions for related operations
4. Validate data at multiple levels
5. Use prepared statements (automatic via Supabase)

### Code Organization
1. One component per file
2. Group by feature, not by type
3. Colocate related code
4. Extract reusable hooks
5. Keep files under 300 lines

## Conclusion

This architecture provides:
- **Scalability**: Multi-tenant design scales horizontally
- **Security**: RLS + JWT ensures data safety
- **Performance**: Caching and optimization built-in
- **Maintainability**: Clean code, TypeScript, modular
- **Developer Experience**: Modern tools, hot reload, type safety

The system is production-ready for small-to-medium salons and can scale to thousands of tenants with minimal changes.
