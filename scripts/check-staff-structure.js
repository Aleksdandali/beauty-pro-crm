const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkStructure() {
  const query = `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'staff' ORDER BY ordinal_position;`;
  
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
  
  const columns = await response.json();
  console.log('📋 Структура таблиці staff:\n');
  columns.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
  });
}

checkStructure().catch(console.error);
