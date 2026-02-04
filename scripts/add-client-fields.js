const projectRef = 'ndrqxlawxvfnloyzrpyo';
const accessToken = 'sbp_7a1340c27fa666ceb28c9f062aef21d791be6445';

async function addFields() {
  const statements = [
    // Add instagram column
    `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS instagram TEXT;`,
    
    // Create RFM segment enum type
    `DO $$ BEGIN
      CREATE TYPE rfm_segment AS ENUM ('VIP', 'Loyal', 'Regular', 'Sleeping', 'Lost', 'New');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    // Add rfm_segment column
    `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rfm_segment rfm_segment DEFAULT 'New';`,
    
    // Create index for faster filtering
    `CREATE INDEX IF NOT EXISTS idx_clients_rfm_segment ON public.clients(rfm_segment);`,
    `CREATE INDEX IF NOT EXISTS idx_clients_full_name ON public.clients(full_name);`,
    `CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);`,
  ];

  console.log('Додаю поля instagram та rfm_segment...\n');

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`[${i + 1}/${statements.length}]`);

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
        if (data.message && (data.message.includes('already exists') || data.message.includes('duplicate'))) {
          console.log('✅ Already exists\n');
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

  console.log('✅ Поля додано!');
}

addFields();
