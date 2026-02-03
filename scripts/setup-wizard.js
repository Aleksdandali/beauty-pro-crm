#!/usr/bin/env node

/**
 * Beauty Pro CRM - Setup Wizard
 * Интерактивный мастер настройки проекта
 * 
 * Автоматизирует:
 * - Настройку Supabase (ключи + база данных)
 * - Создание GitHub репозитория и push кода
 * - Подготовку к деплою на Vercel
 * - Создание .env.local с переменными
 */

const inquirer = require('inquirer');
const open = require('open');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

// Утилиты
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
};

// Путь к .env.local
const ENV_PATH = path.join(process.cwd(), '.env.local');

// Хранилище данных
const config = {
  supabase: {},
  github: {},
  vercel: {},
};

/**
 * Главная функция
 */
async function main() {
  console.clear();
  
  log.title('🎨 Beauty Pro CRM - Мастер Настройки');
  console.log('Этот скрипт поможет настроить проект за 5 минут!\n');
  
  try {
    // Проверка зависимостей
    await checkDependencies();
    
    // Шаг 1: Supabase - Ключи API
    await setupSupabaseKeys();
    
    // Шаг 2: Supabase - База данных
    await setupSupabaseDatabase();
    
    // Шаг 3: GitHub - Репозиторий и Push
    await setupGitHub();
    
    // Шаг 4: Vercel - Деплой
    await setupVercel();
    
    // Финал: Сохранение конфигурации
    await finalizeSetup();
    
    // Успех!
    showSuccessMessage();
    
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Проверка установленных зависимостей
 */
async function checkDependencies() {
  log.info('Проверка зависимостей...');
  
  // Проверка Node.js версии
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    throw new Error('Требуется Node.js версии 18 или выше');
  }
  
  // Проверка Git
  try {
    execSync('git --version', { stdio: 'ignore' });
  } catch {
    throw new Error('Git не установлен. Установите Git: https://git-scm.com/');
  }
  
  log.success('Все зависимости установлены');
}

/**
 * Шаг 1: Настройка Supabase Keys
 */
async function setupSupabaseKeys() {
  log.title('📦 Шаг 1: Supabase - API Ключи');
  
  const { projectId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectId',
      message: 'Введите Reference ID вашего Supabase проекта:',
      validate: (input) => input.length > 0 || 'ID проекта обязателен',
    },
  ]);
  
  config.supabase.projectId = projectId;
  
  log.info('Открываю страницу API настроек в браузере...');
  await open(`https://supabase.com/dashboard/project/${projectId}/settings/api`);
  
  console.log('\n📋 Скопируйте следующие значения со страницы API:\n');
  
  const { supabaseUrl, supabaseAnonKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'supabaseUrl',
      message: 'Project URL (NEXT_PUBLIC_SUPABASE_URL):',
      validate: (input) => input.startsWith('https://') || 'URL должен начинаться с https://',
    },
    {
      type: 'input',
      name: 'supabaseAnonKey',
      message: 'anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY):',
      validate: (input) => input.length > 50 || 'Ключ слишком короткий',
    },
  ]);
  
  config.supabase.url = supabaseUrl;
  config.supabase.anonKey = supabaseAnonKey;
  
  log.success('Supabase API ключи сохранены');
}

/**
 * Шаг 2: Настройка Supabase Database
 */
async function setupSupabaseDatabase() {
  log.title('🗄️ Шаг 2: Supabase - База Данных');
  
  log.info('Открываю страницу настроек базы данных...');
  await open(`https://supabase.com/dashboard/project/${config.supabase.projectId}/settings/database`);
  
  console.log('\n📋 Скопируйте Connection String (URI format):\n');
  log.warning('ВАЖНО: Замените [YOUR-PASSWORD] на реальный пароль базы данных!\n');
  
  const { databaseUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'databaseUrl',
      message: 'Database URL (DATABASE_URL):',
      validate: (input) => input.startsWith('postgresql://') || 'URL должен начинаться с postgresql://',
    },
  ]);
  
  config.supabase.databaseUrl = databaseUrl;
  
  // Спросить, нужно ли выполнить миграцию сейчас
  const { runMigration } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runMigration',
      message: 'Выполнить SQL миграцию (создать таблицы) сейчас?',
      default: true,
    },
  ]);
  
  if (runMigration) {
    await runDatabaseMigration(databaseUrl);
  } else {
    log.warning('Миграция пропущена. Выполните её вручную через SQL Editor в Supabase.');
  }
  
  log.success('База данных настроена');
}

/**
 * Выполнение SQL миграции
 */
async function runDatabaseMigration(databaseUrl) {
  log.info('Подключение к базе данных...');
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  
  try {
    await client.connect();
    log.success('Подключение к базе данных установлено');
    
    // Читаем SQL файл миграции
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      log.warning('Файл миграции не найден. Пропускаем автоматическую миграцию.');
      return;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    log.info('Выполнение SQL миграции...');
    await client.query(migrationSQL);
    
    log.success('✅ База данных успешно настроена! Все таблицы созданы.');
    
  } catch (error) {
    log.error(`Ошибка миграции: ${error.message}`);
    log.warning('Выполните миграцию вручную через Supabase SQL Editor');
  } finally {
    await client.end();
  }
}

/**
 * Шаг 3: Настройка GitHub
 */
async function setupGitHub() {
  log.title('🐙 Шаг 3: GitHub - Репозиторий и Push');
  
  log.info('Открываю страницу создания репозитория...');
  await open('https://github.com/new');
  
  console.log('\n📋 Создайте новый репозиторий:\n');
  console.log('  1. Введите название (например: beauty-pro-crm)');
  console.log('  2. Выберите Public или Private');
  console.log('  3. НЕ добавляйте README, .gitignore или LICENSE');
  console.log('  4. Нажмите "Create repository"');
  console.log('  5. Скопируйте HTTPS URL (например: https://github.com/username/repo.git)\n');
  
  const { repoUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'repoUrl',
      message: 'Вставьте URL репозитория:',
      validate: (input) => {
        if (input.includes('github.com') && input.endsWith('.git')) {
          return true;
        }
        return 'URL должен быть в формате: https://github.com/username/repo.git';
      },
    },
  ]);
  
  config.github.repoUrl = repoUrl;
  
  // Git инициализация и push
  await initializeGitAndPush(repoUrl);
  
  log.success('Код успешно залит на GitHub!');
}

/**
 * Git инициализация и push
 */
async function initializeGitAndPush(repoUrl) {
  log.info('Настройка Git и отправка кода...');
  
  try {
    // Проверяем, инициализирован ли уже Git
    const isGitRepo = fs.existsSync(path.join(process.cwd(), '.git'));
    
    if (!isGitRepo) {
      log.info('Инициализация Git репозитория...');
      execSync('git init', { stdio: 'inherit' });
      log.success('Git репозиторий инициализирован');
    }
    
    // Создаем .gitignore если его нет
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = `
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`.trim();
      fs.writeFileSync(gitignorePath, gitignoreContent);
      log.success('.gitignore создан');
    }
    
    // Добавляем все файлы
    log.info('Добавление файлов в Git...');
    execSync('git add .', { stdio: 'inherit' });
    
    // Создаем коммит
    log.info('Создание коммита...');
    try {
      execSync('git commit -m "Initial commit: Beauty Pro CRM Setup"', { stdio: 'inherit' });
    } catch (error) {
      // Возможно, коммит уже существует
      log.warning('Коммит уже существует или нет изменений');
    }
    
    // Переименовываем ветку в main
    try {
      execSync('git branch -M main', { stdio: 'inherit' });
    } catch (error) {
      // Ветка уже называется main
    }
    
    // Добавляем remote origin
    try {
      execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
      log.success('Remote origin добавлен');
    } catch (error) {
      // Remote уже существует, обновляем URL
      try {
        execSync(`git remote set-url origin ${repoUrl}`, { stdio: 'inherit' });
        log.success('Remote origin обновлен');
      } catch (setUrlError) {
        log.warning('Не удалось обновить remote origin');
      }
    }
    
    // Push на GitHub
    log.info('Отправка кода на GitHub...');
    try {
      execSync('git push -u origin main', { stdio: 'inherit' });
      log.success('✅ Код успешно отправлен на GitHub!');
    } catch (error) {
      // Возможно, нужен force push
      const { forcePush } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'forcePush',
          message: 'Обычный push не удался. Выполнить force push?',
          default: false,
        },
      ]);
      
      if (forcePush) {
        execSync('git push -u origin main --force', { stdio: 'inherit' });
        log.success('✅ Force push выполнен успешно!');
      } else {
        log.warning('Push пропущен. Выполните вручную: git push -u origin main');
      }
    }
    
  } catch (error) {
    throw new Error(`Git операция не удалась: ${error.message}`);
  }
}

/**
 * Шаг 4: Настройка Vercel
 */
async function setupVercel() {
  log.title('▲ Шаг 4: Vercel - Деплой');
  
  log.info('Открываю Vercel для импорта проекта...');
  await open('https://vercel.com/new');
  
  console.log('\n📋 Инструкция по деплою:\n');
  console.log('  1. Нажмите "Import Git Repository"');
  console.log('  2. Выберите ваш GitHub репозиторий');
  console.log('  3. Vercel автоматически определит Next.js');
  console.log('  4. Добавьте Environment Variables:');
  console.log(`     - NEXT_PUBLIC_SUPABASE_URL = ${config.supabase.url}`);
  console.log(`     - NEXT_PUBLIC_SUPABASE_ANON_KEY = ${config.supabase.anonKey}`);
  console.log('  5. Нажмите "Deploy"\n');
  
  const { deployReady } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'deployReady',
      message: 'Продолжить после настройки деплоя?',
      default: true,
    },
  ]);
  
  if (deployReady) {
    log.success('Vercel настроен. После деплоя обновите NEXT_PUBLIC_APP_URL в .env.local');
  }
}

/**
 * Финализация: Сохранение .env.local
 */
async function finalizeSetup() {
  log.title('💾 Финал: Сохранение Конфигурации');
  
  log.info('Создание .env.local файла...');
  
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${config.supabase.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.supabase.anonKey}

# Database URL (для миграций и серверных операций)
DATABASE_URL=${config.supabase.databaseUrl}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# GitHub Repository
GITHUB_REPO=${config.github.repoUrl || 'not-set'}

# После деплоя на Vercel, обновите:
# NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
`;
  
  fs.writeFileSync(ENV_PATH, envContent);
  log.success('.env.local создан и сохранен');
  
  // Проверяем установку зависимостей
  log.info('Проверка зависимостей...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.dependencies.pg) {
    log.info('Установка pg для работы с PostgreSQL...');
    try {
      execSync('npm install pg', { stdio: 'inherit' });
      log.success('pg установлен');
    } catch (error) {
      log.warning('Не удалось установить pg. Установите вручную: npm install pg');
    }
  }
  
  log.success('Все зависимости готовы');
}

/**
 * Сообщение об успехе
 */
function showSuccessMessage() {
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`${colors.bright}${colors.green}🚀 Проект успешно настроен!${colors.reset}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`${colors.green}✓${colors.reset} База данных настроена и готова`);
  console.log(`${colors.green}✓${colors.reset} Код залит на GitHub: ${config.github.repoUrl || 'N/A'}`);
  console.log(`${colors.green}✓${colors.reset} .env.local создан с переменными окружения`);
  console.log(`${colors.green}✓${colors.reset} Готово к деплою на Vercel`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`${colors.cyan}Следующие шаги:${colors.reset}`);
  console.log('');
  console.log('  1. Запустите проект локально:');
  console.log(`     ${colors.yellow}npm run dev${colors.reset}`);
  console.log('');
  console.log('  2. Откройте в браузере:');
  console.log(`     ${colors.yellow}http://localhost:3000${colors.reset}`);
  console.log('');
  console.log('  3. После деплоя на Vercel обновите в .env.local:');
  console.log(`     ${colors.yellow}NEXT_PUBLIC_APP_URL=https://your-app.vercel.app${colors.reset}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`${colors.bright}Happy coding! 🎨💅✨${colors.reset}`);
  console.log('');
}

/**
 * Обработка ошибок
 */
process.on('unhandledRejection', (error) => {
  log.error(`Необработанная ошибка: ${error.message}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\nНастройка прервана пользователем.');
  process.exit(0);
});

// Запуск
main();
