#!/bin/bash
# ============================================================
# 🚀 BEAUTY PRO CRM — ONE-TIME SETUP
# Запусти один раз: bash setup.sh
# ============================================================

set -e
clear

echo "╔══════════════════════════════════════════════════╗"
echo "║   🎯 Beauty Pro CRM — Full Setup                ║"
echo "║   GitHub + Vercel + Supabase                     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ======================== COLORS ========================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ok() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
err() { echo -e "  ${RED}✗${NC} $1"; }
info() { echo -e "  ${CYAN}→${NC} $1"; }

# ======================== STEP 1: Check we're in project root ========================
echo -e "\n${CYAN}[1/7]${NC} Перевірка директорії..."

if [ ! -f "package.json" ]; then
    err "package.json не знайдено!"
    err "Запусти цей скрипт з кореневої папки проекту:"
    err "  cd /path/to/beauty-pro-crm && bash setup.sh"
    exit 1
fi

if grep -q "next" package.json 2>/dev/null; then
    ok "Next.js проект знайдено"
else
    warn "Не схоже на Next.js проект, але продовжуємо..."
fi

# ======================== STEP 2: Git setup ========================
echo -e "\n${CYAN}[2/7]${NC} Налаштування Git..."

if [ ! -d ".git" ]; then
    git init
    ok "Git ініціалізовано"
else
    ok "Git вже ініціалізовано"
fi

# Check remote
REMOTE=$(git remote -v 2>/dev/null | grep origin | head -1 | awk '{print $2}')
if [ -z "$REMOTE" ]; then
    warn "GitHub remote не налаштований"
    echo ""
    read -p "  Введи URL GitHub репозиторію (https://github.com/USER/REPO.git): " GITHUB_URL
    if [ -n "$GITHUB_URL" ]; then
        git remote add origin "$GITHUB_URL"
        ok "Remote додано: $GITHUB_URL"
    else
        err "Пропущено. Додай вручну: git remote add origin URL"
    fi
else
    ok "Remote: $REMOTE"
fi

# Ensure main branch
BRANCH=$(git branch --show-current 2>/dev/null)
if [ "$BRANCH" != "main" ]; then
    git branch -M main 2>/dev/null || true
    ok "Гілка перейменована в main"
else
    ok "Гілка: main"
fi

# ======================== STEP 3: .env.local ========================
echo -e "\n${CYAN}[3/7]${NC} Налаштування Environment Variables..."

if [ -f ".env.local" ]; then
    ok ".env.local вже існує"
    info "Поточний вміст:"
    grep -E "^NEXT_PUBLIC_SUPABASE|^SUPABASE_" .env.local 2>/dev/null | sed 's/=.*/=***/' | while read line; do
        echo "    $line"
    done
    echo ""
    read -p "  Перезаписати? (y/N): " OVERWRITE_ENV
    if [ "$OVERWRITE_ENV" != "y" ] && [ "$OVERWRITE_ENV" != "Y" ]; then
        info "Залишаємо поточний .env.local"
        SKIP_ENV=true
    fi
fi

if [ "$SKIP_ENV" != "true" ]; then
    echo ""
    echo "  Знайди ключі тут: https://supabase.com → Project → Settings → API"
    echo ""
    read -p "  NEXT_PUBLIC_SUPABASE_URL (https://xxx.supabase.co): " SUPA_URL
    read -p "  NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPA_ANON
    read -p "  SUPABASE_SERVICE_ROLE_KEY (опціонально, Enter щоб пропустити): " SUPA_SERVICE

    cat > .env.local << ENVEOF
# ============================================================
# Supabase — НЕ КОМІТИТИ В GIT!
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=${SUPA_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPA_ANON}
ENVEOF

    if [ -n "$SUPA_SERVICE" ]; then
        echo "SUPABASE_SERVICE_ROLE_KEY=${SUPA_SERVICE}" >> .env.local
    fi

    ok ".env.local створено"
fi

# ======================== STEP 4: .gitignore ========================
echo -e "\n${CYAN}[4/7]${NC} Перевірка .gitignore..."

if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'GIEOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/

# Build
build/
dist/

# ENV — NEVER COMMIT
.env
.env.local
.env.*.local

# Vercel
.vercel/

# IDE
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
*.tsbuildinfo
next-env.d.ts
GIEOF
    ok ".gitignore створено"
else
    # Ensure .env.local is in gitignore
    if ! grep -q "\.env\.local" .gitignore 2>/dev/null; then
        echo -e "\n# ENV — NEVER COMMIT\n.env.local\n.env.*.local" >> .gitignore
        ok "Додано .env.local в .gitignore"
    else
        ok ".gitignore вже містить .env.local"
    fi

    # Ensure .vercel is in gitignore
    if ! grep -q "\.vercel" .gitignore 2>/dev/null; then
        echo -e "\n# Vercel\n.vercel/" >> .gitignore
        ok "Додано .vercel/ в .gitignore"
    else
        ok ".vercel/ вже в .gitignore"
    fi
fi

# ======================== STEP 5: .cursorrules ========================
echo -e "\n${CYAN}[5/7]${NC} Створення .cursorrules..."

cat > .cursorrules << 'CREOF'
# ============================================================
# BEAUTY PRO CRM — CURSOR RULES
# ============================================================

## 🚀 Deployment (CRITICAL!)
- NEVER run `vercel deploy`, `vercel --prod`, or any Vercel CLI commands
- NEVER ask for Vercel tokens or try to configure Vercel CLI
- Deployment is 100% automatic via GitHub → Vercel integration
- To deploy: `git add . && git commit -m "message" && git push origin main`
- Vercel auto-deploys from main branch in ~60 seconds
- Production URL: https://beauty-pro-crm-pi.vercel.app

## 🛠 Tech Stack
- Next.js 14+ (App Router, src/app directory)
- TypeScript (strict mode)
- Tailwind CSS (dark mode, custom design system)
- Supabase (Auth + PostgreSQL + Realtime + Storage)
- Vercel (Hosting, auto-deploy from GitHub main branch)

## 🗃 Database (Supabase)
- NEVER modify database schema directly — use Supabase Dashboard or migrations
- Tables: salons, clients, staff, services, appointments, inventory_*, salon_settings
- All tables use UUID primary keys and salon_id for multi-tenancy
- RLS (Row Level Security) is enabled on all tables

## 📁 Project Structure
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Landing page (public)
│   ├── login/        # Auth pages
│   ├── register/
│   └── dashboard/    # Protected area
│       ├── clients/
│       ├── team/
│       ├── services/
│       ├── calendar/
│       ├── inventory/
│       ├── finances/
│       ├── analytics/
│       └── settings/
├── components/       # Reusable components
├── lib/              # Utilities, Supabase client, types
└── styles/           # Global styles

## 🔑 Environment Variables
- Stored in .env.local (local dev) and Vercel Dashboard (production)
- NEVER hardcode API keys, tokens, or secrets in source code
- NEVER commit .env.local or any .env files to git
- Required vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

## 🎨 Design System
- Dark mode primary: bg-[#0a0a0a]
- Gradient accents: violet-500 → fuchsia-500
- Font: Outfit (headings + body)
- Border color: white/[0.06]
- Card background: white/[0.02] or white/[0.03]

## 📋 Git Workflow
- Always commit with conventional commits: feat:, fix:, refactor:, style:, docs:
- Push to main for production deploy
- Test locally with `npm run dev` before pushing

## 🌍 Language
- UI language: Ukrainian (uk)
- Code/comments: English
- Variable names: English
CREOF

ok ".cursorrules створено"

# ======================== STEP 6: Remove Vercel CLI config (cleanup) ========================
echo -e "\n${CYAN}[6/7]${NC} Очистка старих конфігів..."

if [ -d ".vercel" ]; then
    rm -rf .vercel
    ok "Видалено .vercel/ (старі CLI конфіги)"
else
    ok "Немає старих Vercel CLI конфігів"
fi

# Remove vercel.json if it only has basic config
if [ -f "vercel.json" ]; then
    VERCEL_SIZE=$(wc -c < vercel.json)
    if [ "$VERCEL_SIZE" -lt 50 ]; then
        warn "vercel.json знайдено (${VERCEL_SIZE} bytes) — можливо зайвий"
        info "Vercel автоматично детектить Next.js, vercel.json зазвичай не потрібен"
    else
        ok "vercel.json залишено (містить кастомні налаштування)"
    fi
fi

# ======================== STEP 7: Initial commit & push ========================
echo -e "\n${CYAN}[7/7]${NC} Git commit & push..."

git add .gitignore .cursorrules
git add -A 2>/dev/null || true

CHANGES=$(git status --porcelain | wc -l)
if [ "$CHANGES" -gt 0 ]; then
    git commit -m "chore: setup project infrastructure

- Add .cursorrules for Cursor AI
- Update .gitignore (env, vercel, node_modules)
- Configure auto-deploy workflow (GitHub → Vercel)" 2>/dev/null || true
    ok "Коміт створено"

    echo ""
    read -p "  Зробити git push зараз? (Y/n): " DO_PUSH
    if [ "$DO_PUSH" != "n" ] && [ "$DO_PUSH" != "N" ]; then
        git push -u origin main 2>&1 && ok "Запушено в GitHub!" || err "Помилка push — перевір доступ до GitHub"
    else
        info "Пропущено. Зроби вручну: git push -u origin main"
    fi
else
    ok "Немає змін для коміту"
fi

# ======================== FINAL SUMMARY ========================
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   ✅ SETUP COMPLETE                              ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}Що зроблено:${NC}"
echo "  ✓ Git налаштований (main branch)"
echo "  ✓ .env.local з ключами Supabase"
echo "  ✓ .gitignore (захист від витоку ключів)"
echo "  ✓ .cursorrules (Cursor більше не буде тупити)"
echo "  ✓ Старі Vercel CLI конфіги видалені"
echo ""
echo -e "  ${YELLOW}Що зробити вручну (один раз):${NC}"
echo ""
echo "  1. Vercel Dashboard → vercel.com/dashboard"
echo "     → Add New Project → Import Git Repository"
echo "     → Обери beauty-pro-crm → Deploy"
echo ""
echo "  2. Vercel → Project Settings → Environment Variables"
echo "     Додай ТІ Ж ключі що в .env.local:"
echo "     • NEXT_PUBLIC_SUPABASE_URL"
echo "     • NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "     • SUPABASE_SERVICE_ROLE_KEY (якщо є)"
echo ""
echo -e "  ${CYAN}Воркфлоу після setup:${NC}"
echo "  Cursor робить зміни → git push → Vercel деплоїть автоматично"
echo "  Більше НІКОЛИ не потрібно vercel deploy!"
echo ""
echo "  Production: https://beauty-pro-crm-pi.vercel.app"
echo ""
