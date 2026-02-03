# ⚡ СТАРТ ПРОЕКТА - Beauty Pro CRM

## 🎯 Текущая Ситуация

✅ **Готово:**
- Next.js проект настроен
- UI компоненты созданы
- Layout исправлен (html/body теги добавлены)
- Главная страница работает
- .env.local настроен

⚠️ **Требуется:**
- Миграция базы данных (вручную через Supabase Dashboard)

---

## 🚀 Быстрый Старт (3 шага)

### Шаг 1: Миграция Базы Данных

**Откройте Supabase Dashboard:**
```
https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo/editor
```

**Скопируйте SQL из файла:**
```
QUICK_FIX.md
```

И выполните в SQL Editor.

---

### Шаг 2: Установите Зависимости

```bash
npm install
```

---

### Шаг 3: Запустите Dev Сервер

```bash
npm run dev
```

**Откройте в браузере:**
```
http://localhost:3000
```

Вы должны увидеть:
```
Beauty Pro CRM
✨ System is working! ✨
```

---

## 📋 Полезные Команды

```bash
# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm start

# Линтинг
npm run lint

# Обновление TypeScript типов (после изменения БД)
node scripts/update-types.js
```

---

## 🔧 Структура Проекта

```
Shine_crm_final/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout (исправлен)
│   │   ├── page.tsx      # Главная страница
│   │   └── globals.css   # Tailwind CSS
│   ├── components/       # React компоненты
│   │   ├── ui/           # Shadcn UI компоненты
│   │   └── features/     # Feature компоненты
│   ├── lib/              # Библиотеки и утилиты
│   │   ├── supabase/     # Supabase клиенты
│   │   └── hooks/        # React hooks
│   ├── types/            # TypeScript типы
│   └── messages/         # i18n переводы
├── public/               # Статические файлы
├── scripts/              # Утилитные скрипты
├── supabase/            
│   └── migrations/       # SQL миграции
└── .env.local            # Переменные окружения
```

---

## 🗄️ База Данных

**Таблицы:**
- `salons` - Салоны
- `staff` - Сотрудники
- `clients` - Клиенты
- `services` - Услуги
- `inventory_items` - Инвентарь
- `appointments` - Записи

**Безопасность:**
- Row Level Security (RLS) настроен
- Multi-tenant архитектура
- Каждый салон видит только свои данные

---

## 🎨 UI/UX

**Палитра:**
- Black: `#000000`
- White: `#FFFFFF`
- Zinc: `zinc-50` до `zinc-950`

**Компоненты:**
- Shadcn UI
- Tailwind CSS
- Lucide Icons

**Локализация:**
- 🇺🇦 Українська (по умолчанию)
- 🇬🇧 English (опционально)

---

## 🔑 .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://ndrqxlawxvfnloyzrpyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.ndrqxlawxvfnloyzrpyo:PASSWORD@...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🐛 Решение Проблем

### База данных не подключается?
→ Откройте `QUICK_FIX.md`

### TypeScript ошибки типов?
→ Запустите `node scripts/update-types.js`

### Страница не загружается?
→ Проверьте `npm run dev` выполняется без ошибок

### RLS блокирует запросы?
→ Убедитесь, что пользователь авторизован и есть связь с салоном в таблице `staff`

---

## 📚 Документация

- `README.md` - Обзор проекта
- `QUICK_FIX.md` - Быстрое решение проблем с БД
- `MIGRATION_MANUAL.md` - Подробная инструкция по миграции
- `QUICKSTART.md` - Быстрый старт
- `ARCHITECTURE.md` - Архитектура проекта
- `FEATURES.md` - Список функций

---

## 🚀 Следующие Шаги

1. ✅ Выполните миграцию БД (QUICK_FIX.md)
2. ✅ Запустите `npm run dev`
3. ✅ Откройте http://localhost:3000
4. 🔜 Настройте аутентификацию
5. 🔜 Создайте тестовый салон
6. 🔜 Добавьте сотрудников
7. 🔜 Начните работу с CRM

---

**Удачи! 💪**

**Если нужна помощь** → откройте `QUICK_FIX.md`
