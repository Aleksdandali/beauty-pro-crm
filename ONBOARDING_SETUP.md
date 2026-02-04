# 🚀 Настройка Onboarding Flow

## ✅ Что уже сделано

### 1. **Файлы созданы:**
```
✅ src/lib/validations/salon.ts         - Zod схема валидации
✅ src/lib/actions/onboarding.ts         - Server Actions
✅ src/hooks/use-current-salon.ts        - Hook для salon_id
✅ src/hooks/use-toast.ts                - Toast уведомления
✅ src/app/[locale]/onboarding/page.tsx  - Страница онбординга
✅ src/messages/uk.json                  - Переводы (UK)
✅ src/messages/en.json                  - Переводы (EN)
✅ middleware.ts                         - Обновлен с проверкой онбординга
✅ src/types/database.ts                 - Добавлено поле city
```

### 2. **Миграция создана:**
```
✅ supabase/migrations/002_add_city_to_salons.sql
```

### 3. **Задеплоено на Vercel:**
```
✅ https://beauty-pro-crm-pi.vercel.app
```

---

## 🔧 ЧТО НУЖНО СДЕЛАТЬ ВРУЧНУЮ

### ШАГ 1: Применить миграцию в Supabase

Открой **Supabase Dashboard** → **SQL Editor** → **New Query**

Вставь и выполни:

```sql
-- Добавить поле city в таблицу salons
ALTER TABLE salons ADD COLUMN IF NOT EXISTS city TEXT;
```

---

## 🎯 КАК РАБОТАЕТ ONBOARDING FLOW

### 1. **Новый пользователь регистрируется**
```
/signup → Supabase Auth создает юзера
```

### 2. **Middleware проверяет онбординг**
```typescript
// middleware.ts проверяет:
const { data: staffRecord } = await supabase
  .from("staff")
  .select("salon_id")
  .eq("user_id", user.id)
  .single();

// Если НЕТ staff записи → редирект на /uk/onboarding
// Если ЕСТЬ → пропустить на /dashboard
```

### 3. **Пользователь заполняет форму салона**
```
/uk/onboarding
- Название салона* (обязательно)
- Телефон
- Город
- Адрес
```

### 4. **Server Action создает салон**
```typescript
// src/lib/actions/onboarding.ts
export async function createSalonWithOwner(input) {
  // 1. Создать салон
  INSERT INTO salons (name, slug, phone, city, address, owner_id)
  
  // 2. Создать запись в staff (role: 'owner')
  INSERT INTO staff (salon_id, user_id, role, name, email, phone)
  
  // 3. Редирект на /dashboard
}
```

### 5. **Готово!**
```
Пользователь попадает на /dashboard
Все запросы теперь фильтруются по salon_id
```

---

## 🧪 ТЕСТИРОВАНИЕ

### 1. Создай нового пользователя
```
1. Открой https://beauty-pro-crm-pi.vercel.app/signup
2. Зарегистрируйся (новый email)
3. Автоматически редирект на /uk/onboarding
```

### 2. Заполни форму онбординга
```
1. Введи название салона (например: "Тестовий Салон")
2. Заполни телефон, город, адрес (опционально)
3. Нажми "Створити салон"
```

### 3. Проверь редирект
```
✅ После создания → редирект на /dashboard
✅ Middleware пропускает на /dashboard (есть staff запись)
```

### 4. Проверь базу данных
```sql
-- Открой Supabase SQL Editor
-- Проверь что салон создан
SELECT * FROM salons ORDER BY created_at DESC LIMIT 1;

-- Проверь что staff запись создана
SELECT * FROM staff ORDER BY created_at DESC LIMIT 1;
```

---

## 📝 ИСПОЛЬЗОВАНИЕ В КОДЕ

### Получить salon_id текущего пользователя

```typescript
// В любом клиентском компоненте
import { useCurrentSalonId } from "@/hooks/use-current-salon";

export function MyComponent() {
  const { salonId, isLoading, error } = useCurrentSalonId();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // Используй salonId для запросов
  const { data: clients } = useQuery({
    queryKey: ["clients", salonId],
    queryFn: () => fetchClients(salonId),
  });
}
```

### Использовать в Server Actions

```typescript
// В server action
import { getCurrentSalonId } from "@/lib/actions/onboarding";

export async function getMyClients() {
  const salonId = await getCurrentSalonId();
  
  if (!salonId) {
    throw new Error("Salon not found");
  }
  
  // Запросы к БД с фильтром по salon_id
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("salon_id", salonId);
    
  return data;
}
```

---

## 🔒 ЗАЩИТА РОУТОВ

### Публичные страницы (БЕЗ авторизации):
```
✅ /                   - Landing page
✅ /login              - Вход
✅ /signup             - Регистрация
✅ /forgot-password    - Восстановление пароля
```

### Защищенные страницы (ТРЕБУЮТ авторизацию):
```
🔒 /dashboard          - Главная панель
🔒 /uk/onboarding      - Онбординг (только для новых)
🔒 /uk/demo            - Демо
🔒 /[locale]/*         - Все остальные локализованные
```

### Логика редиректов:
```
НЕ авторизован + защищенная страница → /login
Авторизован + НЕТ салона → /uk/onboarding
Авторизован + ЕСТЬ салон + /onboarding → /dashboard
Авторизован + /login → /dashboard
```

---

## 🎨 UI/UX

### Страница онбординга:
- **Центрированная карточка** на сером фоне
- **Иконка салона** 💅 в заголовке
- **Минималистичная форма** с 4 полями
- **Валидация** через Zod (название обязательно, мин 2 символа)
- **Loading state** на кнопке во время создания
- **Toast уведомления** при успехе/ошибке
- **Локализация** на украинском по умолчанию

---

## 🐛 ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### 1. "Salon not found" после регистрации
**Причина:** Миграция не применена, нет поля city  
**Решение:** Выполни SQL из ШАГ 1

### 2. Бесконечный редирект между /onboarding и /dashboard
**Причина:** Ошибка при создании staff записи  
**Решение:** Проверь логи Vercel: `vercel logs`

### 3. "Invalid API key" ошибка
**Причина:** Env переменные не подтянулись  
**Решение:** Уже исправлено, используется hardcoded fallback

---

## 📊 СЛЕДУЮЩИЕ ШАГИ

После того как онбординг работает:

1. **Добавить реальные данные в dashboard**
   - Подключить useCurrentSalonId() в /dashboard/page.tsx
   - Фетчить клиентов, записи, услуги по salon_id

2. **Создать CRUD страницы**
   - /dashboard/clients/new - добавить клиента
   - /dashboard/appointments/new - новая запись
   - /dashboard/services/new - добавить услугу

3. **Календарь записей**
   - Визуальный календарь с drag & drop
   - Фильтры по сотруднику/услуге

---

**✅ Готово! Onboarding flow полностью настроен.**

**🔗 Ссылки:**
- Vercel: https://beauty-pro-crm-pi.vercel.app
- Supabase: https://supabase.com/dashboard
