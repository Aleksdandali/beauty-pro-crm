# ShinePRO CRM - Контекст проекту

## 🎯 Про проект

**ShinePRO CRM** — CRM система для салонів краси на Next.js 14

- **Production URL**: https://beauty-pro-crm-pi.vercel.app
- **Стек**: Next.js 14 + TypeScript + Tailwind CSS + Supabase + Vercel
- **Мова інтерфейсу**: Українська
- **Дизайн**: Supabase/Vercel inspired з violet/fuchsia градієнтами

## 🗄️ База даних (Supabase)

### Credentials
```
SALON_ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Таблиці

#### salons
- `id` (uuid, PK)
- `name` (text)
- `address` (text)
- `phone` (text)
- `created_at` (timestamp)

#### clients
- `id` (uuid, PK)
- `salon_id` (uuid, FK → salons)
- `full_name` (text) - ПІБ клієнта
- `phone` (text)
- `instagram` (text)
- `telegram` (text)
- `notes` (text)
- `rfm_segment` (text) - VIP, Regular, At Risk, Lost, New
- `total_visits` (integer)
- `total_spent` (numeric)
- `last_visit` (date)
- `created_at` (timestamp)

#### staff
- `id` (uuid, PK)
- `salon_id` (uuid, FK → salons)
- `first_name` (text)
- `last_name` (text)
- `email` (text)
- `phone` (text)
- `role` (text) - Майстер, Адміністратор
- `specialization` (text[]) - Масив спеціалізацій
- `commission_rate` (numeric) - % комісії
- `is_active` (boolean)
- `created_at` (timestamp)

#### services
- `id` (uuid, PK)
- `salon_id` (uuid, FK → salons)
- `name` (text) - Назва послуги
- `description` (text)
- `category` (text) - Волосся, Манікюр, Педикюр, etc.
- `duration` (integer) - Тривалість в хвилинах
- `price` (numeric)
- `is_active` (boolean)
- `color` (text) - Колір для календаря
- `created_at` (timestamp)

#### appointments
- `id` (uuid, PK)
- `salon_id` (uuid, FK → salons)
- `client_id` (uuid, FK → clients)
- `staff_id` (uuid, FK → staff)
- `service_id` (uuid, FK → services)
- `start_time` (timestamp)
- `end_time` (timestamp)
- `status` (text) - confirmed, completed, cancelled, no-show
- `price` (numeric)
- `notes` (text)
- `created_at` (timestamp)

### RLS Policies
Всі таблиці мають policy `"allow_all" FOR ALL USING (true)` для розробки

## 📁 Структура проекту

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Sidebar + Header + Theme Toggle
│   │   ├── page.tsx            # Dashboard з metrics (потребує підключення до Supabase)
│   │   ├── clients/page.tsx    # ✅ CRUD клієнтів (підключено до Supabase)
│   │   ├── team/page.tsx       # ✅ CRUD майстрів (підключено до Supabase)
│   │   ├── services/page.tsx   # ✅ Прайс-лист (підключено до Supabase)
│   │   └── calendar/page.tsx   # ✅ Календар записів (підключено до Supabase)
│   ├── api/
│   │   └── seed/route.ts       # API для seed даних
│   ├── login/page.tsx          # Сторінка входу
│   ├── register/page.tsx       # Реєстрація
│   └── page.tsx                # Landing page
├── components/
│   ├── PullToRefresh.tsx       # ✅ Pull-to-refresh з нативним ефектом
│   ├── ThemeProvider.tsx       # ✅ Dark/Light тема
│   ├── ThemeSwitcher.tsx       # ✅ Перемикач теми
│   └── ui/                     # Базові UI компоненти
├── hooks/
│   ├── usePullToRefresh.ts     # ✅ Хук для pull-to-refresh
│   └── useClients.ts           # Хук для роботи з клієнтами
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase клієнт
│   │   ├── server.ts           # Server-side Supabase
│   │   └── middleware.ts       # Middleware для auth
│   ├── hooks/
│   │   ├── use-clients.ts      # React Query для клієнтів
│   │   ├── use-appointments.ts # React Query для записів
│   │   └── use-salon.ts        # React Query для салону
│   └── validations/
│       └── client-form.ts      # Zod схеми валідації
└── types/
    └── database.ts             # TypeScript типи для БД
```

## 🎨 Дизайн система

### Кольори
- **Primary**: violet-500, violet-600
- **Accent**: fuchsia-500, fuchsia-600
- **Gradient**: `from-violet-500 to-fuchsia-500`

### Dark Mode
- Background: `bg-[#0a0a0a]`, `bg-[#111111]`
- Borders: `border-white/10`
- Text: `text-white`, `text-gray-400`

### Light Mode
- Background: `bg-white`, `bg-gray-50`
- Borders: `border-gray-200`
- Text: `text-gray-900`, `text-gray-600`

### Typography
- Шрифт: Inter
- Заголовки: font-semibold, font-bold
- Текст: font-normal, font-medium

### Icons
- Бібліотека: lucide-react
- Розмір: 18px (icon), 20px (button), 24px (header)

## ✅ Реалізовані фічі

### Dashboard
- [x] Layout з Sidebar + Header
- [x] Dark/Light тема з ThemeProvider
- [ ] **TODO**: Підключити metrics до Supabase (зараз моки)

### Клієнти (clients/page.tsx)
- [x] Список клієнтів з Supabase
- [x] CRUD операції
- [x] RFM сегментація (VIP, Regular, At Risk, Lost, New)
- [x] Пошук по імені/телефону
- [x] Slide-over з деталями клієнта
- [x] Pull-to-refresh

### Команда (team/page.tsx)
- [x] Список майстрів з Supabase
- [x] CRUD операції
- [x] Спеціалізації (масив)
- [x] Комісійна система
- [x] Фільтр по ролі
- [x] Pull-to-refresh

### Послуги (services/page.tsx)
- [x] Прайс-лист з Supabase
- [x] CRUD операції
- [x] Категорії (Волосся, Манікюр, Педикюр, etc.)
- [x] Кольорове кодування
- [x] Фільтр по категорії
- [x] Pull-to-refresh

### Календар (calendar/page.tsx)
- [x] Три режими: День / Тиждень / Місяць
- [x] Записи з Supabase
- [x] Фільтр по майстру
- [x] Модалка дня зі слотами
- [x] Статуси записів (confirmed, completed, cancelled, no-show)
- [x] Pull-to-refresh

### UI/UX
- [x] Адаптивний дизайн (mobile-first)
- [x] Pull-to-refresh з нативним ефектом + вібрація
- [x] Dark/Light тема
- [x] Toast notifications
- [x] Loading states
- [x] Empty states

## 📝 TODO - Пріоритетні задачі

### 1. Dashboard metrics (src/app/dashboard/page.tsx)
**НАЙБІЛЬШ КРИТИЧНО** - Зараз моки, потрібні реальні дані:

```typescript
// Замінити це:
const mockStats = {
  totalRevenue: 45000,
  activeClients: 127,
  todayAppointments: 8,
  monthlyGrowth: 12
}

// На реальні запити:
const stats = await Promise.all([
  // Total Revenue за останні 30 днів
  supabase
    .from('appointments')
    .select('price')
    .eq('salon_id', SALON_ID)
    .eq('status', 'completed')
    .gte('start_time', thirtyDaysAgo)
    .then(res => sum(res.data.map(a => a.price))),
  
  // Active Clients (мали записи за 90 днів)
  supabase
    .from('clients')
    .select('id')
    .eq('salon_id', SALON_ID)
    .gte('last_visit', ninetyDaysAgo)
    .then(res => res.data.length),
  
  // Записи на сьогодні
  supabase
    .from('appointments')
    .select('id')
    .eq('salon_id', SALON_ID)
    .gte('start_time', todayStart)
    .lt('start_time', tomorrowStart)
    .then(res => res.data.length)
])
```

### 2. Analytics page
- [ ] Графіки виручки (revenue over time)
- [ ] Top майстри по виручці
- [ ] Top послуги
- [ ] Retention rate

### 3. Email/SMS нагадування
- [ ] Інтеграція з Twilio/SendGrid
- [ ] Шаблони нагадувань за 24 години
- [ ] Шаблони підтвердження запису

### 4. Inventory (опціонально)
- [ ] Облік матеріалів
- [ ] Списання по послугах

## 🚀 Deployment

### Vercel
- **Production**: https://beauty-pro-crm-pi.vercel.app
- **Auto-deploy**: push до main → автоматичний деплой
- **Environment variables**: Налаштовані в Vercel Dashboard

### Git
- **GitHub**: `https://github.com/Aleksdandali/beauty-pro-crm.git`
- **Branch**: main
- **Commit style**: Conventional Commits (feat:, fix:, chore:, docs:)

## 💡 Правила розробки

### Code Style
- TypeScript strict mode
- Functional components + hooks
- Server Components де можливо
- Client Components тільки для інтерактивності
- "use client" тільки коли потрібно

### Naming
- Компоненти: PascalCase
- Хуки: camelCase з префіксом `use`
- Утиліти: camelCase
- Константи: UPPER_SNAKE_CASE

### Supabase запити
```typescript
// ✅ Good - з error handling
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('salon_id', SALON_ID)

if (error) {
  console.error('Error:', error)
  toast.error('Помилка завантаження')
  return
}

// ❌ Bad - без error handling
const { data } = await supabase.from('clients').select('*')
```

### Commits
```bash
# ✅ Good
git commit -m "feat: add revenue metrics to dashboard"
git commit -m "fix: correct client search filter"
git commit -m "chore: update dependencies"

# ❌ Bad
git commit -m "updates"
git commit -m "wip"
```

## 🔗 Корисні посилання

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

**Останнє оновлення**: 2026-02-05
**Версія**: 1.0
**Maintainer**: Oleksandr (@Aleksdandali)
