# 🗄️ Расширение Базы Данных - CRM Таблицы

**Скрипт миграции для создания полной CRM-структуры**

---

## 🎯 Что Создаёт Скрипт

### 📊 Таблицы

#### 1. **clients** (Клиенты)
Полная информация о клиентах салона:
- `id` - UUID, первичный ключ
- `salon_id` - UUID, связь с салоном
- `full_name` - TEXT, полное имя клиента
- `phone` - TEXT, телефон (уникальный в рамках салона)
- `email` - TEXT, электронная почта
- `notes` - TEXT, заметки о клиенте
- `birthday` - DATE, день рождения
- `discount_percent` - INTEGER, процент скидки (0-100)
- `total_visits` - INTEGER, общее количество визитов
- `total_spent` - DECIMAL, общая сумма потраченных средств
- `last_visit` - TIMESTAMPTZ, дата последнего визита
- `created_at` / `updated_at` - TIMESTAMPTZ, временные метки

**Уникальность:** Телефон уникален в рамках одного салона

#### 2. **services** (Услуги)
Каталог услуг салона:
- `id` - UUID, первичный ключ
- `salon_id` - UUID, связь с салоном
- `title` - TEXT, название услуги
- `description` - TEXT, описание
- `price` - DECIMAL, цена услуги
- `duration_min` - INTEGER, длительность в минутах
- `category` - TEXT, категория (nails, lashes, hair, makeup, massage, other)
- `is_active` - BOOLEAN, активна ли услуга
- `created_at` / `updated_at` - TIMESTAMPTZ, временные метки

**Категории:**
- `nails` - Маникюр/педикюр
- `lashes` - Ресницы
- `hair` - Волосы
- `makeup` - Макияж
- `massage` - Массаж
- `other` - Другое

#### 3. **inventory_items** (Инвентарь/Продукты)
Система управления запасами:
- `id` - UUID, первичный ключ
- `salon_id` - UUID, связь с салоном
- `brand` - TEXT, бренд (по умолчанию 'GETLOUD')
- `title` - TEXT, название продукта
- `sku` - TEXT, артикул (уникальный в рамках салона)
- `description` - TEXT, описание
- `stock_quantity` - DECIMAL, количество на складе
- `min_stock_alert` - DECIMAL, минимальный порог для уведомления
- `unit` - TEXT, единица измерения (ml, pcs, g, kg, l)
- `cost_price` - DECIMAL, цена закупки
- `retail_price` - DECIMAL, розничная цена
- `category` - TEXT, категория продукта
- `is_active` - BOOLEAN, активен ли продукт
- `created_at` / `updated_at` - TIMESTAMPTZ, временные метки

**Поддерживаемые единицы:**
- `ml` - миллилитры
- `pcs` - штуки
- `g` - граммы
- `kg` - килограммы
- `l` - литры

#### 4. **appointments** (Записи/Встречи)
Система бронирования:
- `id` - UUID, первичный ключ
- `salon_id` - UUID, связь с салоном
- `client_id` - UUID, связь с клиентом
- `master_id` - UUID, связь с мастером (staff)
- `service_id` - UUID, связь с услугой
- `start_time` - TIMESTAMPTZ, время начала
- `end_time` - TIMESTAMPTZ, время окончания
- `status` - TEXT, статус записи
- `total_price` - DECIMAL, общая стоимость
- `notes` - TEXT, заметки
- `created_at` / `updated_at` - TIMESTAMPTZ, временные метки

**Статусы:**
- `scheduled` - Запланировано
- `confirmed` - Подтверждено
- `in_progress` - В процессе
- `completed` - Завершено
- `cancelled` - Отменено
- `no_show` - Клиент не пришёл

---

## 🔒 Row Level Security (RLS)

### Политики для Всех Таблиц

#### Clients
- **SELECT**: Пользователь видит только клиентов своего салона
- **INSERT**: Пользователь может добавлять клиентов в свой салон
- **UPDATE**: Пользователь может обновлять клиентов своего салона
- **DELETE**: Только owner/admin могут удалять

#### Services
- **SELECT**: Все сотрудники видят услуги своего салона
- **INSERT/UPDATE/DELETE**: Только owner/admin

#### Inventory Items
- **SELECT**: Все сотрудники видят инвентарь своего салона
- **INSERT/UPDATE**: Все сотрудники могут управлять
- **DELETE**: Только owner/admin

#### Appointments
- **SELECT**: Все сотрудники видят записи своего салона
- **INSERT/UPDATE/DELETE**: Все сотрудники могут управлять

---

## 🔗 Foreign Keys (Связи)

```
salons
  ↓
  ├── clients (salon_id)
  ├── services (salon_id)
  ├── inventory_items (salon_id)
  └── appointments (salon_id)
        ↓
        ├── client_id → clients(id)
        ├── master_id → staff(id)
        └── service_id → services(id)
```

**Каскадное удаление:**
- При удалении салона → удаляются все связанные записи
- При удалении клиента → удаляются его записи
- При удалении услуги → блокируется (RESTRICT), если есть записи

---

## 📈 Индексы для Оптимизации

### Clients
```sql
- idx_clients_salon_id (salon_id)
- idx_clients_phone (phone)
- idx_clients_full_name (full_name)
- idx_clients_email (email)
- idx_clients_created_at (created_at DESC)
```

### Services
```sql
- idx_services_salon_id (salon_id)
- idx_services_title (title)
- idx_services_category (category)
- idx_services_is_active (is_active)
- idx_services_price (price)
```

### Inventory Items
```sql
- idx_inventory_items_salon_id (salon_id)
- idx_inventory_items_brand (brand)
- idx_inventory_items_title (title)
- idx_inventory_items_sku (sku)
- idx_inventory_items_category (category)
- idx_inventory_items_stock (stock_quantity)
```

### Appointments
```sql
- idx_appointments_salon_id (salon_id)
- idx_appointments_client_id (client_id)
- idx_appointments_master_id (master_id)
- idx_appointments_service_id (service_id)
- idx_appointments_start_time (start_time)
- idx_appointments_end_time (end_time)
- idx_appointments_status (status)
- idx_appointments_created_at (created_at DESC)
- idx_appointments_master_time (master_id, start_time, end_time) - составной
```

---

## ⚙️ Триггеры и Автоматизация

### 1. Auto-update Timestamp
Автоматически обновляет `updated_at` при изменении записи:
```sql
CREATE TRIGGER update_[table]_updated_at
BEFORE UPDATE ON [table]
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Обновление Статистики Клиента
При завершении записи автоматически обновляется:
- `total_visits` +1
- `total_spent` + стоимость услуги
- `last_visit` = время окончания записи

```sql
CREATE TRIGGER update_client_stats_on_appointment
AFTER UPDATE OF status ON appointments
FOR EACH ROW EXECUTE FUNCTION update_client_statistics();
```

### 3. Проверка Конфликтов Записей
Автоматически проверяет, не занят ли мастер в указанное время:
```sql
CREATE TRIGGER check_appointment_conflict_trigger
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION check_appointment_conflict();
```

**Блокирует создание записи если:**
- У мастера уже есть запись в это время
- Записи пересекаются по времени
- Исключает отменённые и no-show записи

---

## 🚀 Запуск Миграции

### Подготовка

1. **Убедитесь, что базовая миграция выполнена:**
   ```bash
   # Должны существовать таблицы:
   # - salons
   # - staff
   # - auth.users (Supabase)
   ```

2. **Проверьте .env.local:**
   ```bash
   DATABASE_URL=postgresql://...
   # или
   NEXT_PUBLIC_SUPABASE_URL=https://...
   ```

### Выполнение

```bash
# Установите зависимости (если ещё не установлены)
npm install

# Запустите миграцию
npm run expand-db
```

**Или напрямую:**
```bash
npx tsx scripts/expand-db.ts
```

### Что Произойдёт

```
🗄️  Beauty Pro CRM - Расширение Базы Данных

ℹ Подключение к базе данных...
✓ Подключение установлено
ℹ Выполнение SQL миграции...
⚠ Это может занять несколько секунд...
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

🎯 Следующие шаги:
  1. Обновите типы TypeScript
  2. Запустите проект: npm run dev
  3. Начните добавлять данные в Dashboard
═══════════════════════════════════════════════════════
```

---

## 🔄 Обновление TypeScript Типов

После миграции обновите типы:

```bash
# Метод 1: Через Supabase CLI
npx supabase gen types typescript \
  --project-id [your-project-id] \
  > src/types/database.ts

# Метод 2: Вручную через Supabase Dashboard
# 1. Зайдите в Dashboard → Settings → API
# 2. Скопируйте TypeScript Types
# 3. Вставьте в src/types/database.ts
```

---

## ⚠️ Решение Проблем

### "DATABASE_URL не найден"
```bash
# Убедитесь, что .env.local существует
cat .env.local

# Если файла нет, запустите setup wizard
npm run setup
```

### "Таблица salons не существует"
```bash
# Выполните сначала базовую миграцию
# Запустите setup wizard или выполните 001_initial_schema.sql
npm run setup
```

### "Таблицы уже существуют"
```
✓ Нормально! Скрипт использует IF NOT EXISTS
✓ Существующие таблицы не будут изменены
✓ Миграция безопасна для повторного запуска
```

### "Ошибка подключения к базе"
```bash
# Проверьте DATABASE_URL
echo $DATABASE_URL

# Проверьте, что пароль указан правильно
# Формат: postgresql://postgres:PASSWORD@...

# Убедитесь, что Supabase проект активен
```

---

## 📊 Примеры Использования

### Создание Клиента
```typescript
const { data, error } = await supabase
  .from('clients')
  .insert({
    salon_id: 'your-salon-id',
    full_name: 'Олена Коваленко',
    phone: '+380501234567',
    email: 'olena@example.com',
    discount_percent: 10
  });
```

### Создание Услуги
```typescript
const { data, error } = await supabase
  .from('services')
  .insert({
    salon_id: 'your-salon-id',
    title: 'Маникюр класичний',
    price: 350,
    duration_min: 60,
    category: 'nails'
  });
```

### Создание Записи
```typescript
const { data, error } = await supabase
  .from('appointments')
  .insert({
    salon_id: 'your-salon-id',
    client_id: 'client-uuid',
    master_id: 'staff-uuid',
    service_id: 'service-uuid',
    start_time: '2024-02-05T10:00:00Z',
    end_time: '2024-02-05T11:00:00Z',
    total_price: 350,
    status: 'scheduled'
  });
```

### Поиск Клиентов
```typescript
// По телефону
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('salon_id', salonId)
  .ilike('phone', '%123%');

// По имени
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('salon_id', salonId)
  .ilike('full_name', '%Олена%');
```

### Получение Записей с Деталями
```typescript
const { data } = await supabase
  .from('appointments')
  .select(`
    *,
    client:clients(*),
    master:staff(*),
    service:services(*)
  `)
  .eq('salon_id', salonId)
  .gte('start_time', new Date().toISOString())
  .order('start_time', { ascending: true });
```

---

## 🎯 Следующие Шаги

### 1. Обновите Типы
```bash
npm run expand-db
# Затем обновите src/types/database.ts
```

### 2. Создайте CRUD Хуки
```typescript
// src/lib/hooks/use-clients.ts
// src/lib/hooks/use-services.ts
// src/lib/hooks/use-appointments.ts
// src/lib/hooks/use-inventory.ts
```

### 3. Добавьте Формы
```typescript
// Формы для создания/редактирования:
// - ClientForm
// - ServiceForm
// - AppointmentForm
// - InventoryItemForm
```

### 4. Реализуйте Поиск
```typescript
// Компоненты поиска:
// - ClientSearch
// - ServiceSearch
// - ProductSearch
```

---

## 📝 Команды

```bash
# Миграция
npm run expand-db              # Расширение БД
npm run setup                  # Базовая настройка

# Разработка
npm run dev                    # Запуск dev сервера
npm run build                  # Production build
npm run type-check             # Проверка TypeScript
```

---

## ✅ Чек-лист После Миграции

- [ ] Миграция выполнена успешно
- [ ] Типы TypeScript обновлены
- [ ] Проверено подключение к БД
- [ ] Созданы CRUD хуки (опционально)
- [ ] Добавлены формы (опционально)
- [ ] Протестировано создание записей
- [ ] Проверена работа RLS
- [ ] Документация прочитана

---

## 🎉 Готово!

**Ваша база данных расширена и готова к работе!**

Теперь у вас есть:
- ✅ Полная CRM-структура
- ✅ Система управления клиентами
- ✅ Каталог услуг
- ✅ Управление инвентарём
- ✅ Система бронирования
- ✅ Автоматическая статистика
- ✅ Защита данных через RLS

**Начните разработку функционала!** 🚀

---

**Создано с ❤️ для Beauty Pro CRM**

*База данных - фундамент вашего CRM!* 🗄️✨
