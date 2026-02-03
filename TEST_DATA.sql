-- ============================================================
-- ТЕСТОВІ ДАНІ ДЛЯ Beauty Pro CRM
-- ============================================================

-- ВАЖЛИВО: Спочатку створіть користувача в Supabase Auth:
-- Email: test@beautycrm.com
-- Password: BeautyTest2024!
-- Потім замініть USER_ID нижче на його UUID

-- ============================================================
-- 1. САЛОН
-- ============================================================

-- Використайте цей SQL ПІСЛЯ створення користувача в Supabase Auth
-- Замініть 'YOUR_USER_ID' на реальний UUID користувача

INSERT INTO salons (id, name, slug, owner_id, address, phone, email, currency, timezone)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'Beauty Studio "Шарм"',
    'beauty-studio-charm',
    (SELECT id FROM auth.users WHERE email = 'test@beautycrm.com' LIMIT 1), -- Автоматично знайде user_id
    'вул. Хрещатик, 1, Київ',
    '+380 67 123 4567',
    'info@beautystudio.com.ua',
    'UAH',
    'Europe/Kiev'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

-- ============================================================
-- 2. ПЕРСОНАЛ
-- ============================================================

-- Власник салону
INSERT INTO staff (salon_id, user_id, role, full_name, email, phone, specialization, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    (SELECT id FROM auth.users WHERE email = 'test@beautycrm.com' LIMIT 1),
    'owner',
    'Олена Шарм',
    'test@beautycrm.com',
    '+380 67 123 4567',
    'Власниця салону',
    true
)
ON CONFLICT (salon_id, user_id) DO UPDATE
SET full_name = EXCLUDED.full_name;

-- ============================================================
-- 3. КЛІЄНТИ
-- ============================================================

INSERT INTO clients (salon_id, full_name, phone, email, notes, birthday, discount_percent)
VALUES 
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Анна Петренко',
        '+380 67 111 2233',
        'anna.petrenko@gmail.com',
        'VIP клієнт, любить натуральні відтінки',
        '1990-05-15',
        10
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Марія Коваленко',
        '+380 67 222 3344',
        'maria.kovalenko@gmail.com',
        'Алергія на акрил',
        '1985-08-22',
        5
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Ірина Сидоренко',
        '+380 67 333 4455',
        'iryna.sydorenko@gmail.com',
        'Постійний клієнт, приходить кожні 2 тижні',
        '1995-03-10',
        15
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Оксана Бондаренко',
        '+380 67 444 5566',
        'oksana.bondarenko@gmail.com',
        NULL,
        '1988-11-30',
        0
    )
ON CONFLICT (salon_id, phone) DO NOTHING;

-- ============================================================
-- 4. ПОСЛУГИ
-- ============================================================

INSERT INTO services (salon_id, title, description, price, duration_min, category, is_active)
VALUES 
    -- Нігтьовий сервіс
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Манікюр класичний',
        'Обрізний манікюр з покриттям гель-лаком',
        450.00,
        90,
        'nails',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Педикюр класичний',
        'Обробка стоп та покриття гель-лаком',
        550.00,
        120,
        'nails',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Нарощування нігтів',
        'Нарощування гелем на формах',
        800.00,
        180,
        'nails',
        true
    ),
    -- Вії
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Класичне нарощування вій',
        'Поволоконне нарощування 1D',
        600.00,
        120,
        'lashes',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Об''ємне нарощування 2D-3D',
        'Голлівудський об''єм',
        900.00,
        150,
        'lashes',
        true
    ),
    -- Волосся
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Стрижка жіноча',
        'Стрижка з укладкою',
        350.00,
        60,
        'hair',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Фарбування волосся',
        'Повне фарбування професійними фарбами',
        1200.00,
        180,
        'hair',
        true
    )
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. ІНВЕНТАР
-- ============================================================

INSERT INTO inventory_items (salon_id, brand, title, sku, stock_quantity, min_stock_alert, unit, cost_price, retail_price, category, is_active)
VALUES 
    -- GETLOUD
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'GETLOUD',
        'База GETLOUD 30ml',
        'GL-BASE-30',
        15.00,
        5.00,
        'pcs',
        180.00,
        280.00,
        'Бази',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'GETLOUD',
        'Топ GETLOUD 30ml',
        'GL-TOP-30',
        12.00,
        5.00,
        'pcs',
        180.00,
        280.00,
        'Топи',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'GETLOUD',
        'Гель-лак GETLOUD Red №45',
        'GL-RED-45',
        8.00,
        3.00,
        'pcs',
        150.00,
        250.00,
        'Кольорові гель-лаки',
        true
    ),
    -- DEZIK
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'DEZIK',
        'Дезінфектор DEZIK 1L',
        'DZ-DIS-1000',
        5.00,
        2.00,
        'pcs',
        280.00,
        450.00,
        'Дезінфекція',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'DEZIK',
        'Стерилізатор інструментів DEZIK',
        'DZ-STER-BOX',
        3.00,
        1.00,
        'pcs',
        1200.00,
        1800.00,
        'Обладнання',
        true
    ),
    -- Загальні матеріали
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Professional',
        'Пилочка 100/180 грит',
        'FILE-100-180',
        50.00,
        20.00,
        'pcs',
        5.00,
        15.00,
        'Витратні матеріали',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Professional',
        'Баф 4-сторонній',
        'BUFF-4SIDE',
        30.00,
        10.00,
        'pcs',
        8.00,
        20.00,
        'Витратні матеріали',
        true
    ),
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
        'Professional',
        'Безворсові серветки 500шт',
        'WIPES-500',
        10.00,
        3.00,
        'pcs',
        120.00,
        200.00,
        'Витратні матеріали',
        true
    )
ON CONFLICT (salon_id, sku) DO NOTHING;

-- ============================================================
-- ГОТОВО! ✓
-- ============================================================

-- Перевірка створених даних:
SELECT 'Салон:' as type, name FROM salons WHERE slug = 'beauty-studio-charm'
UNION ALL
SELECT 'Персонал:', COUNT(*)::text FROM staff WHERE salon_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid
UNION ALL
SELECT 'Клієнти:', COUNT(*)::text FROM clients WHERE salon_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid
UNION ALL
SELECT 'Послуги:', COUNT(*)::text FROM services WHERE salon_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid
UNION ALL
SELECT 'Інвентар:', COUNT(*)::text FROM inventory_items WHERE salon_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;
