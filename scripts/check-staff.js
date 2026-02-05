const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkStaff() {
  try {
    // Check all staff
    const staffQuery = `SELECT id, user_id, salon_id, name, email, role FROM public.staff;`;
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
    console.log('\n👥 Staff table:');
    console.log(JSON.stringify(staffData, null, 2));

    // Check auth users
    const usersQuery = `SELECT id, email FROM auth.users;`;
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
    console.log(JSON.stringify(usersData, null, 2));

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkStaff();
