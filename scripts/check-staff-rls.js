const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkRLS() {
  try {
    // Check RLS policies on staff table
    const rlsQuery = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = 'staff'
      ORDER BY policyname;
    `;

    const rlsResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: rlsQuery }),
      }
    );

    const rlsData = await rlsResponse.json();

    console.log('\n🔒 RLS Policies на таблиці staff:');
    console.log('==========================================\n');
    
    if (rlsData.length === 0) {
      console.log('⚠️  Немає RLS політик на таблиці staff!');
    } else {
      rlsData.forEach((policy, index) => {
        console.log(`${index + 1}. ${policy.policyname}`);
        console.log(`   Command: ${policy.cmd}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log(`   USING: ${policy.qual || 'N/A'}`);
        console.log('');
      });
    }

    // Get salons data
    const salonsQuery = `SELECT id, name FROM salons LIMIT 5;`;
    
    const salonsResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: salonsQuery }),
      }
    );

    const salonsData = await salonsResponse.json();

    console.log('\n🏪 Салони в базі:');
    console.log('==========================================\n');
    
    salonsData.forEach((salon, index) => {
      console.log(`${index + 1}. ${salon.name}`);
      console.log(`   ID: ${salon.id}`);
      console.log('');
    });

    // Get staff with salon info
    const staffQuery = `
      SELECT 
        s.id,
        s.user_id,
        s.salon_id,
        s.full_name,
        s.email,
        sal.name as salon_name
      FROM staff s
      LEFT JOIN salons sal ON s.salon_id = sal.id
      LIMIT 5;
    `;
    
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

    console.log('\n👥 Staff в базі:');
    console.log('==========================================\n');
    
    staffData.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.full_name} (${staff.email})`);
      console.log(`   User ID: ${staff.user_id}`);
      console.log(`   Salon ID: ${staff.salon_id}`);
      console.log(`   Salon: ${staff.salon_name}`);
      console.log('');
    });

    if (salonsData.length > 0) {
      console.log('\n💡 Для хардкоду використай:');
      console.log(`const [salonId, setSalonId] = useState<string | null>("${salonsData[0].id}");`);
    }

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkRLS();
