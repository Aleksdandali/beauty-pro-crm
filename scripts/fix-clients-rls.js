const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function fixRLS() {
  const statements = [
    // Drop old policy
    `DROP POLICY IF EXISTS "Staff can manage clients" ON public.clients;`,
    
    // Create new policies based on profiles table
    `CREATE POLICY "Users can view clients from their salon"
      ON public.clients
      FOR SELECT
      USING (
        salon_id IN (
          SELECT shop_id FROM public.profiles WHERE id = auth.uid()
        )
      );`,
    
    `CREATE POLICY "Users can create clients in their salon"
      ON public.clients
      FOR INSERT
      WITH CHECK (
        salon_id IN (
          SELECT shop_id FROM public.profiles WHERE id = auth.uid()
        )
      );`,
    
    `CREATE POLICY "Users can update clients in their salon"
      ON public.clients
      FOR UPDATE
      USING (
        salon_id IN (
          SELECT shop_id FROM public.profiles WHERE id = auth.uid()
        )
      );`,
    
    `CREATE POLICY "Users can delete clients in their salon"
      ON public.clients
      FOR DELETE
      USING (
        salon_id IN (
          SELECT shop_id FROM public.profiles WHERE id = auth.uid()
        )
      );`,
  ];

  console.log(`Executing ${statements.length} statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`[${i + 1}/${statements.length}] ${statement.substring(0, 60)}...`);

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
        console.error(`❌ Error:`, data.message || data);
        if (data.message && data.message.includes('already exists')) {
          console.log('⚠️  Already exists, continuing...\n');
        } else if (data.message && data.message.includes('does not exist')) {
          console.log('⚠️  Does not exist, continuing...\n');
        }
      } else {
        console.log(`✅ Success\n`);
      }
    } catch (error) {
      console.error(`❌ Failed:`, error.message);
    }
  }

  console.log('\n✅ RLS policies updated!');
}

fixRLS().catch(console.error);
