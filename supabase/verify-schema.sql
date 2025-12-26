-- Database Verification Script
-- Run this in Supabase SQL Editor after schema setup

-- 1. Check all tables exist
SELECT 'Tables Check' as test, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'ice_depth_templates',
    'ice_depth_measurements',
    'daily_report_templates',
    'daily_reports'
  );
-- Should return: count = 5

-- 2. Check RLS is enabled
SELECT 'RLS Check' as test,
       COUNT(*) as tables_with_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;
-- Should return: tables_with_rls = 5

-- 3. Check indexes exist
SELECT 'Indexes Check' as test,
       COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
-- Should return: index_count = 4

-- 4. Check triggers exist
SELECT 'Triggers Check' as test,
       COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Should return: trigger_count = 6 (5 update triggers + 1 auth trigger)

-- 5. Check storage bucket
SELECT 'Storage Check' as test,
       COUNT(*) as bucket_count
FROM storage.buckets
WHERE id = 'report-photos';
-- Should return: bucket_count = 1

-- 6. Check enums
SELECT 'Enums Check' as test,
       COUNT(*) as enum_count
FROM pg_type
WHERE typname IN ('user_role', 'shift_type');
-- Should return: enum_count = 2

-- Summary: All checks passed if all counts match expected values
SELECT '✅ Database verification complete!' as status;
