const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function addUserToStaff() {
  const query = `
    INSERT INTO public.staff (
      salon_id,
      user_id,
      role,
      full_name,
      email,
      phone,
      is_active
    ) VALUES (
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      '34d2eff9-b462-4f37-afb7-7bef1448850b',
      'owner',
      'Олександр',
      'gloss.odessa@gmail.com',
      '+380 67 000 0000',
      true
    )
    ON CONFLICT (user_id, salon_id) DO NOTHING;
  `;

  console.log('Adding user to staff...\n');

  try {
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
      console.error('❌ Error:', data.message || data);
    } else {
      console.log('✅ User added to staff!');
      console.log('User ID: 34d2eff9-b462-4f37-afb7-7bef1448850b');
      console.log('Salon ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      console.log('\nNow the user should be able to see clients!');
    }
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

addUserToStaff();
