const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function executeSQLSteps() {
  // Step 1: Get salon_id
  console.log('📍 КРОК 1: Отримую salon_id...\n');
  
  const salonQuery = `SELECT id, name FROM salons LIMIT 1;`;
  const salonResponse = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: salonQuery }),
    }
  );
  const salonData = await salonResponse.json();
  
  if (salonData.length > 0) {
    console.log('✅ Salon знайдено:');
    console.log(`   Назва: ${salonData[0].name}`);
    console.log(`   ID: ${salonData[0].id}\n`);
  }
  
  const SALON_ID = salonData[0]?.id;

  // Step 2: Drop old policies and create simple one
  console.log('🔒 КРОК 2: Оновлюю RLS політики...\n');
  
  const policies = [
    `DROP POLICY IF EXISTS "clients_select_policy" ON clients;`,
    `DROP POLICY IF EXISTS "clients_insert_policy" ON clients;`,
    `DROP POLICY IF EXISTS "clients_update_policy" ON clients;`,
    `DROP POLICY IF EXISTS "clients_delete_policy" ON clients;`,
    `DROP POLICY IF EXISTS "allow_all_select" ON clients;`,
    `DROP POLICY IF EXISTS "allow_all_insert" ON clients;`,
    `DROP POLICY IF EXISTS "allow_all_update" ON clients;`,
    `DROP POLICY IF EXISTS "allow_all_delete" ON clients;`,
    `DROP POLICY IF EXISTS "Staff can manage clients" ON clients;`,
    `CREATE POLICY "clients_all" ON clients FOR ALL USING (true) WITH CHECK (true);`,
  ];

  for (const policy of policies) {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: policy }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      console.log('✅', policy.substring(0, 50) + '...');
    } else {
      console.log('⚠️ ', data.message || 'Error');
    }
  }

  // Step 3: Check clients
  console.log('\n👥 КРОК 3: Перевіряю клієнтів...\n');
  
  const clientsQuery = `SELECT * FROM clients LIMIT 5;`;
  const clientsResponse = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: clientsQuery }),
    }
  );
  const clientsData = await clientsResponse.json();
  
  console.log(`✅ Знайдено ${clientsData.length} клієнтів`);
  clientsData.forEach((c, i) => {
    console.log(`${i + 1}. ${c.full_name} - ${c.phone}`);
  });

  console.log('\n💡 SALON_ID для коду:');
  console.log(`const SALON_ID = "${SALON_ID}";`);
}

executeSQLSteps().catch(console.error);
