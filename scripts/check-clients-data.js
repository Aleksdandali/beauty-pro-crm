const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkData() {
  try {
    // Check if there are any clients
    const query = `SELECT COUNT(*) as total FROM public.clients;`;

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

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data);
      return;
    }

    console.log('\n📊 Clients table data:');
    console.log('Total clients:', data[0]?.total || 0);

    // Check RLS policies
    const policiesQuery = `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE tablename = 'clients';
    `;

    const policiesResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: policiesQuery }),
      }
    );

    const policiesData = await policiesResponse.json();

    console.log('\n🔒 RLS Policies:');
    console.log(JSON.stringify(policiesData, null, 2));

    // Sample some clients (limit 3)
    const sampleQuery = `SELECT id, full_name, phone, salon_id FROM public.clients LIMIT 3;`;

    const sampleResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sampleQuery }),
      }
    );

    const sampleData = await sampleResponse.json();

    console.log('\n👥 Sample clients:');
    console.log(JSON.stringify(sampleData, null, 2));

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkData();
