# 🔄 Руководство по Миграциям - Beauty Pro CRM

**Полное руководство по работе с миграциями базы данных**

---

## 📚 Доступные Миграции

### 1. Базовая Миграция (001_initial_schema.sql)
**Файл:** `supabase/migrations/001_initial_schema.sql`

**Создаёт основную структуру:**
- ✅ salons (салоны)
- ✅ staff (персонал)
- ✅ Базовые RLS политики
- ✅ Триггеры и функции

**Когда выполнять:**
- При первичной настройке проекта
- Автоматически через setup wizard
- Вручную через Supabase SQL Editor

### 2. Расширение CRM (expand-db.ts)
**Файл:** `scripts/expand-db.ts`

**Создаёт CRM-структуру:**
- ✅ clients (клиенты)
- ✅ services (услуги)
- ✅ inventory_items (инвентарь)
- ✅ appointments (записи)
- ✅ Все связи и индексы
- ✅ RLS политики для всех таблиц
- ✅ Триггеры для автоматизации

**Когда выполнять:**
- После базовой миграции
- Через команду `npm run expand-db`

---

## 🚀 Порядок Выполнения

### Шаг 1: Базовая Настройка
```bash
# Автоматически (рекомендуется)
npm run setup

# Или вручную через Supabase Dashboard
# SQL Editor → Вставить 001_initial_schema.sql → Run
```

### Шаг 2: Расширение БД
```bash
npm run expand-db
```

### Шаг 3: Обновление Типов
```bash
# Через Supabase CLI
npx supabase gen types typescript \
  --project-id [your-project-id] \
  > src/types/database.ts
```

### Шаг 4: Проверка
```bash
npm run dev
# Зайти в Dashboard и проверить работу
```

---

## 📊 Структура После Миграций

```
Database Schema:
├── auth.users (Supabase)
│
├── salons
│   ├── id
│   ├── name
│   ├── owner_id → auth.users
│   └── ...
│
├── staff
│   ├── id
│   ├── salon_id → salons
│   ├── user_id → auth.users
│   └── role (owner/admin/staff)
│
├── clients
│   ├── id
│   ├── salon_id → salons
│   ├── full_name, phone, email
│   └── total_visits, total_spent
│
├── services
│   ├── id
│   ├── salon_id → salons
│   ├── title, price, duration_min
│   └── category
│
├── inventory_items
│   ├── id
│   ├── salon_id → salons
│   ├── brand, title, sku
│   └── stock_quantity
│
└── appointments
    ├── id
    ├── salon_id → salons
    ├── client_id → clients
    ├── master_id → staff
    ├── service_id → services
    └── start_time, end_time, status
```

---

## 🛠️ Команды Миграций

### Основные
```bash
npm run setup        # Базовая настройка + миграция
npm run expand-db    # Расширение CRM-таблицами
```

### Проверка
```bash
# Проверить типы
npm run type-check

# Запустить проект
npm run dev
```

---

## 🔄 Откат Миграций

### Метод 1: Через Supabase Dashboard
1. Зайти в SQL Editor
2. Выполнить DROP TABLE commands:

```sql
-- Откат expand-db
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Откат базовой миграции (осторожно!)
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS salons CASCADE;
```

### Метод 2: Пересоздание Проекта
1. Создать новый Supabase проект
2. Запустить `npm run setup`
3. Запустить `npm run expand-db`

---

## 📝 Создание Новой Миграции

### Формат Файла
```typescript
// scripts/new-migration.ts
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const migrationSQL = `
-- Ваш SQL код здесь
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
);
`;

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    await client.query(migrationSQL);
    console.log('✓ Миграция выполнена');
  } catch (error) {
    console.error('✗ Ошибка:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
```

### Добавление в package.json
```json
{
  "scripts": {
    "migrate:new": "npx tsx scripts/new-migration.ts"
  }
}
```

---

## ⚠️ Частые Проблемы

### "Таблица уже существует"
```
✓ Нормально! Используется IF NOT EXISTS
✓ Миграция безопасна для повторного запуска
```

### "Foreign Key constraint violation"
```bash
# Убедитесь в правильном порядке миграций:
# 1. Базовая (salons, staff)
# 2. Расширение (clients, services, appointments)
```

### "Permission denied"
```bash
# Проверьте DATABASE_URL
# Должен включать правильный пароль
postgresql://postgres:PASSWORD@...
```

### "Connection timeout"
```bash
# 1. Проверьте статус Supabase проекта
# 2. Проверьте интернет-соединение
# 3. Попробуйте через VPN
```

---

## 🎯 Best Practices

### 1. Всегда Делайте Бэкапы
```bash
# Перед миграцией
# Supabase Dashboard → Settings → Database → Create backup
```

### 2. Тестируйте Локально
```bash
# Создайте тестовый Supabase проект
# Запустите миграции там сначала
```

### 3. Версионируйте Миграции
```bash
# Формат: XXX_description.sql
# 001_initial_schema.sql
# 002_add_clients.sql
# 003_add_appointments.sql
```

### 4. Документируйте Изменения
```sql
-- Каждая миграция должна иметь комментарии
-- Описание: Добавление таблицы clients
-- Дата: 2024-02-05
-- Автор: Your Name
```

---

## 📊 Проверка Состояния БД

### Через SQL
```sql
-- Список всех таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Проверка RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Список индексов
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### Через TypeScript
```typescript
const { data, error } = await supabase
  .from('clients')
  .select('count', { count: 'exact', head: true });

console.log('Всего клиентов:', data?.count);
```

---

## 🔐 Безопасность Миграций

### 1. Никогда не Коммитьте .env
```bash
# .env.local должен быть в .gitignore
echo ".env.local" >> .gitignore
```

### 2. Используйте Разные БД
```bash
# Development
DATABASE_URL=postgres://dev-db...

# Production
DATABASE_URL=postgres://prod-db...
```

### 3. Ограничивайте Доступ
```sql
-- RLS должен быть включен для всех таблиц
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## 📈 Мониторинг Миграций

### Логирование
```typescript
// Добавьте в скрипт миграции
console.log(`[${new Date().toISOString()}] Начало миграции`);
// ... выполнение
console.log(`[${new Date().toISOString()}] Завершено`);
```

### История Миграций
```sql
-- Создайте таблицу для истории
CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  migration_name TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE
);
```

---

## 🎉 Итог

**Миграции - это:**
- ✅ Версионирование структуры БД
- ✅ Автоматизация изменений
- ✅ Воспроизводимость на всех окружениях
- ✅ Документация изменений

**Команды для работы:**
```bash
npm run setup       # Базовая структура
npm run expand-db   # CRM-таблицы
npm run dev         # Проверка работы
```

**Следуйте порядку миграций, и всё будет работать идеально! 🚀**

---

**Создано с ❤️ для Beauty Pro CRM**

*Правильные миграции - основа стабильной работы!* 🔄✨
