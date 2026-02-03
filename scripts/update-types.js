#!/usr/bin/env node

/**
 * Beauty Pro CRM - Auto Type Generator
 * Автоматическая генерация TypeScript типов из Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

/**
 * Извлечь Project ID из .env.local
 */
function extractProjectId() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local не найден. Запустите сначала: npm run setup');
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Извлекаем URL вида: https://abcdefgh.supabase.co
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=https?:\/\/([^.]+)\.supabase\.co/);
  
  if (!urlMatch || !urlMatch[1]) {
    throw new Error('Не удалось извлечь Project ID из NEXT_PUBLIC_SUPABASE_URL');
  }
  
  return urlMatch[1];
}

/**
 * Главная функция
 */
async function updateTypes() {
  try {
    log.info('🔄 Обновление TypeScript типов...');
    
    // Извлекаем Project ID
    const projectId = extractProjectId();
    log.success(`Project ID: ${projectId}`);
    
    // Создаём директорию для типов если её нет
    const typesDir = path.join(process.cwd(), 'src', 'types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
      log.success('Создана директория src/types');
    }
    
    // Генерируем типы через Supabase CLI
    log.info('Генерация типов через Supabase CLI...');
    log.warning('Это может занять несколько секунд...');
    
    const command = `npx supabase gen types typescript --project-id ${projectId} --schema public`;
    const outputPath = path.join(typesDir, 'database.ts');
    
    try {
      const types = execSync(command, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Сохраняем типы в файл
      fs.writeFileSync(outputPath, types);
      log.success('✨ Типы успешно обновлены!');
      log.success(`Файл: src/types/database.ts`);
      
    } catch (execError) {
      // Если Supabase CLI не установлен или нет доступа
      log.error('Не удалось сгенерировать типы автоматически');
      log.warning('Возможные причины:');
      console.log('  1. Supabase CLI не установлен');
      console.log('  2. Нет доступа к проекту');
      console.log('  3. Неправильный Project ID');
      console.log('');
      log.info('Обходное решение:');
      console.log('  1. Зайдите в Supabase Dashboard');
      console.log(`  2. Откройте проект: https://supabase.com/dashboard/project/${projectId}`);
      console.log('  3. Перейдите в Settings → API');
      console.log('  4. Скопируйте TypeScript Types');
      console.log('  5. Вставьте в src/types/database.ts');
      console.log('');
      
      // Создаём пустой файл с комментарием
      const placeholder = `// TypeScript types for Supabase
// Обновите этот файл вручную из Dashboard → Settings → API → TypeScript Types
// Или установите Supabase CLI: npm install -g supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
`;
      
      if (!fs.existsSync(outputPath)) {
        fs.writeFileSync(outputPath, placeholder);
        log.warning('Создан placeholder файл: src/types/database.ts');
        log.info('Обновите его вручную из Supabase Dashboard');
      }
    }
    
    console.log('');
    log.success('🎯 Следующий шаг: npm run dev');
    
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    process.exit(1);
  }
}

// Запуск
updateTypes();
