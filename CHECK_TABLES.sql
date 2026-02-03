-- Проверка существующих таблиц в базе данных

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Ожидаемый результат (если миграция выполнена):
-- appointments
-- clients
-- inventory_items
-- salons
-- services
-- staff

-- Если таблиц нет или не все таблицы созданы:
-- 1. Откройте файл: supabase/migrations/001_initial_schema.sql
-- 2. Скопируйте весь SQL код
-- 3. Вставьте в SQL Editor
-- 4. Нажмите Run
