# Deployment Guide

## Recommended Platform: Vercel

Vercel is the easiest option for Next.js apps and has a generous free tier.

## Prerequisites

- [ ] Supabase project created and configured
- [ ] App tested locally and working
- [ ] Environment variables documented
- [ ] Database schema applied to production Supabase

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Repository
```bash
# Ensure all changes committed
git status
git add -A
git commit -m "Prepare for deployment"
git push
```

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access repositories

### Step 3: Import Project
1. Click "Add New Project"
2. Import from GitHub
3. Select `Florida-MFO` repository
4. Select branch: `claude/ice-rink-app-HNN1R`

### Step 4: Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Root Directory**: `./`

### Step 5: Add Environment Variables
In Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 6: Deploy
1. Click "Deploy"
2. Wait for build (2-3 minutes)
3. Get deployment URL
4. Test the deployed app

### Step 7: Configure Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

## Option 2: Deploy to Netlify

### Step 1: Create Netlify Account
1. Go to https://netlify.com
2. Sign up with GitHub

### Step 2: New Site from Git
1. Click "Add new site"
2. Connect to GitHub
3. Select repository
4. Select branch

### Step 3: Build Settings
```
Build command: npm run build
Publish directory: .next
```

### Step 4: Environment Variables
Add in Site settings → Environment:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

### Step 5: Deploy
Click "Deploy site"

## Option 3: Self-Hosted (Docker)

### Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped
```

### Deploy
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

## Post-Deployment Checklist

### Verify Functionality
- [ ] Can access app at production URL
- [ ] Login works
- [ ] Can create templates
- [ ] Can record measurements
- [ ] Can submit reports
- [ ] Photos upload correctly
- [ ] PDF export works
- [ ] All pages load
- [ ] No console errors

### Security Checks
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] RLS policies active in Supabase
- [ ] No API keys in client code
- [ ] CORS configured correctly

### Performance
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Fast page loads
- [ ] Service worker caching works

### Monitoring Setup
- [ ] Error tracking (Sentry recommended)
- [ ] Analytics (Vercel Analytics or Google Analytics)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database backups configured

## Production Supabase Configuration

### Enable Production Features
1. **Email Templates**
   - Customize auth emails
   - Add branding

2. **Database Backups**
   - Enable automatic backups
   - Set retention period

3. **Monitoring**
   - Enable database logs
   - Set up alerts

4. **Rate Limiting**
   - Configure rate limits
   - Prevent abuse

### Create Production Buckets
```sql
-- If not done in schema
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', false);
```

## Rollback Plan

If deployment fails:

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Manual Rollback
```bash
git revert HEAD
git push
# Trigger new deployment
```

## Common Issues

### Build Fails
- Check all dependencies installed
- Verify TypeScript compiles locally
- Check environment variables set

### Runtime Errors
- Check Supabase URL correct
- Verify RLS policies applied
- Check environment variables

### Photos Not Working
- Verify storage bucket exists
- Check storage policies
- Confirm correct bucket name in code

## Support & Maintenance

### Regular Tasks
- Monitor error logs weekly
- Review database usage monthly
- Update dependencies monthly
- Backup database weekly
- Review security quarterly

### Scaling Considerations
- Vercel auto-scales
- Supabase has usage limits (upgrade if needed)
- Monitor costs
- Optimize queries if slow

## Emergency Contacts

Keep these handy:
- Supabase support: support@supabase.io
- Vercel support: vercel.com/support
- Database admin contact
- App administrator contact

---

## Quick Deploy Commands

```bash
# Update and deploy
git add -A
git commit -m "Production update"
git push

# Vercel will auto-deploy from push
# Or manually trigger:
vercel --prod
```
