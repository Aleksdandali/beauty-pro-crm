const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkStructure() {
  try {
    // Get staff table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'staff'
      ORDER BY ordinal_position;
    `;
    const structureResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: structureQuery }),
      }
    );
    const structureData = await structureResponse.json();
    console.log('\n📋 Staff table structure:');
    console.log(JSON.stringify(structureData, null, 2));

    // Get staff data with correct columns
    const staffQuery = `SELECT * FROM public.staff LIMIT 5;`;
    const staffResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: staffQuery }),
      }
    );
    const staffData = await staffResponse.json();
    console.log('\n👥 Staff data:');
    console.log(JSON.stringify(staffData, null, 2));

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkStructure();
