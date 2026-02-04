#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTM0MTQsImV4cCI6MjA1NDA2OTQxNH0.FQHpdt4E7Ny3_Vny4oSrMvCPyLbOGNzd4J7Xmzq7iZo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSalons() {
  console.log('🔍 Проверяю таблицу salons...\n');

  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .limit(10);

  if (error) {
    console.error('❌ Ошибка:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('📭 Таблица salons пустая (нет записей)');
    console.log('✅ Можно безопасно добавлять колонку city');
    return;
  }

  console.log(`📊 Найдено салонов: ${data.length}\n`);
  
  data.forEach((salon, i) => {
    console.log(`${i + 1}. ${salon.name}`);
    console.log(`   ID: ${salon.id}`);
    console.log(`   Phone: ${salon.phone || 'не указан'}`);
    console.log(`   Address: ${salon.address || 'не указан'}`);
    console.log('');
  });

  console.log('✅ После добавления колонки city:');
  console.log('   - Все эти записи останутся');
  console.log('   - У них просто появится city = NULL');
  console.log('   - Потом можно будет обновить через UPDATE');
}

checkSalons();
