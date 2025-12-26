# Setup Guide - Getting the App Running

## Step 1: Supabase Setup (15 minutes)

### Create Supabase Project
1. Go to https://supabase.com
2. Sign up/login
3. Create new project
   - Project name: "MAX Facility Operations"
   - Database password: (save this securely)
   - Region: Choose closest to you

### Run Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Create new query
3. Copy entire contents of `supabase/schema.sql`
4. Run the query
5. Verify tables created in Table Editor

### Get API Credentials
1. Go to Project Settings → API
2. Copy these values:
   - Project URL
   - anon/public key

### Create Environment File
```bash
# In project root, create .env.local
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Install Dependencies (5 minutes)

```bash
# Install all packages
npm install

# Verify installation
npm list --depth=0
```

## Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Create First Admin User

### Option A: Via Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add user"
3. Email: your-email@example.com
4. Password: (your secure password)
5. Email Confirm: ON (skip email verification)

### Option B: Via SQL
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('your-password-here', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}',
  now(),
  now()
);
```

### Set User as Admin
```sql
-- Update the profile to admin role
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

## Step 5: Test Basic Flow

### 5.1 Login
- Go to http://localhost:3000/auth/login
- Login with your admin credentials
- Should redirect to home page

### 5.2 Create Ice Depth Template
- Click "Ice Depth" → "Templates"
- Click "New Template"
- Name: "Main Rink"
- SVG will auto-populate with default
- Click diagram to add measurement points
- Save template

### 5.3 Create Daily Report Template
- Click "Admin" → "Daily Report Templates"
- Click "New Template"
- Default template will load
- Modify tabs/fields as needed
- Save template

### 5.4 Record Measurement
- Go to "Ice Depth" → "New Measurement"
- Select template
- Enter measurements for each point
- Add notes
- Save

### 5.5 Create Daily Report
- Go to "Daily Reports" → "New Report"
- Select date and shift
- Fill in form fields
- Upload photos (optional)
- Submit

## Troubleshooting

### "Failed to load" errors
- Check .env.local has correct Supabase credentials
- Verify database schema ran successfully
- Check browser console for specific errors

### Authentication issues
- Verify user exists in Supabase Auth
- Check email is confirmed
- Verify profile created with correct role

### Photos not uploading
- Verify storage bucket created (check schema)
- Check storage policies in Supabase

### "Not authorized" errors
- Check user role in profiles table
- Verify RLS policies applied correctly

## Next: Customize & Deploy

Once running locally, proceed to:
1. Add your own rink SVG diagrams
2. Customize report templates for your needs
3. Test all workflows
4. Deploy to production (see DEPLOYMENT.md)
