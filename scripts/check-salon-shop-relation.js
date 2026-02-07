const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function checkRelation() {
  try {
    // Check salons table
    const salonsQuery = `SELECT id, name FROM public.salons LIMIT 5;`;
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
    console.log('\n📍 Salons table:');
    console.log(JSON.stringify(salonsData, null, 2));

    // Check shops table
    const shopsQuery = `SELECT id, name FROM public.shops LIMIT 5;`;
    const shopsResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: shopsQuery }),
      }
    );
    const shopsData = await shopsResponse.json();
    console.log('\n🏪 Shops table:');
    console.log(JSON.stringify(shopsData, null, 2));

    // Check profiles
    const profilesQuery = `SELECT id, full_name, shop_id FROM public.profiles LIMIT 5;`;
    const profilesResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: profilesQuery }),
      }
    );
    const profilesData = await profilesResponse.json();
    console.log('\n👤 Profiles:');
    console.log(JSON.stringify(profilesData, null, 2));

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkRelation();
