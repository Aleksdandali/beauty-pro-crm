# ⚠️ КРИТИЧНО: Проверка Переменных Окружения на Vercel

## Проблема:
Приложение работает локально, но на Vercel ошибка 500.
**Причина:** Скорее всего НЕ настроены переменные окружения!

---

## 🔧 ЧТО ДЕЛАТЬ:

### 1. Откройте Настройки Vercel:
```
https://vercel.com/oleksandrs-projects-27c73d7c/beauty-pro-crm-pi/settings/environment-variables
```

### 2. Проверьте Эти Переменные:

**Должны Быть:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

### 3. Если Их НЕТ - Добавьте:

**NEXT_PUBLIC_SUPABASE_URL:**
```
https://ndrqxlawxvfnloyzrpyo.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTM0MTQsImV4cCI6MjA1NDA2OTQxNH0.FQHpdt4E7Ny3_Vny4oSrMvCPyLbOGNzd4J7Xmzq7iZo
```

**NEXT_PUBLIC_APP_URL:**
```
https://beauty-pro-crm-pi.vercel.app
```

### 4. Для КАЖДОЙ переменной:
- Нажмите **Add New**
- Вставьте **Name** и **Value**
- Выберите **All Environments** (Production, Preview, Development)
- Нажмите **Save**

### 5. После Добавления Всех:
- Vercel автоматически сделает **Redeploy**
- Подождите 1-2 минуты
- Откройте приложение снова

---

## 🚀 БЫСТРЫЙ СПОСОБ (через Git):

Можем добавить переменные и сделать redeploy автоматически!

---

**Хотите я сделаю это автоматически? (Да/Нет)**
