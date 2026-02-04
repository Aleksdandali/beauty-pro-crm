const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function addTelegramColumn() {
  console.log('📍 Додаю колонку telegram...\n');
  
  const query = `ALTER TABLE clients ADD COLUMN IF NOT EXISTS telegram VARCHAR(100);`;
  
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
    console.log('✅ Колонку telegram успішно додано!');
    
    // Перевіряємо структуру таблиці
    const checkQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      ORDER BY ordinal_position;
    `;
    
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
    
    const columns = await checkResponse.json();
    console.log('\n📋 Структура таблиці clients:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
  } else {
    const error = await response.json();
    console.error('❌ Помилка:', error);
  }
}

addTelegramColumn().catch(console.error);
