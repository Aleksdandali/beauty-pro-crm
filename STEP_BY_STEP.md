# 🔧 Пошаговая Инструкция - Исправление Production

## 📋 Что Делать Сейчас:

### Шаг 1: Закройте модальное окно
- Нажмите **ESC** или кнопку **X** в правом верхнем углу окна

### Шаг 2: Откройте Table Editor
- В левом меню Supabase найдите **Table Editor**
- Нажмите на него

### Шаг 3: Проверьте список таблиц
В левой панели вы должны увидеть:
- ✅ appointments
- ✅ clients
- ✅ inventory_items
- ✅ salons
- ✅ services
- ✅ staff

**Если НЕ ВИДИТЕ таблицы `salons` и `staff`** - это причина ошибки 500!

---

## 🔧 Решение (если salons/staff нет):

### Вариант 1: SQL Editor (рекомендуется)

1. **Перейдите в SQL Editor** (левое меню)
2. **Откройте файл в Cursor:** `supabase/migrations/001_initial_schema.sql`
3. **Скопируйте весь код:** Cmd+A, затем Cmd+C
4. **Вставьте в SQL Editor** в Supabase
5. **Нажмите Run** (зелёная кнопка или F5)
6. **Дождитесь "Success"**

### Вариант 2: Через скрипт (если SQL Editor не работает)

Просто скажите "выполни базовую миграцию" - я запущу скрипт автоматически.

---

## ✅ После Создания Таблиц:

Приложение на Vercel автоматически заработает:
```
https://beauty-pro-crm-pi.vercel.app
```

Вы увидите:
```
Beauty Pro CRM
✨ System is working! ✨
🌍 Locale: uk
🗄️ Database: Ready
🚀 Production: Vercel
```

---

## 📸 Что Вы Увидите в Table Editor:

**ЕСЛИ ТАБЛИЦЫ ЕСТЬ:**
- Слева список: appointments, clients, inventory_items, salons, services, staff
- ✅ Всё готово, проблема не в базе

**ЕСЛИ ТАБЛИЦ НЕТ:**
- Пустой список или только некоторые таблицы
- ❌ Нужно выполнить миграцию

---

**Проверьте Table Editor и скажите, что видите!** 👀
