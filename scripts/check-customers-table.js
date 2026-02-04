const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkTable() {
  try {
    // Check customers table
    const query = `
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'customers'
      ORDER BY ordinal_position;
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

    const data = await response.json();
    
    if (data.length === 0) {
      console.log('⚠️  Table "customers" does not exist. Checking "clients" instead...\n');
      
      // Check clients table
      const clientsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'clients'
        ORDER BY ordinal_position;
      `;
      
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
      console.log('📋 "clients" table structure:');
      console.log(JSON.stringify(clientsData, null, 2));
    } else {
      console.log('✅ "customers" table structure:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkTable();
