const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkDatabase() {
  // 1. Get real salon_id
  console.log('📍 Перевіряю salon_id...\n');
  
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
  const salons = await salonResponse.json();
  
  console.log('✅ Salons:');
  console.log(JSON.stringify(salons, null, 2));

  // 2. Get clients with salon_id
  console.log('\n👥 Перевіряю clients...\n');
  
  const clientsQuery = `SELECT id, full_name, salon_id FROM clients LIMIT 5;`;
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
  const clients = await clientsResponse.json();
  
  console.log('✅ Clients:');
  console.log(JSON.stringify(clients, null, 2));

  // 3. Compare
  if (salons.length > 0 && clients.length > 0) {
    const salonId = salons[0].id;
    const clientSalonIds = [...new Set(clients.map(c => c.salon_id))];
    
    console.log('\n🔍 АНАЛІЗ:');
    console.log(`Salon ID в базі: ${salonId}`);
    console.log(`Salon IDs у клієнтів: ${clientSalonIds.join(', ')}`);
    
    if (clientSalonIds.includes(salonId)) {
      console.log('✅ Співпадає!');
    } else {
      console.log('❌ НЕ СПІВПАДАЄ! Потрібно оновити SALON_ID в коді!');
    }
  }
}

checkDatabase().catch(console.error);
