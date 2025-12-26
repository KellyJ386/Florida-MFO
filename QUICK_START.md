# Quick Start Guide - Get Running in 15 Minutes

## Checklist

### 1. Supabase Setup (5 min)
- [ ] Go to https://supabase.com and sign up
- [ ] Create new project "MAX Facility Operations"
- [ ] Save database password
- [ ] Copy Project URL and anon key from Settings → API

### 2. Configure App (2 min)
- [ ] Edit `.env.local` file
- [ ] Paste your Supabase URL
- [ ] Paste your anon key
- [ ] Save file

### 3. Database Setup (3 min)
- [ ] Open Supabase SQL Editor
- [ ] Copy all content from `supabase/schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify tables created in Table Editor

### 4. Create Admin User (2 min)
- [ ] Run the admin user SQL query (see SETUP_GUIDE.md)
- [ ] Change email and password to your own
- [ ] Verify user created in Auth → Users

### 5. Start App (1 min)
```bash
./start.sh
# or
npm install && npm run dev
```

### 6. Test It! (2 min)
- [ ] Open http://localhost:3000
- [ ] Go to http://localhost:3000/auth/login
- [ ] Login with your credentials
- [ ] See the home page
- [ ] Click around!

## Common Issues

**"Failed to fetch" error:**
- Check `.env.local` has correct Supabase URL
- Verify URL doesn't have trailing slash

**"Invalid login" error:**
- Verify admin user created in Supabase Auth
- Check you're using correct email/password
- Make sure profile has admin role

**"Not authorized" errors:**
- Check user role in profiles table
- Should be `'admin'` not `'staff'`

**Database errors:**
- Verify schema.sql ran successfully
- Check all tables exist in Table Editor
- Look for error messages in SQL Editor

## Next Steps After Setup

1. **Create your first ice depth template**
   - Go to Ice Depth → Templates
   - Click New Template
   - Add measurement points

2. **Create a daily report template**
   - Go to Admin → Daily Report Templates
   - Customize tabs and fields

3. **Take it for a spin!**
   - Record some test measurements
   - Submit a daily report
   - Explore the features

## File Structure

```
Florida-MFO/
├── .env.local          ← YOUR CREDENTIALS GO HERE
├── supabase/
│   └── schema.sql      ← RUN THIS IN SUPABASE
├── SETUP_GUIDE.md      ← Detailed setup instructions
├── TESTING_CHECKLIST.md ← What to test
├── DEPLOYMENT.md       ← How to deploy
└── start.sh            ← Quick start script
```

## Support

See detailed guides:
- **Setup Issues**: SETUP_GUIDE.md
- **Testing**: TESTING_CHECKLIST.md
- **Deployment**: DEPLOYMENT.md
- **Features**: README.md
- **Completion Status**: COMPLETION_SUMMARY.md

## Credentials Template

Save these somewhere safe:

```
Supabase Project Name: MAX Facility Operations
Supabase URL: _________________________
Supabase Anon Key: ____________________
Database Password: ____________________

Admin Email: __________________________
Admin Password: _______________________
```

---

**Ready to go? Just:**
1. Set up Supabase (15 min)
2. Run `./start.sh`
3. Login at http://localhost:3000/auth/login
4. Start managing your ice rink! 🎉
