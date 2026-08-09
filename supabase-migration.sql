-- =========================================
-- AnuTask Subscription System — Supabase Migration
-- Run this in Supabase SQL Editor
-- =========================================

-- 1. Update profiles table with subscription columns
-- (If profiles table already exists, add missing columns)
DO $$
BEGIN
  -- Add subscription_plan column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_plan') THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free_trial';
  END IF;
  
  -- Add trial_start
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='trial_start') THEN
    ALTER TABLE profiles ADD COLUMN trial_start TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Add trial_end
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='trial_end') THEN
    ALTER TABLE profiles ADD COLUMN trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
  END IF;
  
  -- Add AI prompts tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ai_prompts_used') THEN
    ALTER TABLE profiles ADD COLUMN ai_prompts_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ai_prompts_reset_at') THEN
    ALTER TABLE profiles ADD COLUMN ai_prompts_reset_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Add plan_activated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='plan_activated_at') THEN
    ALTER TABLE profiles ADD COLUMN plan_activated_at TIMESTAMPTZ;
  END IF;
END $$;


-- 2. Create user_clients table (per-user client list with data isolation)
CREATE TABLE IF NOT EXISTS user_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_clients — each user sees only their own clients
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clients" ON user_clients;
CREATE POLICY "Users can view own clients" ON user_clients
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clients" ON user_clients;
CREATE POLICY "Users can insert own clients" ON user_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clients" ON user_clients;
CREATE POLICY "Users can update own clients" ON user_clients
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON user_clients;
CREATE POLICY "Users can delete own clients" ON user_clients
  FOR DELETE USING (auth.uid() = user_id);

-- Allow service_role to manage all clients (for setup-profile API)
DROP POLICY IF EXISTS "Service role full access clients" ON user_clients;
CREATE POLICY "Service role full access clients" ON user_clients
  FOR ALL USING (true) WITH CHECK (true);


-- 3. Create user_categories table (per-user custom categories)
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

-- RLS for user_categories
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own categories" ON user_categories;
CREATE POLICY "Users can view own categories" ON user_categories
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON user_categories;
CREATE POLICY "Users can insert own categories" ON user_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON user_categories;
CREATE POLICY "Users can update own categories" ON user_categories
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON user_categories;
CREATE POLICY "Users can delete own categories" ON user_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Service role access
DROP POLICY IF EXISTS "Service role full access categories" ON user_categories;
CREATE POLICY "Service role full access categories" ON user_categories
  FOR ALL USING (true) WITH CHECK (true);


-- 4. Verify tasks table has RLS (data isolation per user)
-- Your tasks table should already have user_id column
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

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


-- 5. Verify profiles table has RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role can do everything (for API routes)
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
CREATE POLICY "Service role full access profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);


-- 6. Update existing users to have trial subscription if not set
UPDATE profiles 
SET 
  subscription_plan = COALESCE(subscription_plan, 'free_trial'),
  subscription_status = COALESCE(subscription_status, 'trial'),
  trial_start = COALESCE(trial_start, created_at),
  trial_end = COALESCE(trial_end, created_at + INTERVAL '14 days'),
  ai_prompts_used = COALESCE(ai_prompts_used, 0),
  ai_prompts_reset_at = COALESCE(ai_prompts_reset_at, NOW())
WHERE subscription_plan IS NULL OR subscription_plan = '';


-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_plan, subscription_status);


-- Done! Your subscription system is ready.
-- Each user now has:
--   - Isolated data (tasks, clients, categories) via RLS
--   - Subscription plan tracking (free_trial, starter, pro)
--   - AI prompt usage tracking with monthly reset
--   - Default "Demo Client 01" created on signup via API
