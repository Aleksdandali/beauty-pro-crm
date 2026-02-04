#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTM0MTQsImV4cCI6MjA1NDA2OTQxNH0.FQHpdt4E7Ny3_Vny4oSrMvCPyLbOGNzd4J7Xmzq7iZo';

console.log('🔍 Проверяю Supabase API key...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testKey() {
  try {
    // Простой запрос для проверки ключа
    const { data, error } = await supabase.from('salons').select('count').limit(1);

    if (error) {
      console.error('❌ Ошибка:', error.message);
      console.error('   Code:', error.code);
      console.log('\n🔑 Возможно API key изменился или истек');
      console.log('📋 Проверьте ключи в Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo/settings/api\n');
    } else {
      console.log('✅ API key работает!');
      console.log('📊 Ответ:', data);
    }
  } catch (err) {
    console.error('❌ Критическая ошибка:', err.message);
  }
}

testKey();
