# Replit Setup Guide - MAX Facility Operations

Complete guide to deploy your ice rink management app on Replit.

## Why Replit?

✅ No local installation needed
✅ Automatic hosting and deployment
✅ Built-in code editor
✅ Free tier available
✅ Easy environment variable management
✅ Automatic HTTPS

## Prerequisites

Before starting, you need:
- [ ] GitHub account
- [ ] Supabase account (free tier)
- [ ] Supabase project created (you already have this!)

## Part 1: Prepare in Current Environment (Do This First)

### Step 1: Get Your Supabase Credentials

1. Open your Supabase project at https://supabase.com
2. Go to **Settings** → **API**
3. Copy and save these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

### Step 2: Set Up Supabase Database

1. In Supabase, go to **SQL Editor**
2. Click **New query**
3. Copy the contents of `supabase/schema.sql` from this project
4. Paste into SQL Editor and click **Run**
5. Verify in **Table Editor** - you should see 5 tables:
   - profiles
   - ice_depth_templates
   - ice_depth_measurements
   - daily_report_templates
   - daily_reports

### Step 3: Create Admin User

Run this in Supabase SQL Editor (change email and password!):

```sql
-- Create admin user
-- IMPORTANT: Change the email and password!
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'admin@yourfacility.com',  -- CHANGE THIS
  crypt('YourSecurePassword123!', gen_salt('bf')),  -- CHANGE THIS
  NOW(),
  '{"full_name": "Admin User"}',
  NOW(),
  NOW()
);

-- Set user role to admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@yourfacility.com';  -- Match email above
```

### Step 4: Push Code to GitHub

The code needs to be on GitHub for Replit to import it.

```bash
# Check current status
git status

# Add all files
git add -A

# Commit
git commit -m "Prepare for Replit deployment"

# Push to your branch
git push -u origin claude/ice-rink-app-HNN1R
```

## Part 2: Set Up in Replit

### Step 1: Import from GitHub

1. Go to https://replit.com
2. Sign up or login (use GitHub to sign in)
3. Click **Create Repl**
4. Select **Import from GitHub**
5. Authorize Replit to access your repositories
6. Select repository: `KellyJ386/Florida-MFO`
7. Select branch: `claude/ice-rink-app-HNN1R`
8. Click **Import from GitHub**

### Step 2: Configure Environment Variables

In Replit, click the **Secrets** tool (🔒 icon in left sidebar):

Add these three secrets:

**Secret 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: Your Supabase URL (e.g., `https://xxxxx.supabase.co`)

**Secret 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Your Supabase anon key (long string starting with `eyJ...`)

**Secret 3:**
- Key: `NEXT_PUBLIC_APP_URL`
- Value: Will be auto-set by Replit, or use `https://${REPL_SLUG}.${REPL_OWNER}.repl.co`

### Step 3: Start the Application

1. Replit should auto-detect the Next.js project
2. Click the **Run** button at the top
3. Wait for installation (first time takes 2-3 minutes)
4. You should see:
   ```
   ▲ Next.js 14.x.x
   - Local:    http://localhost:3000
   - Ready in X seconds
   ```
5. The app will open in the Replit webview on the right

### Step 4: Test Your App

1. **Open the app** - Click the URL in the webview or the "Open in new tab" button
2. **Navigate to login**: Add `/auth/login` to the URL
3. **Login** with the admin credentials you created in Part 1, Step 3
4. **You should see** the home dashboard!

### Step 5: Quick Feature Test

Test that everything works:

1. **Create Ice Depth Template**:
   - Go to Ice Depth → Templates
   - Click New Template
   - Name it "Main Rink"
   - Click on diagram to add points
   - Save

2. **Create Daily Report Template**:
   - Go to Admin → Daily Report Templates
   - Click New Template
   - Add some tabs and fields
   - Save

3. **Record a Test Measurement**:
   - Go to Ice Depth → Measure
   - Select your template
   - Enter some measurements
   - Save

## Part 3: Make Your Repl Public (Optional)

### For Team Access

1. Click **Share** button in top-right
2. Choose sharing option:
   - **Private**: Only you can access
   - **Public**: Anyone with link can view
   - **Team**: Add specific Replit users

### For Production Deployment

1. Click **Deploy** button
2. Choose **Autoscale deployment** for production
3. Configure custom domain (optional)
4. Replit will handle HTTPS and scaling

## Replit-Specific Features

### Always-On (Paid Feature)

By default, Repls sleep after inactivity. For production:
- Upgrade to Replit Core ($7/month)
- Enable "Always On" for your Repl
- App stays running 24/7

### Custom Domain

1. Go to Deploy settings
2. Click "Link domain"
3. Add your domain (e.g., `icerink.yourfacility.com`)
4. Update DNS records as instructed
5. HTTPS auto-configured

### Database Connection

Supabase works perfectly with Replit:
- ✅ Connection pooling built-in
- ✅ No firewall issues
- ✅ Global CDN for fast access
- ✅ Automatic SSL

## Troubleshooting

### "Failed to fetch" Error

**Problem**: Can't connect to Supabase

**Solution**:
1. Check Secrets are set correctly in Replit
2. Verify no trailing slash in Supabase URL
3. Restart the Repl

### "Invalid login credentials"

**Problem**: Can't login with admin account

**Solution**:
1. Verify admin user created in Supabase Auth → Users
2. Check email/password match what you set in SQL
3. Confirm profile has `role = 'admin'` in profiles table

### Build Errors

**Problem**: Repl won't start or build fails

**Solution**:
1. Check the Console tab for error messages
2. Click **Shell** and run: `npm install`
3. Clear cache: `rm -rf .next node_modules`
4. Re-run

### "Module not found" Errors

**Problem**: TypeScript can't find modules

**Solution**:
1. Restart the Repl
2. Run in Shell: `npm install`
3. Wait for install to complete fully

## File Structure in Replit

```
Florida-MFO/
├── .replit           ← Replit configuration (auto-created)
├── replit.nix        ← Environment setup (auto-created)
├── .env.local        ← NOT USED (use Secrets instead)
├── app/              ← Your Next.js app
├── components/       ← React components
├── lib/              ← Utilities and services
├── public/           ← Static assets
└── supabase/         ← Database schema
```

## Cost Breakdown

### Free Tier (Good for Testing)
- Replit Starter: **Free**
- Supabase Free: **Free**
- **Total: $0/month**

Limitations:
- Repl sleeps after 1 hour of inactivity
- 500MB storage
- Shared resources

### Production Ready
- Replit Core: **$7/month** (Always On + more resources)
- Supabase Pro: **$25/month** (Better performance + support)
- **Total: $32/month**

Benefits:
- 24/7 uptime
- Better performance
- Database backups
- Priority support

## Next Steps After Setup

### 1. Customize Templates

Create your actual rink templates:
- Ice Depth → Templates → New Template
- Upload your rink SVG or use default
- Add all measurement points

### 2. Create Users

Add your staff:
- Admin → Users
- Assign roles (Admin/Manager/Staff)
- They can login and start using the app

### 3. Configure Daily Reports

Set up your daily report template:
- Admin → Daily Report Templates
- Add tabs for your facility's needs
- Include all required fields

### 4. Go Live!

Start using it:
- Take daily ice depth measurements
- Submit daily reports
- Upload photos
- Export PDFs

## Support Resources

- **Replit Docs**: https://docs.replit.com
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **This Project**: See README.md for feature details

## Quick Reference: Important URLs

Save these for quick access:

```
Replit App: https://[your-repl-name].[your-username].repl.co
Supabase Dashboard: https://supabase.com/dashboard/project/[project-id]
GitHub Repo: https://github.com/KellyJ386/Florida-MFO

Login Page: [Replit-URL]/auth/login
Admin Panel: [Replit-URL]/admin
```

---

## Ready to Deploy?

Complete this checklist:

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Admin user created
- [ ] Code pushed to GitHub
- [ ] Replit account created
- [ ] Project imported to Replit
- [ ] Environment secrets configured
- [ ] App running in Replit
- [ ] Successfully logged in
- [ ] Created test template

**All checked?** You're ready to use your ice rink management app! 🎉
