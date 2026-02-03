# Beauty Pro CRM - Quick Start Guide

Get your Beauty Pro CRM running in **5 minutes** with our automated setup wizard!

## 🚀 Super Fast Setup (Recommended)

**New!** Use our interactive setup wizard for automatic configuration:

```bash
# 1. Install dependencies
npm install

# 2. Run the setup wizard
npm run setup
```

That's it! The wizard will guide you through everything. 🎉

**[Full Setup Wizard Guide →](./SETUP_WIZARD.md)**

---

## 📖 Manual Setup (Alternative)

If you prefer manual setup or the wizard doesn't work:

### Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- A Supabase account (free tier works)

### Step 1: Install Dependencies (2 min)

Open terminal in the project folder and run:

```bash
npm install
```

Wait for all packages to install.

## Step 2: Create Supabase Project (3 min)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Enter project details:
   - Name: `beauty-pro-crm`
   - Password: Create a strong password (save it!)
   - Region: Choose closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes for setup to complete

## Step 3: Configure Environment (1 min)

1. In Supabase dashboard → **Settings** → **API**
2. Copy these values:
   - **URL** (under Project URL)
   - **anon public** key
3. In your project, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and paste your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

## Step 4: Setup Database (2 min)

1. In Supabase dashboard → **SQL Editor**
2. Click **"New Query"**
3. Open `supabase/migrations/001_initial_schema.sql` in your code editor
4. Copy ALL content and paste into SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for "Success. No rows returned" message

Done! Your database is ready.

## Step 5: Run the App (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Create Your Account (1 min)

1. Click **"Зареєструватися"** (Sign Up)
2. Fill in:
   - **Salon Name**: Your business name
   - **Email**: Your email
   - **Password**: At least 6 characters
3. Click **"Sign Up"**

You're in! 🎉

## What's Next?

### Explore the Dashboard
- Check out today's appointments (mock data for now)
- View client statistics
- Browse through different sections

### Add Real Data
Start by creating:
1. **Services** → Add your salon services
2. **Staff** → Add your team members
3. **Clients** → Add your first client
4. **Appointments** → Book your first appointment

### Customize Settings
Go to **Settings** to configure:
- Salon information
- Language preference
- Currency

## Common Issues

### "Can't sign up"
- **Check**: Email confirmation is disabled in Supabase
  - Go to: Authentication → Providers → Email
  - Toggle OFF "Confirm email"

### "No data showing"
- **Check**: Browser console for errors (F12)
- **Check**: Database migration ran successfully
- **Try**: Sign out and sign in again

### "Connection error"
- **Check**: `.env` file has correct Supabase URL and keys
- **Check**: Internet connection
- **Try**: Restart dev server

## Quick Tips

### 🎨 Ultra-Minimalist Design
The app uses a clean black/white/zinc color scheme for a professional look.

### 📱 Mobile-First
Everything works perfectly on mobile - try resizing your browser!

### 🌐 Multi-Language
Switch between Ukrainian and English in Settings → Language

### 🔒 Secure by Default
All data is isolated per salon. Your data is yours only.

## Need Help?

Check these files:
- `README.md` - Project overview
- `SETUP.md` - Detailed setup instructions
- `ARCHITECTURE.md` - Technical documentation
- `FEATURES.md` - Current & planned features

## Development Workflow

### Making Changes
1. Edit files in `src/`
2. Browser auto-refreshes
3. Check for TypeScript errors

### Project Structure
```
src/
├── app/[locale]/         → Pages
├── components/           → UI components
├── lib/                  → Utilities & hooks
└── messages/             → Translations
```

### Adding a New Page
1. Create `src/app/[locale]/(dashboard)/newpage/page.tsx`
2. Add navigation link in `src/components/features/sidebar.tsx`
3. Add translations in `src/messages/uk.json` and `en.json`

## Deployment (When Ready)

### Deploy to Vercel
1. Push code to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

**That's it! You're ready to manage your salon like a pro!** 💅✨
