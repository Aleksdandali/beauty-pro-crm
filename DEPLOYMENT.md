# Beauty Pro CRM - Deployment Guide

Complete guide for deploying your Beauty Pro CRM to production.

## Prerequisites

Before deploying, ensure:
- ✅ All features are tested locally
- ✅ Database schema is finalized
- ✅ Environment variables are documented
- ✅ Code is pushed to GitHub/GitLab

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Best for:** Next.js apps, automatic deployments, global CDN

#### Step 1: Prepare Your Repository

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Beauty Pro CRM"
   git branch -M main
   git remote add origin https://github.com/yourusername/beauty-pro-crm.git
   git push -u origin main
   ```

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

#### Step 3: Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important:** Use your **production** Supabase project credentials!

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait ~2 minutes for build
3. Your app is live! 🎉

#### Step 5: Custom Domain (Optional)

1. In Vercel → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

### Option 2: Netlify

**Best for:** Alternative to Vercel, similar features

1. Push code to GitHub
2. Import in Netlify
3. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables (same as above)
5. Deploy

### Option 3: Self-Hosted (Docker)

**Best for:** Full control, private infrastructure

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
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

#### Deploy Commands
```bash
# Build image
docker build -t beauty-pro-crm .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-key \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  beauty-pro-crm
```

## Production Supabase Setup

### Create Production Database

1. Create new Supabase project for production
2. Go to SQL Editor
3. Run the migration: `supabase/migrations/001_initial_schema.sql`
4. Verify all tables and policies are created

### Configure Authentication

1. In Supabase → Authentication → Providers
2. Configure email provider:
   - **Enable email provider**: ON
   - **Confirm email**: ON (recommended for production)
   - **Email templates**: Customize (optional)

3. Site URL configuration:
   - Go to: Authentication → URL Configuration
   - Set **Site URL**: `https://your-production-domain.com`
   - Add **Redirect URLs**: `https://your-production-domain.com/**`

### Database Backups

1. Enable automatic backups:
   - Settings → Database → Backups
   - Configure daily backups
   - Set retention period

2. Manual backup (optional):
   ```bash
   # Using Supabase CLI
   supabase db dump > backup.sql
   ```

## Post-Deployment Checklist

### ✅ Functionality Testing

1. **Authentication Flow**
   - [ ] Sign up works
   - [ ] Email confirmation (if enabled)
   - [ ] Sign in works
   - [ ] Sign out works
   - [ ] Session persistence

2. **Core Features**
   - [ ] Dashboard loads
   - [ ] Navigate all pages
   - [ ] Data displays correctly
   - [ ] Language switching works
   - [ ] Mobile responsive

3. **Multi-Tenant Isolation**
   - [ ] Create two test salons
   - [ ] Verify data isolation
   - [ ] Check RLS policies work

### ✅ Performance

1. **Lighthouse Audit**
   - [ ] Performance: >90
   - [ ] Accessibility: >90
   - [ ] Best Practices: >90
   - [ ] SEO: >90

2. **Load Testing**
   - [ ] Test with multiple concurrent users
   - [ ] Monitor response times
   - [ ] Check database query performance

### ✅ Security

1. **Environment Variables**
   - [ ] All secrets are hidden
   - [ ] No `.env` file in repository
   - [ ] Service role key is secure

2. **RLS Policies**
   - [ ] Test cross-tenant access (should fail)
   - [ ] Verify role permissions
   - [ ] Check all CRUD operations

3. **Headers & CORS**
   - [ ] HTTPS only
   - [ ] Security headers set
   - [ ] CORS configured correctly

## Monitoring & Analytics

### Error Tracking (Recommended)

**Sentry Setup:**

1. Install Sentry:
   ```bash
   npm install @sentry/nextjs
   ```

2. Initialize:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. Configure error boundaries
4. Test error reporting

### Analytics

**Vercel Analytics (Free):**

1. Install:
   ```bash
   npm install @vercel/analytics
   ```

2. Add to `src/app/layout.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout() {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

**Google Analytics (Optional):**

1. Create GA4 property
2. Add tracking ID to environment variables
3. Implement tracking in layout

## Maintenance

### Database Migrations

When you need to update the schema:

1. Create new migration file:
   ```sql
   -- supabase/migrations/002_add_feature.sql
   ALTER TABLE clients ADD COLUMN tags TEXT[];
   ```

2. Run in production:
   - Go to Supabase SQL Editor
   - Run the migration
   - Verify in production

3. Test thoroughly in development first!

### Backups

**Automated:**
- Supabase handles daily backups
- Point-in-time recovery available

**Manual:**
```bash
# Export data
supabase db dump --data-only > data-backup.sql

# Export schema only
supabase db dump --schema-only > schema-backup.sql
```

### Updates

**Regular Updates:**
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test locally
npm run dev

# Deploy
git push
```

## Scaling Considerations

### When to Scale

Monitor these metrics:
- **Response time**: >1s consistently
- **Database connections**: Near limit
- **Memory usage**: >80%
- **Error rate**: Increasing

### Scaling Options

1. **Vercel**
   - Automatic scaling
   - Pay per execution
   - No configuration needed

2. **Supabase**
   - Upgrade plan for more connections
   - Add read replicas
   - Enable connection pooling

3. **Caching**
   - Implement Redis for sessions
   - Cache frequently accessed data
   - Use CDN for static assets

## Troubleshooting

### Common Issues

**Issue: Environment variables not working**
- Solution: Restart Vercel/Netlify deployment
- Redeploy after adding variables

**Issue: Database connection errors**
- Solution: Check Supabase project status
- Verify connection strings
- Check connection pool limits

**Issue: RLS policies blocking queries**
- Solution: Verify user authentication
- Check staff table entries
- Review policy logic in Supabase

**Issue: Slow page loads**
- Solution: Enable caching
- Optimize database queries
- Add database indexes

### Logs & Debugging

**Vercel:**
- View logs: Dashboard → Deployments → Logs
- Real-time logs: `vercel logs`

**Supabase:**
- Database logs: Dashboard → Database → Logs
- Auth logs: Authentication → Logs

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Enable HTTPS only** - Automatic on Vercel
3. **Use RLS policies** - Already implemented
4. **Validate all inputs** - Client and server side
5. **Keep dependencies updated** - Weekly checks
6. **Monitor for vulnerabilities** - `npm audit`
7. **Rate limiting** - Implement for API routes
8. **CORS configuration** - Restrict origins

## Cost Optimization

### Free Tiers

**Vercel:**
- 100GB bandwidth/month
- Unlimited deployments
- Serverless functions

**Supabase:**
- 500MB database
- 2GB file storage
- 50,000 monthly active users

### When You'll Need to Pay

- Vercel: >100GB bandwidth or custom domain
- Supabase: >500MB database or >50K users

### Cost Reduction Tips

1. Optimize images (use Next.js Image)
2. Implement caching
3. Reduce database queries
4. Use serverless wisely

## Rollback Plan

### If Something Goes Wrong

**Vercel:**
1. Go to Deployments
2. Find last working deployment
3. Click "Promote to Production"

**Database:**
1. Go to Supabase → Database → Backups
2. Restore from backup
3. Verify data integrity

## Support Contacts

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Next.js Docs**: https://nextjs.org/docs

## Final Checklist

Before going live:

- [ ] All environment variables set
- [ ] Production database configured
- [ ] RLS policies tested
- [ ] Authentication flows verified
- [ ] Mobile responsive checked
- [ ] Performance optimized
- [ ] Error tracking configured
- [ ] Backups enabled
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring setup
- [ ] Documentation updated
- [ ] Team trained on admin panel
- [ ] Support plan in place

---

**Your CRM is production-ready! 🚀**

Questions? Check other documentation files or open an issue.
