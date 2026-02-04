#!/bin/bash
set -e

echo "🔧 Adding Supabase env vars to Vercel..."

# URL
echo "https://ndrqxlawxvfnloyzrpyo.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --yes 2>&1 || echo "URL already exists or error"

# KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDY1MDQsImV4cCI6MjA4NTcyMjUwNH0.27eDH-gQE6KtcFIq6RVYHQJUPKOpMe3UQiCMIu_t1Zg" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes 2>&1 || echo "KEY already exists or error"

echo ""
echo "✅ Variables added! Now redeploying..."
npx vercel --prod --yes
