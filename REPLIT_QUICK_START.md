# Replit Quick Start - 5 Steps to Live App

## Before Replit: Supabase Setup (10 minutes)

### 1. Get Supabase Credentials
- Go to https://supabase.com → Your Project
- Settings → API
- Copy **URL** and **anon key**
- Save them somewhere safe!

### 2. Run Database Schema
- In Supabase: SQL Editor → New query
- Copy ALL content from `supabase/schema.sql`
- Paste and Run
- Check Table Editor: should see 5 tables ✓

### 3. Create Admin User
```sql
-- Change email and password!
INSERT INTO auth.users (
  id, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'your-email@example.com',  -- CHANGE
  crypt('YourPassword123!', gen_salt('bf')),  -- CHANGE
  NOW(), '{"full_name": "Admin"}', NOW(), NOW()
);

UPDATE profiles SET role = 'admin'
WHERE email = 'your-email@example.com';  -- CHANGE
```

## In Replit: Deploy (5 minutes)

### 4. Import to Replit
1. https://replit.com → Create Repl
2. Import from GitHub
3. Select: `KellyJ386/Florida-MFO`
4. Branch: `claude/ice-rink-app-HNN1R`
5. Click Import

### 5. Add Secrets & Run
1. Click **Secrets** 🔒 (left sidebar)
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
3. Click **Run** button
4. Wait 2-3 minutes for first build
5. Open app in new tab → Add `/auth/login`
6. Login with your admin credentials

## Done! 🎉

Your app is live at: `https://[repl-name].[username].repl.co`

## Quick Test Checklist
- [ ] Can login
- [ ] Create ice depth template (Ice Depth → Templates)
- [ ] Add measurement points to template
- [ ] Create daily report template (Admin → Templates)
- [ ] Record a test measurement
- [ ] Upload a photo to daily report

## Need Help?
See `REPLIT_SETUP.md` for detailed troubleshooting.

## Production Tips
- Enable "Always On" in Replit ($7/mo) for 24/7 availability
- Upgrade Supabase for better performance
- Add custom domain in Deploy settings
