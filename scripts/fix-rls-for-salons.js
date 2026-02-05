const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function fixRLS() {
  const statements = [
    // Drop current policies
    `DROP POLICY IF EXISTS "Users can view clients from their salon" ON public.clients;`,
    `DROP POLICY IF EXISTS "Users can create clients in their salon" ON public.clients;`,
    `DROP POLICY IF EXISTS "Users can update clients in their salon" ON public.clients;`,
    `DROP POLICY IF EXISTS "Users can delete clients in their salon" ON public.clients;`,
    
    // Create new policy that works with staff table (which links users to salons)
    `CREATE POLICY "Staff can manage clients"
      ON public.clients
      FOR ALL
      USING (
        salon_id IN (
          SELECT salon_id FROM public.staff WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        salon_id IN (
          SELECT salon_id FROM public.staff WHERE user_id = auth.uid()
        )
      );`,
  ];

  console.log(`Executing ${statements.length} statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`[${i + 1}/${statements.length}]`);
    console.log(statement.substring(0, 80) + '...\n');

    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.message && (data.message.includes('already exists') || data.message.includes('does not exist'))) {
          console.log('⚠️  Expected, continuing...\n');
        } else {
          console.error(`❌ Error:`, data.message || data);
        }
      } else {
        console.log(`✅ Success\n`);
      }
    } catch (error) {
      console.error(`❌ Failed:`, error.message);
    }
  }

  console.log('\n✅ RLS policies updated to work with staff/salons!');
}

fixRLS().catch(console.error);
