-- Проверка всех таблиц и их структуры

-- 1. Список всех таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Проверка колонок таблицы salons
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'salons' 
ORDER BY ordinal_position;

-- 3. Проверка колонок таблицы staff
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'staff' 
ORDER BY ordinal_position;

-- 4. Проверка RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 5. Проверка политик RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
