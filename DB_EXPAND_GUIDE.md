# 🚀 Автоматическое Расширение БД - Быстрый Гид

**Одна команда для полной настройки CRM-структуры!**

---

## ⚡ Супер Быстрый Старт

### Одна команда делает всё:

```bash
npm run db:expand
```

**Что происходит автоматически:**
1. ✅ Подключение к базе данных
2. ✅ Создание 4 таблиц (clients, services, inventory_items, appointments)
3. ✅ Настройка RLS политик
4. ✅ Создание индексов для поиска
5. ✅ Добавление триггеров
6. ✅ **Автоматическая генерация TypeScript типов**

**Время:** ~30 секунд

---

## 📋 Что Создаётся

### 1. **clients** (Клиенты)
```sql
- id (UUID)
- salon_id (UUID) → salons
- full_name (TEXT)
- phone (TEXT, индексирован)
- email (TEXT)
- notes (TEXT)
- birthday (DATE)
- discount_percent (INTEGER, 0-100)
- total_visits, total_spent (авто-обновление)
```

### 2. **services** (Услуги)
```sql
- id (UUID)
- salon_id (UUID) → salons
- title (TEXT, индексирован)
- price (DECIMAL)
- duration_min (INTEGER)
- category (TEXT: nails, lashes, hair, makeup, massage, other)
```

### 3. **inventory_items** (Инвентарь)
```sql
- id (UUID)
- salon_id (UUID) → salons
- brand (TEXT, default 'GETLOUD')
- title (TEXT, индексирован)
- sku (TEXT, уникальный)
- stock_quantity (DECIMAL)
- min_stock_alert (DECIMAL)
- unit (TEXT: ml, pcs, g, kg, l)
```

### 4. **appointments** (Записи)
```sql
- id (UUID)
- salon_id (UUID) → salons
- client_id (UUID) → clients
- master_id (UUID) → staff
- service_id (UUID) → services
- start_time, end_time (TIMESTAMPTZ)
- status (TEXT: scheduled, confirmed, in_progress, completed, cancelled, no_show)
- total_price (DECIMAL)
```

---

## 🔒 Row Level Security (RLS)

**Автоматическая настройка для всех таблиц:**

```sql
-- Политика для всех таблиц
salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1)
```

**Означает:**
- ✅ Пользователь видит только данные своего салона
- ✅ Не может получить доступ к данным других салонов
- ✅ Политики применяются на уровне БД (невозможно обойти)

---

## 🎯 Как Использовать

### Шаг 1: Убедитесь, что Setup выполнен
```bash
# Если ещё не выполнен
npm run setup
```

### Шаг 2: Расширьте БД
```bash
npm run db:expand
```

### Шаг 3: Проверьте результат
```bash
npm run dev
# Откройте http://localhost:3000
```

---

## 📊 Вывод Команды

```
🗄️  Beauty Pro CRM - Auto Database Expansion

ℹ Подключение к базе данных...
✓ Подключение установлено
ℹ Выполнение SQL миграции...
✓ ✨ Миграция успешно выполнена!

═══════════════════════════════════════════════════════
📊 Созданные таблицы:
  ✓ clients           - Клиенты салона
  ✓ services          - Услуги
  ✓ inventory_items   - Инвентарь/продукты
  ✓ appointments      - Записи клиентов

🔒 Настроено:
  ✓ Row Level Security (RLS) для всех таблиц
  ✓ Foreign Keys (связи между таблицами)
  ✓ Индексы для оптимизации поиска
  ✓ Триггеры для auto-update timestamp
  ✓ Автоматическое обновление статистики клиентов
  ✓ Проверка конфликтов записей по времени

✓ 🎯 Типы TypeScript будут обновлены автоматически...
═══════════════════════════════════════════════════════

ℹ 🔄 Обновление TypeScript типов...
✓ Project ID: abcdefgh
✓ Создана директория src/types
ℹ Генерация типов через Supabase CLI...
✓ ✨ Типы успешно обновлены!
✓ Файл: src/types/database.ts

✓ 🎯 Следующий шаг: npm run dev
```

---

## 🔧 Как Это Работает

### Команда в package.json:
```json
{
  "scripts": {
    "db:expand": "tsx scripts/expand-db.ts && node scripts/update-types.js"
  }
}
```

### Шаг 1: expand-db.ts
- Читает DATABASE_URL из .env.local
- Подключается к PostgreSQL
- Выполняет SQL миграцию
- Создаёт таблицы, RLS, индексы, триггеры

### Шаг 2: update-types.js
- Извлекает Project ID из NEXT_PUBLIC_SUPABASE_URL
- Запускает Supabase CLI для генерации типов
- Сохраняет в src/types/database.ts
- Если CLI недоступен - создаёт placeholder

---

## ⚠️ Решение Проблем

### "DATABASE_URL не найден"
```bash
# Запустите setup сначала
npm run setup
```

### "Таблицы уже существуют"
```
✓ Это нормально! Используется IF NOT EXISTS
✓ Безопасно для повторного запуска
```

### "Supabase CLI не установлен"
```bash
# Установите глобально
npm install -g supabase

# Или обновите типы вручную:
# 1. Supabase Dashboard → Settings → API
# 2. Скопируйте TypeScript Types
# 3. Вставьте в src/types/database.ts
```

### "Ошибка подключения к БД"
```bash
# Проверьте .env.local
cat .env.local | grep DATABASE_URL

# Проверьте, что пароль правильный
# Формат: postgresql://postgres:PASSWORD@...
```

---

## 📝 Примеры Использования

### После расширения БД можете:

#### Создать клиента:
```typescript
const { data } = await supabase
  .from('clients')
  .insert({
    salon_id: salonId,
    full_name: 'Олена Коваленко',
    phone: '+380501234567',
    discount_percent: 10
  });
```

#### Создать услугу:
```typescript
const { data } = await supabase
  .from('services')
  .insert({
    salon_id: salonId,
    title: 'Маникюр',
    price: 350,
    duration_min: 60,
    category: 'nails'
  });
```

#### Создать запись:
```typescript
const { data } = await supabase
  .from('appointments')
  .insert({
    salon_id: salonId,
    client_id: clientId,
    master_id: staffId,
    service_id: serviceId,
    start_time: '2024-02-05T10:00:00Z',
    end_time: '2024-02-05T11:00:00Z',
    status: 'scheduled',
    total_price: 350
  });
```

---

## ✅ Чек-лист

После выполнения `npm run db:expand`:

- [ ] Миграция выполнена без ошибок
- [ ] Типы обновлены в src/types/database.ts
- [ ] `npm run dev` запускается успешно
- [ ] Можно создавать клиентов в UI
- [ ] RLS работает (видны только данные своего салона)

---

## 🎯 Что Дальше?

### 1. Запустите проект
```bash
npm run dev
```

### 2. Начните добавлять данные
- Создайте клиентов
- Добавьте услуги
- Настройте инвентарь
- Создайте первую запись

### 3. Разрабатывайте функционал
- Формы для CRUD операций
- Поиск и фильтрация
- Календарь записей
- Статистика и аналитика

---

## 🚀 Быстрая Шпаргалка

```bash
# Полная настройка с нуля
npm install
npm run setup          # Базовая настройка
npm run db:expand      # Расширение CRM
npm run dev            # Запуск проекта

# Если что-то пошло не так
npm run db:expand      # Безопасно запускать повторно
```

---

## 💡 Преимущества Автоматизации

**Без автоматизации:**
- 15+ минут ручной работы
- Копирование SQL вручную
- Ручная генерация типов
- Риск ошибок

**С автоматизацией:**
- ⚡ 30 секунд
- 🤖 Всё автоматически
- ✅ Без ошибок
- 🎯 Готово к разработке

---

## 🎉 Готово!

**Одна команда - и ваша CRM-база готова!**

```bash
npm run db:expand
```

**Happy coding! 🚀✨**

---

**Создано с ❤️ для Beauty Pro CRM**

*Автоматизация - ключ к быстрой разработке!*
