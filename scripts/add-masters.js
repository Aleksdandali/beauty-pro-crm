const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function addMasters() {
  const query = `
    INSERT INTO staff (salon_id, user_id, full_name, email, role, specialization, phone, commission_rate, is_active)
    VALUES 
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', gen_random_uuid(), 'Олена Коваленко', 'olena@salon.com', 'master', 'Манікюр, педикюр', '+380671112233', 40, true),
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', gen_random_uuid(), 'Марія Шевченко', 'maria@salon.com', 'master', 'Нарощування вій', '+380672223344', 45, true),
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', gen_random_uuid(), 'Анна Бондаренко', 'anna@salon.com', 'master', 'Брови, ламінування', '+380673334455', 40, true)
    ON CONFLICT (email) DO NOTHING;
  `;
  
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
    console.log('✅ Майстрів додано!');
    
    // Перевірка
    const checkQuery = `SELECT full_name, specialization, phone, commission_rate FROM staff WHERE role = 'master';`;
    const checkResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: checkQuery }),
      }
    );
    
    const masters = await checkResponse.json();
    console.log('\n👥 Список майстрів:');
    masters.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.full_name} - ${m.specialization} - ${m.commission_rate}%`);
    });
  } else {
    const error = await response.json();
    console.error('❌ Помилка:', error);
  }
}

addMasters().catch(console.error);
