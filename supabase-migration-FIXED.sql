-- =====================================================
-- AnuTask — COMPLETE FIX Migration
-- Run this ENTIRE script in Supabase SQL Editor
-- It handles everything: fixes + new tables + RLS
-- =====================================================


-- =====================================================
-- STEP 1: Fix profiles table — add missing columns
-- =====================================================

-- Add subscription_plan (currently NULL for all users)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_plan') THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free_trial';
  END IF;
END $$;

-- Add trial tracking columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='trial_start') THEN
    ALTER TABLE profiles ADD COLUMN trial_start TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='trial_end') THEN
    ALTER TABLE profiles ADD COLUMN trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ai_prompts_used') THEN
    ALTER TABLE profiles ADD COLUMN ai_prompts_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ai_prompts_reset_at') THEN
    ALTER TABLE profiles ADD COLUMN ai_prompts_reset_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='plan_activated_at') THEN
    ALTER TABLE profiles ADD COLUMN plan_activated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Fill NULL subscription_plan for existing 3 users
UPDATE profiles 
SET 
  subscription_plan = 'free_trial',
  subscription_status = COALESCE(subscription_status, 'trial'),
  trial_start = COALESCE(trial_start, created_at, NOW()),
  trial_end = COALESCE(trial_end, COALESCE(created_at, NOW()) + INTERVAL '14 days'),
  ai_prompts_used = COALESCE(ai_prompts_used, 0),
  ai_prompts_reset_at = COALESCE(ai_prompts_reset_at, NOW())
WHERE subscription_plan IS NULL OR subscription_plan = '';


-- =====================================================
-- STEP 2: ENABLE RLS on profiles (currently OFF — CRITICAL FIX)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role bypass (for API routes using SUPABASE_SERVICE_ROLE_KEY)
-- This is safe because service_role key is only on server-side
CREATE POLICY "Service role full access profiles" ON profiles
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);


-- =====================================================
-- STEP 3: ENABLE RLS on admin_users (currently OFF — CRITICAL FIX)
-- =====================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
CREATE POLICY "Only admins can view admin_users" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;
CREATE POLICY "Service role full access admin_users" ON admin_users
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);


-- =====================================================
-- STEP 4: Verify tasks table RLS (already ON — just ensure policies)
-- =====================================================

-- tasks already has RLS ON, but let's ensure policies are correct
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access tasks" ON tasks;
CREATE POLICY "Service role full access tasks" ON tasks
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);


-- =====================================================
-- STEP 5: Create user_clients table (doesn't exist yet)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own clients" ON user_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON user_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON user_clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON user_clients
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access user_clients" ON user_clients
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);


-- =====================================================
-- STEP 6: Create user_categories table (doesn't exist yet)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cat_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📂',
  color TEXT DEFAULT '#6366F1',
  bg TEXT DEFAULT 'rgba(99,102,241,0.08)',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own categories" ON user_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON user_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON user_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON user_categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access user_categories" ON user_categories
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);


-- =====================================================
-- STEP 7: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_plan);


-- =====================================================
-- STEP 8: Insert "Demo Client 01" for all existing users
-- =====================================================

-- For user: anukantsinfo@gmail.com
INSERT INTO user_clients (user_id, name, created_at)
SELECT id, 'Demo Client 01', NOW()
FROM profiles 
WHERE email = 'anukantsinfo@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_clients 
  WHERE user_clients.user_id = profiles.id AND user_clients.name = 'Demo Client 01'
);

-- For user: anukant.s@gmail.com
INSERT INTO user_clients (user_id, name, created_at)
SELECT id, 'Demo Client 01', NOW()
FROM profiles 
WHERE email = 'anukant.s@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_clients 
  WHERE user_clients.user_id = profiles.id AND user_clients.name = 'Demo Client 01'
);

-- For user: gyaanbhandar90@gmail.com
INSERT INTO user_clients (user_id, name, created_at)
SELECT id, 'Demo Client 01', NOW()
FROM profiles 
WHERE email = 'gyaanbhandar90@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_clients 
  WHERE user_clients.user_id = profiles.id AND user_clients.name = 'Demo Client 01'
);


-- =====================================================
-- STEP 9: Handle ai_plans table RLS (exists in your DB)
-- =====================================================

ALTER TABLE ai_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access ai_plans" ON ai_plans;
CREATE POLICY "Service role full access ai_plans" ON ai_plans
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);


-- =====================================================
-- STEP 10: Handle activity_log table RLS (exists in your DB)
-- =====================================================

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access activity_log" ON activity_log;
CREATE POLICY "Service role full access activity_log" ON activity_log
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);


-- =====================================================
-- DONE! Run these VERIFICATION queries after:
-- =====================================================

-- VERIFY 1: All tables should show rowsecurity = true
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';

-- VERIFY 2: Check profiles now have subscription data
-- SELECT id, email, full_name, subscription_plan, subscription_status, trial_end, ai_prompts_used 
-- FROM profiles;

-- VERIFY 3: Check Demo Client 01 was created
-- SELECT * FROM user_clients;

-- VERIFY 4: Check all RLS policies
-- SELECT tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;
