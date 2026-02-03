# 🎨 Beauty Pro CRM - Autonomous SaaS Platform

> **Ultra-minimalist, multi-tenant CRM system** designed for beauty salons with integrated inventory management.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)

---

## 🚀 Quick Start

**⚡ Get running in 5 minutes!** Use our automated setup:

```bash
# 1. Базовая настройка (Supabase + GitHub)
npm install && npm run setup

# 2. Расширение CRM (таблицы + типы)
npm run db:expand

# 3. Запуск проекта
npm run dev
```

**🚀 Автоматизация включает:**
- ✅ Supabase configuration (API keys + database)
- ✅ GitHub repository creation and push
- ✅ CRM tables (clients, services, inventory, appointments)
- ✅ RLS policies + indexes + triggers
- ✅ **Auto TypeScript types generation**
- ✅ .env.local creation

**📖 Руководства:**
- [RUN_THIS_FIRST.md](./RUN_THIS_FIRST.md) - Быстрый старт
- [SETUP_WIZARD.md](./SETUP_WIZARD.md) - Setup wizard
- [DB_EXPAND_GUIDE.md](./DB_EXPAND_GUIDE.md) - Расширение БД
- [QUICKSTART.md](./QUICKSTART.md) - Ручная настройка

---

## ✨ What You Get

### ✅ Complete Foundation
- **Multi-tenant architecture** - Each salon has isolated data
- **Secure authentication** - Supabase Auth with JWT
- **Beautiful UI** - Ultra-minimalist black/white/zinc design
- **Mobile-first** - Fully responsive on all devices
- **Multi-language** - Ukrainian (default) + English

### ✅ Core Features
- 📊 **Dashboard** - Statistics and quick overview
- 📅 **Appointments** - Booking management with status tracking
- 👥 **Clients** - Customer database with analytics
- 💼 **Services** - Catalog with pricing and duration
- 👨‍💼 **Staff** - Team management with roles
- 📦 **Inventory** - Products and brands (DEZIK, GETLOUD support)
- ⚙️ **Settings** - Salon configuration and preferences

### ✅ Technical Excellence
- **TypeScript** - Strict type safety throughout
- **TanStack Query** - Optimized data fetching and caching
- **Shadcn UI** - 10 beautiful, accessible components
- **Row Level Security** - Database-enforced data isolation
- **Custom Hooks** - Reusable React hooks for CRUD operations

---

## 🏗️ Tech Stack

### Frontend
```
⚛️  Next.js 15 (App Router with RSC)
📘 TypeScript (strict mode)
🎨 Tailwind CSS (ultra-minimalist palette)
🧩 Shadcn UI (Radix primitives)
🔍 Lucide Icons
🔄 TanStack Query v5
✅ Zod validation
🌐 next-intl (i18n)
```

### Backend
```
🗄️  Supabase (PostgreSQL)
🔐 Supabase Auth (JWT-based)
🛡️  Row Level Security (RLS)
⚡ Real-time capabilities (ready)
```

---

## 📁 Project Structure

```
Shine_crm_final/
├── 📚 Documentation
│   ├── QUICKSTART.md          ⭐ Start here!
│   ├── SETUP.md               Detailed setup
│   ├── ARCHITECTURE.md        Technical deep dive
│   ├── FEATURES.md            Roadmap
│   └── CHECKLIST.md           What's done
│
├── 🗄️ Database
│   └── supabase/migrations/   Complete schema with RLS
│
└── 💻 Source (src/)
    ├── app/[locale]/          Pages (auth + dashboard)
    ├── components/            UI + feature components
    ├── lib/                   Utils, hooks, Supabase clients
    ├── messages/              Translations (UK/EN)
    └── types/                 TypeScript types
```

**[See full tree](./PROJECT_TREE.txt)**

---

## 🎯 Features

### ✅ Implemented
- ✅ Multi-tenant SaaS architecture
- ✅ User authentication (sign up/in/out)
- ✅ Dashboard with statistics
- ✅ Appointments management
- ✅ Client database with analytics
- ✅ Services catalog by category
- ✅ Staff management with roles
- ✅ Inventory system (brands + products)
- ✅ Stock level monitoring and alerts
- ✅ Settings panel
- ✅ Multi-language (UK/EN)
- ✅ Ultra-minimalist responsive UI

### 🚧 Coming Next
- ⏳ Add/Edit forms for all entities
- ⏳ Search and filtering
- ⏳ Calendar view
- ⏳ Financial reports
- ⏳ Email notifications
- ⏳ Analytics charts

**[See full roadmap](./FEATURES.md)**

---

## 🎨 Design Principles

### Ultra-Minimalist Palette
```css
Black:    #000000  /* Primary actions, text */
White:    #FFFFFF  /* Background */
Zinc-100: #F4F4F5  /* Subtle backgrounds */
Zinc-200: #E4E4E7  /* Borders */
Zinc-500: #71717A  /* Muted text */
Zinc-900: #18181B  /* Primary text */
```

### Principles
- ✨ Clean, spacious layouts
- 📱 Mobile-first responsive
- ♿ Accessible (WCAG 2.1)
- ⚡ Fast and performant
- 🎯 Clear visual hierarchy

---

## 📚 Documentation

| File | Description |
|------|-------------|
| [**QUICKSTART.md**](./QUICKSTART.md) | ⭐ Get running in 10 minutes |
| [**SETUP.md**](./SETUP.md) | Detailed setup instructions |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Technical architecture guide |
| [**FEATURES.md**](./FEATURES.md) | Feature list and roadmap |
| [**CHECKLIST.md**](./CHECKLIST.md) | What's implemented |
| [**PROJECT_SUMMARY.md**](./PROJECT_SUMMARY.md) | High-level overview |
| [**PROJECT_TREE.txt**](./PROJECT_TREE.txt) | Visual file structure |

---

## 🛠️ Development

### Available Commands
```bash
npm install       # Install dependencies
npm run dev       # Start dev server (localhost:3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Lint code
npm run type-check # Check TypeScript
```

### Database Setup
1. Create Supabase project
2. Copy credentials to `.env`
3. Run migration: `supabase/migrations/001_initial_schema.sql`
4. Done! RLS policies handle the rest

### Adding New Pages
1. Create in `src/app/[locale]/(dashboard)/`
2. Add navigation in `src/components/features/sidebar.tsx`
3. Add translations in `src/messages/*.json`

---

## 🔒 Security

- ✅ **Row Level Security** - Database-enforced multi-tenancy
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **HTTP-only Cookies** - Protected token storage
- ✅ **Input Validation** - Client + server side
- ✅ **CSRF Protection** - Built into Supabase
- ✅ **SQL Injection Prevention** - Parameterized queries

---

## 📊 Project Stats

```
Files:              55
React Components:   22
Database Tables:    8
Custom Hooks:       3
UI Components:      10 (Shadcn)
Locales:            2 (UK, EN)
Lines of SQL:       ~400
Documentation:      2000+ lines
```

---

## 🌟 Key Features

### Multi-Tenant Architecture
Every salon has **completely isolated data**:
- Automatic salon creation on signup
- RLS policies enforce boundaries
- No cross-tenant access possible
- Scales to thousands of salons

### Role-Based Access
Three permission levels:
- **Owner** - Full control
- **Admin** - Management access
- **Staff** - Daily operations

### Inventory System
Integrated product management:
- Multiple brands (DEZIK, GETLOUD, custom)
- Stock level tracking
- Low stock alerts
- Cost and retail pricing
- Transaction history

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

**Production Ready:**
- ✅ SSR/ISR support
- ✅ Edge functions
- ✅ Automatic HTTPS
- ✅ Global CDN

---

## 📖 Learn More

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

### Architecture Highlights
- **Multi-tenant from day 1** - Proper SaaS design
- **Type-safe** - Full TypeScript coverage
- **Performant** - React Query caching + DB indexes
- **Secure** - RLS + JWT + validation
- **Scalable** - Serverless architecture

---

## 🎉 Getting Help

1. Check the [documentation files](./QUICKSTART.md)
2. Review code comments
3. Test with real workflow
4. Open an issue

---

## 📝 License

Private project for Beauty Pro CRM.

---

## 🎨 Made for Beauty Salons

Built with **modern, production-ready tools** and an **ultra-minimalist design**.

**Start building:** `npm install && npm run dev`

**Happy coding!** 💅✨🚀
