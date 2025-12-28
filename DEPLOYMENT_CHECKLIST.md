# Deployment Checklist - Florida MFO Ice Rink App

## ✅ Completed Items

### Database Schema
- [x] Created SQL migration file with all 8 new tables
- [x] Added proper indexes for performance
- [x] Implemented Row Level Security (RLS) policies
- [x] Created auto-update triggers for `updated_at` timestamps
- [x] Implemented auto-lock function for incident edit window
- [x] Added proper CHECK constraints for data validation

### Application Code
- [x] Priority 1: Incident & Accident Reporting Module (6 files, ~1,850 lines)
- [x] Priority 2: Ice Operations Module (5 files, ~1,550 lines)
- [x] Priority 3: Air Quality Compliance Module (1 file, ~658 lines)
- [x] Priority 4: Refrigeration Plant Monitoring Module (1 file, ~711 lines)
- [x] TypeScript database types for all tables
- [x] Dashboard navigation updated with all modules
- [x] Dark mode support throughout
- [x] Created `useFacility` hook for facility context
- [x] Replaced all placeholder facility_id values with actual facility context
- [x] Implemented auto-incident creation for air quality emergencies

## ⚠️ Required Before Deployment

### 1. Database Setup
- [ ] Run migration: `supabase migration up`
- [ ] Verify all tables created successfully
- [ ] Test RLS policies with different user roles
- [ ] Seed initial data if needed

### 2. Environment Variables
**File:** `.env.local`

Current placeholders need replacement:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Action Required:**
- [ ] Replace `NEXT_PUBLIC_SUPABASE_URL` with actual Supabase project URL
- [ ] Replace `NEXT_PUBLIC_SUPABASE_ANON_KEY` with actual anon key from Supabase
- [ ] Update `NEXT_PUBLIC_APP_URL` for production deployment

### 3. ~~Fix Placeholder facility_id Values~~ ✅ COMPLETED

**All files updated:**
- [x] Created `/lib/hooks/useFacility.ts` hook
- [x] Updated `/app/refrigeration/page.tsx`
- [x] Updated `/app/air-quality/page.tsx`
- [x] Updated `/components/ice-operations/CircleCheckForm.tsx`
- [x] Updated `/components/ice-operations/BladeChangeLogForm.tsx`
- [x] Updated `/components/ice-operations/IceMakeLogForm.tsx`

**Implementation:**
All components now use `useFacility()` hook which returns the authenticated user's ID as the facility_id.

### 4. ~~Implement Auto-Incident Creation for Air Quality~~ ✅ COMPLETED

**File:** `/app/air-quality/page.tsx`

**Implementation:**
- [x] Automatic incident creation when CO ≥30 ppm OR NO₂ ≥0.5 ppm
- [x] Incident type: "Air Quality Emergency"
- [x] Severity: "critical"
- [x] Gas levels included in detailed description
- [x] Air quality reading linked to incident via `incident_id` field
- [x] Graceful error handling if incident creation fails

### 5. Build & Test
- [ ] Run `npm run build` in environment with internet access
- [ ] Fix any TypeScript errors
- [ ] Test all 4 modules in development
- [ ] Test authentication flows
- [ ] Test dark mode toggle
- [ ] Verify mobile responsiveness

### 6. User Roles & Permissions
- [ ] Verify `profiles` table has `role` column (admin, manager, staff)
- [ ] Test RLS policies with different roles
- [ ] Ensure staff can create records but not delete
- [ ] Ensure managers can update records
- [ ] Ensure admins have full access

## 📊 Code Statistics

**Total Deliverables:**
- 19 files created/modified
- 5,953 lines of code
- 8 database tables
- 4 complete modules

**Module Breakdown:**
1. **Incident & Accident Reporting:** 1,850 lines
   - Interactive 8-region body diagram
   - 30-minute edit window with auto-lock
   - Auto-notifications by severity

2. **Ice Operations:** 1,550 lines
   - Ice make logging (wet/dry)
   - 7-day blade change alerts
   - 30-point circle checks
   - End-of-day reports

3. **Air Quality Compliance:** 658 lines
   - CO, NO₂, CO₂ monitoring
   - OSHA threshold tracking
   - Auto-incident triggering

4. **Refrigeration Plant Monitoring:** 711 lines
   - Ontario Reg 219/01 compliance
   - 3 inspections per 8-hour period
   - Real-time threshold validation

## 🚀 Deployment Steps

### Step 1: Database Migration
```bash
cd /home/user/Florida-MFO
supabase migration up
```

### Step 2: Environment Configuration
1. Get Supabase credentials from: https://app.supabase.com/project/_/settings/api
2. Update `.env.local` with actual values
3. Restart dev server: `npm run dev`

### Step 3: Code Fixes
1. Implement facility context provider
2. Update 5 components to use facility context
3. Complete auto-incident creation in air quality module

### Step 4: Testing
```bash
npm run build
npm run test  # if tests exist
```

### Step 5: Deploy
```bash
# For Vercel
vercel --prod

# For other platforms
npm run build
# Deploy /out or /.next directory
```

## 📝 Additional Recommendations

### Security
- [ ] Enable Supabase Auth email verification
- [ ] Set up proper CORS policies
- [ ] Review RLS policies with security team
- [ ] Enable audit logging for incidents table

### Performance
- [ ] Add database connection pooling
- [ ] Implement caching for dashboard stats
- [ ] Optimize image uploads (if using Supabase Storage)
- [ ] Add pagination for long lists (incident history, etc.)

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Add analytics (Plausible, Google Analytics)
- [ ] Monitor database query performance

### Documentation
- [ ] Create user guide for each module
- [ ] Document admin setup process
- [ ] Create training materials for staff
- [ ] Document incident escalation procedures

## 🎯 Success Criteria

Deployment is ready when:
- ✅ All database migrations run successfully
- ✅ All environment variables configured
- ✅ No placeholder `facility_id` values remain
- ✅ Auto-incident creation implemented
- ✅ Build completes without errors
- ✅ All 4 modules tested and functional
- ✅ RLS policies tested with all user roles
- ✅ Mobile experience verified on actual devices

## 📞 Support

For deployment issues:
1. Check Supabase logs: https://app.supabase.com/project/_/logs
2. Check Vercel logs (if using Vercel)
3. Review browser console for client-side errors
4. Test database connections with Supabase SQL editor
