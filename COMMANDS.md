# 🎯 Справочник Команд - Beauty Pro CRM

**Все команды для работы с проектом**

---

## 🚀 Установка и Настройка

### Первичная Установка
```bash
# Установка зависимостей
npm install

# Полная автоматическая настройка
npm run setup

# Расширение БД + генерация типов
npm run db:expand
```

### Полная Последовательность (С нуля)
```bash
npm install          # ~2 минуты
npm run setup        # ~5 минут (интерактивный)
npm run db:expand    # ~30 секунд (автоматический)
npm run dev          # Запуск проекта
```

---

## 💻 Разработка

### Запуск Dev Сервера
```bash
npm run dev
# → http://localhost:3000
```

### Build для Production
```bash
npm run build
```

### Запуск Production
```bash
npm run start
# После npm run build
```

---

## 🗄️ База Данных

### Расширение БД (Auto Mode)
```bash
npm run db:expand
# Создаёт таблицы + обновляет типы автоматически
```

### Что Делает db:expand
1. ✅ Подключается к PostgreSQL
2. ✅ Создаёт 4 CRM-таблицы
3. ✅ Настраивает RLS политики
4. ✅ Добавляет индексы
5. ✅ Извлекает Project ID из .env.local
6. ✅ Генерирует TypeScript типы
7. ✅ Сохраняет в src/types/database.ts

---

## 🔧 Утилиты

### Проверка TypeScript
```bash
npm run type-check
# Проверяет типы без компиляции
```

### Линтинг
```bash
npm run lint
# ESLint проверка кода
```

---

## 🕹️ Мастера и Скрипты

### Setup Wizard (Интерактивный)
```bash
npm run setup
```

**Что делает:**
- Настраивает Supabase (ключи + БД)
- Создаёт GitHub репозиторий
- Выполняет git push
- Создаёт .env.local
- Готовит к Vercel deploy

### Database Expansion (Автоматический)
```bash
npm run db:expand
```

**Что делает:**
- Создаёт clients, services, inventory_items, appointments
- Настраивает RLS + индексы + триггеры
- Генерирует TypeScript типы

---

## 📦 Зависимости

### Установка Дополнительных Пакетов
```bash
npm install [package-name]
```

### Обновление Зависимостей
```bash
npm update
```

### Проверка Устаревших Пакетов
```bash
npm outdated
```

---

## 🧪 Тестирование (Будущее)

### Unit Tests
```bash
npm run test
# Пока не реализовано
```

### E2E Tests
```bash
npm run test:e2e
# Пока не реализовано
```

---

## 🐳 Docker (Опционально)

### Build Docker Image
```bash
docker build -t beauty-pro-crm .
```

### Run Container
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  beauty-pro-crm
```

---

## 🔄 Git Операции

### Инициализация (Автоматически через setup)
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Обычный Workflow
```bash
git add .
git commit -m "feat: добавил новый функционал"
git push
```

---

## 🚀 Деплой

### Vercel (Рекомендуется)
```bash
# Через UI
# 1. Импортируйте GitHub repo в Vercel
# 2. Добавьте Environment Variables
# 3. Deploy

# Через CLI
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

---

## 🔍 Диагностика

### Проверка Окружения
```bash
# Node версия
node -v

# npm версия
npm -v

# Git версия
git --version
```

### Проверка .env.local
```bash
cat .env.local
# Проверьте наличие всех переменных
```

### Проверка Подключения к БД
```bash
# В PostgreSQL клиенте или через SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 📊 Статистика Проекта

### Размер node_modules
```bash
du -sh node_modules
# ~300MB
```

### Количество Файлов
```bash
find . -type f | wc -l
```

### Строки Кода
```bash
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l
```

---

## 🛠️ Быстрые Фиксы

### Очистка и Переустановка
```bash
rm -rf node_modules package-lock.json
npm install
```

### Очистка Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Сброс Git (Осторожно!)
```bash
rm -rf .git
git init
```

### Пересоздание .env.local
```bash
rm .env.local
npm run setup
```

---

## 📝 Полезные Алиасы (Опционально)

Добавьте в `~/.zshrc` или `~/.bashrc`:

```bash
# Beauty Pro CRM aliases
alias crm-dev='cd ~/Desktop/Shine_crm_final && npm run dev'
alias crm-setup='cd ~/Desktop/Shine_crm_final && npm run setup'
alias crm-expand='cd ~/Desktop/Shine_crm_final && npm run db:expand'
alias crm-build='cd ~/Desktop/Shine_crm_final && npm run build'
```

Использование:
```bash
crm-dev      # Быстрый запуск dev сервера
crm-expand   # Быстрое расширение БД
```

---

## 🎯 Часто Используемые Комбинации

### Свежая Установка
```bash
npm install && npm run setup && npm run db:expand && npm run dev
```

### После Git Pull
```bash
npm install && npm run dev
```

### Проверка Перед Коммитом
```bash
npm run type-check && npm run lint
```

### Полная Очистка и Перезапуск
```bash
rm -rf node_modules .next && npm install && npm run dev
```

---

## 📖 Документация Команд

| Команда | Описание | Время | Интерактивная |
|---------|----------|-------|---------------|
| `npm install` | Установка зависимостей | ~2 мин | Нет |
| `npm run setup` | Мастер настройки | ~5 мин | Да |
| `npm run db:expand` | Расширение БД + типы | ~30 сек | Нет |
| `npm run dev` | Dev сервер | - | Нет |
| `npm run build` | Production build | ~1 мин | Нет |
| `npm run type-check` | Проверка TypeScript | ~10 сек | Нет |
| `npm run lint` | ESLint проверка | ~5 сек | Нет |

---

## 🎉 Шпаргалка

**Новый проект:**
```bash
npm install
npm run setup
npm run db:expand
npm run dev
```

**Ежедневная разработка:**
```bash
npm run dev
# Ctrl+C для остановки
```

**Перед коммитом:**
```bash
npm run type-check
git add .
git commit -m "..."
git push
```

**Деплой:**
```bash
git push
# Vercel автоматически задеплоит
```

---

**Happy coding! 🚀✨**

---

**Создано с ❤️ для Beauty Pro CRM**

*Знание команд - путь к продуктивности!*
