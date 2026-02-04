const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function executeSQL(query, description) {
  console.log(`\n📍 ${description}...`);
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Успішно');
    return data;
  } else {
    const error = await response.json();
    console.error('❌ Помилка:', error.message || error);
    return null;
  }
}

async function setupTeam() {
  // 1. Перевірка структури
  await executeSQL(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'staff' ORDER BY ordinal_position;`,
    'Перевіряю структуру таблиці staff'
  );

  // 2. Додаємо колонки
  await executeSQL(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS specialization VARCHAR(100);`, 'Додаю specialization');
  await executeSQL(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`, 'Додаю phone');
  await executeSQL(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS instagram VARCHAR(100);`, 'Додаю instagram');
  await executeSQL(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS photo_url TEXT;`, 'Додаю photo_url');
  await executeSQL(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 40;`, 'Додаю commission_rate');
  await executeSQL(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`, 'Додаю is_active');

  // 3. Додаємо тестових майстрів
  console.log('\n👥 Додаю тестових майстрів...');
  const insertQuery = `
    INSERT INTO staff (salon_id, user_id, first_name, last_name, email, role, specialization, phone, commission_rate, is_active)
    VALUES 
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', gen_random_uuid(), 'Олена', 'Коваленко', 'olena@salon.com', 'master', 'Манікюр, педикюр', '+380671112233', 40, true),
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', gen_random_uuid(), 'Марія', 'Шевченко', 'maria@salon.com', 'master', 'Нарощування вій', '+380672223344', 45, true),
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', gen_random_uuid(), 'Анна', 'Бондаренко', 'anna@salon.com', 'master', 'Брови, ламінування', '+380673334455', 40, true)
    ON CONFLICT DO NOTHING;
  `;
  await executeSQL(insertQuery, 'Додаю майстрів');

  // 4. Перевірка
  const masters = await executeSQL(
    `SELECT first_name, last_name, specialization, is_active FROM staff WHERE role = 'master' AND salon_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';`,
    'Перевіряю доданих майстрів'
  );

  if (masters && masters.length > 0) {
    console.log('\n📋 Список майстрів:');
    masters.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.first_name} ${m.last_name || ''} - ${m.specialization || 'Майстер'} (${m.is_active ? 'Активний' : 'Неактивний'})`);
    });
  }

  console.log('\n✅ Налаштування завершено!');
}

setupTeam().catch(console.error);
