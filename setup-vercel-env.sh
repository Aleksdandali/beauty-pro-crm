#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# Read values from .env.local
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)

echo "📋 Found variables:"
echo "  NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL:0:30}..."
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_KEY:0:30}..."
echo ""

# Link to Vercel project (if not already linked)
echo "🔗 Linking to Vercel project..."
npx vercel link --yes || true

echo ""
echo "✅ Now add the variables manually:"
echo ""
echo "1️⃣ Run: npx vercel env add NEXT_PUBLIC_SUPABASE_URL production"
echo "   Paste: $SUPABASE_URL"
echo ""
echo "2️⃣ Run: npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
echo "   Paste: $SUPABASE_KEY"
echo ""
echo "3️⃣ Redeploy: npx vercel --prod"
echo ""
