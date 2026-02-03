# 🚀 Installation Guide - Beauty Pro CRM

**Choose your installation method:**

---

## ⚡ Method 1: Setup Wizard (Recommended)

**Fastest way! Fully automated setup in 5 minutes.**

### Prerequisites
- Node.js 18+
- Git installed
- Accounts: Supabase, GitHub, Vercel (all free)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Run the wizard
npm run setup
```

### What the Wizard Does

The interactive wizard will:

1. **Configure Supabase**
   - Ask for Project ID
   - Open API settings page
   - Save credentials automatically

2. **Setup Database**
   - Get connection string
   - Run SQL migration automatically
   - Create all tables and policies

3. **Create GitHub Repo**
   - Open GitHub new repo page
   - Automatically push all code
   - Handle git init, commit, push

4. **Prepare Vercel**
   - Open Vercel import page
   - Show environment variables to copy

5. **Finalize**
   - Create .env.local file
   - Install missing dependencies
   - Show success message

### After Wizard Completes

```bash
# Start development
npm run dev

# Open in browser
http://localhost:3000
```

**Full guide:** [SETUP_WIZARD.md](./SETUP_WIZARD.md)

---

## 📖 Method 2: Manual Setup

**Traditional step-by-step setup.**

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait ~2 minutes for setup
4. Save your database password!

### Step 3: Get API Keys

1. Go to Settings → API
2. Copy:
   - Project URL
   - anon public key

### Step 4: Setup Database

1. Go to SQL Editor
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy ALL SQL content
4. Paste and run in SQL Editor

### Step 5: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Step 6: Run Development Server

```bash
npm run dev
```

Open: http://localhost:3000

**Full guide:** [SETUP.md](./SETUP.md)

---

## 🐳 Method 3: Docker (Advanced)

**For containerized deployment.**

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build
docker build -t beauty-pro-crm .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  beauty-pro-crm
```

---

## 📦 What Gets Installed

### Dependencies (Production)
```json
{
  "next": "15.0.3",
  "react": "18.3.1",
  "typescript": "5.3.3",
  "@supabase/supabase-js": "2.39.7",
  "@tanstack/react-query": "5.20.5",
  "tailwindcss": "3.4.1",
  "shadcn-ui": "latest",
  "next-intl": "3.9.1",
  "zod": "3.22.4",
  "inquirer": "8.2.5",
  "pg": "8.11.3"
}
```

### Dev Dependencies
```json
{
  "@types/node": "20.11.17",
  "@types/react": "18.2.55",
  "eslint": "8.56.0",
  "typescript": "5.3.3"
}
```

**Total Size:** ~300MB (node_modules)

---

## ✅ Verification

After installation, verify everything works:

### 1. Check Dependencies
```bash
npm list --depth=0
```

Should show all packages without errors.

### 2. Check TypeScript
```bash
npm run type-check
```

Should complete without errors.

### 3. Check Database Connection

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Try to sign up
```

If signup works → database is connected! ✅

### 4. Check Build
```bash
npm run build
```

Should build successfully for production.

---

## 🔧 Troubleshooting

### "Cannot find module 'inquirer'"

```bash
npm install inquirer open pg
```

### "Node version not supported"

```bash
# Check version
node -v

# Install 18+ via nvm
nvm install 18
nvm use 18
```

### "Git not found"

**macOS:**
```bash
brew install git
```

**Windows:**
Download from [git-scm.com](https://git-scm.com/download/win)

**Linux:**
```bash
sudo apt-get install git
```

### "Permission denied"

**macOS/Linux:**
```bash
sudo chmod +x scripts/setup-wizard.js
```

### "Database connection failed"

1. Check password in connection string
2. Wait 2 minutes for Supabase to fully start
3. Try manual SQL migration

---

## 🎯 Next Steps

After successful installation:

### 1. Start Development
```bash
npm run dev
```

### 2. Create Account
- Go to http://localhost:3000
- Sign up
- Explore dashboard

### 3. Read Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - How it works
- [FEATURES.md](./FEATURES.md) - What to build next
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production

### 4. Deploy to Vercel
```bash
# Push to GitHub (if not done by wizard)
git push origin main

# Import in Vercel
# vercel.com/new
```

---

## 📊 Installation Comparison

| Method | Time | Difficulty | Automation |
|--------|------|------------|------------|
| **Setup Wizard** | 5 min | Easy | Full |
| **Manual** | 15 min | Medium | None |
| **Docker** | 10 min | Hard | Partial |

---

## 💡 Tips

### For Teams
- Everyone runs `npm run setup` individually
- Share Supabase credentials via secure channel
- Each developer gets their own `.env.local`

### For Production
- Use separate Supabase project for production
- Never commit `.env.local` to Git
- Use Vercel environment variables

### For Development
- Use `npm run dev` for hot reload
- Check `npm run type-check` often
- Run `npm run lint` before commits

---

## 🎉 Installation Complete!

You now have:
- ✅ All dependencies installed
- ✅ Supabase configured
- ✅ Database with tables
- ✅ Environment variables set
- ✅ Ready to develop!

**Start coding:**
```bash
npm run dev
```

**Happy coding! 🎨💅✨**

---

**Need help?** Check [SETUP_WIZARD.md](./SETUP_WIZARD.md) or [SETUP.md](./SETUP.md)
