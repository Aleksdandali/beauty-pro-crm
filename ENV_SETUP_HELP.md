# 🔧 Настройка .env.local - Решение Проблем

## ❌ Текущая Проблема

**Ошибка:** "Tenant or user not found" при подключении к базе данных.

**Причина:** Неправильный DATABASE_URL или пароль базы данных.

---

## ✅ Решение

### Шаг 1: Получите Правильный DATABASE_URL

1. **Зайдите в Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo
   ```

2. **Перейдите в Settings → Database:**
   - Нажмите на вкладку "Settings" (слева)
   - Выберите "Database"

3. **Скопируйте Connection String:**
   - Найдите раздел "Connection string"
   - Выберите вкладку "URI"
   - Скопируйте строку целиком
   - **ВАЖНО:** Замените `[YOUR-PASSWORD]` на ваш реальный пароль базы данных

### Шаг 2: Обновите .env.local

Откройте `.env.local` и вставьте правильный DATABASE_URL:

```env
# Формат (замените [YOUR-PASSWORD] на реальный пароль):
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.ndrqxlawxvfnloyzrpyo.supabase.co:5432/postgres

# Или используйте Transaction Mode (если прямое подключение не работает):
DATABASE_URL=postgresql://postgres.ndrqxlawxvfnloyzrpyo:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

---

## 🔑 Где Найти Пароль?

### Если Забыли Пароль:

1. **Перейдите в Settings → Database**
2. **Найдите "Database Password"**
3. **Нажмите "Reset Database Password"**
4. **Создайте новый пароль** (например: `Dandali300683`)
5. **Скопируйте его!** (Supabase покажет его только один раз)

---

## 📋 Правильный .env.local

После получения правильных данных, ваш `.env.local` должен выглядеть так:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ndrqxlawxvfnloyzrpyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTM0MTQsImV4cCI6MjA1NDA2OTQxNH0.FQHpdt4E7Ny3_Vny4oSrMvCPyLbOGNzd4J7Xmzq7iZo

# Database URL (вставьте свой пароль вместо [YOUR-PASSWORD])
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ_ЗДЕСЬ@db.ndrqxlawxvfnloyzrpyo.supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 После Исправления

Запустите миграцию снова:

```bash
npm run db:expand
```

Вы должны увидеть:
```
✓ Подключение установлено
✓ ✨ Миграция успешно выполнена!
✓ clients - Клиенты салона
✓ services - Услуги
✓ inventory_items - Инвентарь/продукты
✓ appointments - Записи клиентов
```

---

## 🔍 Альтернативное Решение

Если DATABASE_URL всё ещё не работает, используйте **Supabase Direct Client**:

1. Убедитесь, что в вашем `.env.local` есть:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ndrqxlawxvfnloyzrpyo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
   ```

2. Выполните миграцию **вручную через Supabase Dashboard**:
   - Перейдите в SQL Editor
   - Откройте файл `supabase/migrations/001_initial_schema.sql`
   - Скопируйте весь SQL код
   - Вставьте в SQL Editor
   - Нажмите Run

3. Затем запустите только обновление типов:
   ```bash
   node scripts/update-types.js
   ```

---

## ⚠️ Важные Моменты

1. **Пароль должен быть БЕЗ скобок []**
   - ❌ Неправильно: `[YOUR-PASSWORD]`
   - ✅ Правильно: `Dandali300683`

2. **Нет пробелов в DATABASE_URL**
   - ❌ Неправильно: `postgresql://postgres: password @...`
   - ✅ Правильно: `postgresql://postgres:password@...`

3. **Используйте прямое подключение (port 5432)**
   - Для миграций лучше использовать прямой порт
   - Connection Pooler (6543) может не подойти для DDL операций

---

## 📞 Нужна Помощь?

Если ошибка продолжается:

1. **Проверьте статус проекта Supabase:**
   ```
   https://status.supabase.com
   ```

2. **Проверьте, что проект активен:**
   - Зайдите в Dashboard
   - Убедитесь, что проект не на паузе
   - Проверьте, что база данных запущена

3. **Попробуйте пересоздать пароль:**
   - Settings → Database → Reset Database Password

---

**После исправления .env.local запустите:**

```bash
npm run db:expand
```

**Удачи! 🚀**
