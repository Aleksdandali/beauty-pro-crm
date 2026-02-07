const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkStaff() {
  try {
    // Get all staff with user details
    const query = `
      SELECT 
        s.id,
        s.user_id,
        s.salon_id,
        s.full_name,
        s.email,
        s.role,
        sal.name as salon_name
      FROM staff s
      LEFT JOIN salons sal ON s.salon_id = sal.id
      ORDER BY s.created_at DESC
      LIMIT 10;
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

    console.log('\n👥 Staff records (з прив\'язкою до салонів):');
    console.log('================================================\n');
    
    if (data.length === 0) {
      console.log('⚠️  Немає записів у таблиці staff!');
    } else {
      data.forEach((staff, index) => {
        console.log(`${index + 1}. ${staff.full_name} (${staff.email})`);
        console.log(`   User ID: ${staff.user_id}`);
        console.log(`   Salon ID: ${staff.salon_id}`);
        console.log(`   Salon: ${staff.salon_name || 'N/A'}`);
        console.log(`   Role: ${staff.role}`);
        console.log('');
      });
      
      console.log(`\n✅ Всього записів: ${data.length}`);
    }

    // Also get auth users for comparison
    const usersQuery = `SELECT id, email FROM auth.users LIMIT 10;`;
    
    const usersResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: usersQuery }),
      }
    );

    const usersData = await usersResponse.json();
    
    console.log('\n🔐 Auth users:');
    console.log('================================================\n');
    usersData.forEach((user, index) => {
      const hasStaff = data.some(s => s.user_id === user.id);
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   В staff: ${hasStaff ? '✅ ТАК' : '❌ НІ'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkStaff();
