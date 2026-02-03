# 🚀 RUN THIS FIRST!

**Welcome to Beauty Pro CRM!**

---

## ⚡ Quick Start (5 Minutes)

```bash
# Step 1: Install dependencies
npm install

# Step 2: Run the setup wizard
npm run setup
```

**That's it!** 🎉

The setup wizard will guide you through:
- ✅ Supabase configuration
- ✅ GitHub repository creation
- ✅ Database migration
- ✅ Environment setup

---

## 📺 What Will Happen

### The wizard will:

1. **Ask questions** (Project ID, API keys, etc.)
2. **Open pages in your browser** (Supabase, GitHub, Vercel)
3. **Automatically execute:**
   - Database setup
   - Git operations (init, commit, push)
   - File creation (.env.local)

### You just need to:
- Answer questions
- Copy-paste values from browser
- Confirm actions

**Time required: 5 minutes**

---

## 🎯 Before You Start

### Have Ready:
1. ✅ Supabase account (free at [supabase.com](https://supabase.com))
2. ✅ GitHub account (free at [github.com](https://github.com))
3. ✅ Vercel account (free at [vercel.com](https://vercel.com))

### System Requirements:
- ✅ Node.js 18+ ([download](https://nodejs.org/))
- ✅ Git ([download](https://git-scm.com/))

---

## 🕹️ Run Setup Wizard

```bash
npm run setup
```

**Follow the instructions in your terminal!**

---

## 📖 Need Help?

### Full guides:
- **[SETUP_WIZARD.md](./SETUP_WIZARD.md)** - Complete wizard guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Manual setup (alternative)
- **[INSTALL.md](./INSTALL.md)** - Installation methods

### Troubleshooting:
- Check [SETUP_WIZARD.md](./SETUP_WIZARD.md#-решение-проблем)
- Check [SETUP.md](./SETUP.md#troubleshooting)

---

## ✅ After Setup

### 1. Start Development
```bash
npm run dev
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Sign Up
- Create your account
- Your salon is created automatically
- Start using the CRM!

---

## 🎨 Project Structure

```
Shine_crm_final/
├── 📚 Documentation
│   ├── RUN_THIS_FIRST.md    ← You are here
│   ├── SETUP_WIZARD.md       ← Wizard guide
│   ├── START_HERE.md         ← Next steps
│   └── ...
├── 🕹️ scripts/
│   └── setup-wizard.js       ← Magic happens here
├── 💻 src/                   ← Your code
└── 🗄️ supabase/              ← Database
```

---

## 🚨 Important Notes

### ⚠️ Never commit `.env.local`
It contains secrets! It's already in `.gitignore`.

### ⚠️ Save your database password
You'll need it for the connection string.

### ⚠️ Use HTTPS URL for GitHub
Format: `https://github.com/username/repo.git`

---

## 🎉 Let's Go!

```bash
npm install && npm run setup
```

**See you in the dashboard! 💅✨**

---

**Questions?** Read [SETUP_WIZARD.md](./SETUP_WIZARD.md)

**Problems?** Check [Troubleshooting](./SETUP_WIZARD.md#-решение-проблем)

**Ready?** Run `npm run setup` now! 🚀
