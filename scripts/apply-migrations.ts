#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.log('\n📝 Добавьте в .env.local:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('\n🔑 Где найти Service Role Key:');
  console.log('1. Открой https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo/settings/api');
  console.log('2. Скопируй "service_role" secret key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigrations() {
  console.log('🚀 Applying migrations...\n');

  const migrationsDir = join(process.cwd(), 'supabase/migrations');
  
  try {
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files:\n`);

    for (const file of files) {
      console.log(`📝 Applying: ${file}`);
      
      const sqlPath = join(migrationsDir, file);
      const sql = readFileSync(sqlPath, 'utf-8');

      // Execute SQL using Supabase REST API (RPC)
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // If exec_sql RPC doesn't exist, try direct SQL execution
        // This requires creating a custom function first
        console.log('⚠️  RPC method not available, using alternative method...');
        
        // Alternative: Use the SQL endpoint directly via fetch
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
          console.error(`❌ Error applying ${file}:`, await response.text());
          continue;
        }
      }

      console.log(`✅ Successfully applied: ${file}\n`);
    }

    console.log('🎉 All migrations applied successfully!');

  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

// Специальная функция для применения одной миграции напрямую
async function applyMigrationDirectly(filename: string) {
  console.log(`🚀 Applying migration: ${filename}\n`);
  
  const sqlPath = join(process.cwd(), 'supabase/migrations', filename);
  const sql = readFileSync(sqlPath, 'utf-8');
  
  console.log('📝 SQL Query:');
  console.log(sql);
  console.log('');

  // Используем pg для прямого подключения
  const { Client } = require('pg');
  
  // Connection string из .env.local
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://postgres.ndrqxlawxvfnloyzrpyo:${process.env.SUPABASE_DB_PASSWORD}@db.ndrqxlawxvfnloyzrpyo.supabase.co:5432/postgres`;

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const result = await client.query(sql);
    console.log('✅ Migration applied successfully!');
    console.log('Result:', result);
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

// Если указан конкретный файл, применить только его
const migrationFile = process.argv[2];

if (migrationFile) {
  applyMigrationDirectly(migrationFile);
} else {
  console.log('❌ Для автоматического применения всех миграций нужен DATABASE_URL');
  console.log('');
  console.log('📋 ПРОСТОЙ СПОСОБ:');
  console.log('');
  console.log('Просто скопируй и выполни в Supabase SQL Editor:');
  console.log('');
  console.log('```sql');
  const sql = readFileSync(join(process.cwd(), 'supabase/migrations/002_add_city_to_salons.sql'), 'utf-8');
  console.log(sql);
  console.log('```');
  console.log('');
  console.log('🔗 Ссылка: https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo/sql/new');
}
