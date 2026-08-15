-- =========================================
-- AnuTask Subscription System v2 — Supabase Migration
-- Run this AFTER the original migration
-- =========================================

-- 1. Add new subscription columns to profiles
DO $$
BEGIN
  -- billing_cycle: monthly | yearly
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='billing_cycle') THEN
    ALTER TABLE profiles ADD COLUMN billing_cycle TEXT DEFAULT 'monthly';
  END IF;

  -- currency: INR | USD
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='currency') THEN
    ALTER TABLE profiles ADD COLUMN currency TEXT DEFAULT 'INR';
  END IF;

  -- subscription_status (if not exists — may already exist)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_status') THEN
    ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'free';
  END IF;

  -- Payment provider fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='provider') THEN
    ALTER TABLE profiles ADD COLUMN provider TEXT DEFAULT 'demo';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='provider_customer_id') THEN
    ALTER TABLE profiles ADD COLUMN provider_customer_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='provider_subscription_id') THEN
    ALTER TABLE profiles ADD COLUMN provider_subscription_id TEXT;
  END IF;

  -- Billing period tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='current_period_start') THEN
    ALTER TABLE profiles ADD COLUMN current_period_start TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='current_period_end') THEN
    ALTER TABLE profiles ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;

  -- Cancellation tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='cancel_at_period_end') THEN
    ALTER TABLE profiles ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='canceled_at') THEN
    ALTER TABLE profiles ADD COLUMN canceled_at TIMESTAMPTZ;
  END IF;

  -- AI usage period tracking (more precise than simple monthly reset)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='usage_period_start') THEN
    ALTER TABLE profiles ADD COLUMN usage_period_start TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='usage_period_end') THEN
    ALTER TABLE profiles ADD COLUMN usage_period_end TIMESTAMPTZ;
  END IF;

  -- AI prompt limit (stored per user so we can override)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ai_prompt_limit') THEN
    ALTER TABLE profiles ADD COLUMN ai_prompt_limit INTEGER DEFAULT 10;
  END IF;

END $$;


-- 2. Migrate existing users from old plan names to new
-- Since there are no paid customers, we can safely migrate

-- Map 'free_trial' with active trial → keep as free_trial (trialing)
-- Map 'free_trial' with expired trial → 'free' 
-- Map 'starter' (old ₹99) → 'free' (no paid customers, clean slate)
-- Map 'pro' (old ₹249) → 'free' (no paid customers, clean slate)

UPDATE profiles 
SET 
  subscription_plan = 'free_trial',
  subscription_status = CASE 
    WHEN trial_end IS NOT NULL AND trial_end > NOW() THEN 'trialing'
    ELSE 'expired'
  END,
  billing_cycle = 'monthly',
  currency = 'INR',
  ai_prompt_limit = CASE
    WHEN trial_end IS NOT NULL AND trial_end > NOW() THEN 150  -- Pro trial = 150 prompts
    ELSE 10  -- Free = 10 prompts
  END
WHERE subscription_plan IN ('free_trial', 'starter', 'pro')
  AND subscription_status != 'active';

-- Active users who somehow have 'active' status with old plans
-- Since no paid customers exist, reset these to trial/free
UPDATE profiles
SET
  subscription_plan = 'free',
  subscription_status = 'free',
  billing_cycle = 'monthly',
  currency = 'INR',
  ai_prompt_limit = 10
WHERE subscription_plan IN ('starter', 'pro')
  AND subscription_status = 'active';


-- 3. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_billing_cycle ON profiles(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_profiles_currency ON profiles(currency);
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON profiles(provider);
CREATE INDEX IF NOT EXISTS idx_profiles_cancel_at_period ON profiles(cancel_at_period_end);


-- 4. Subscription events table (for analytics tracking)
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  plan_id TEXT,
  billing_cycle TEXT,
  currency TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access subscription_events" ON subscription_events
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sub_events_user ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sub_events_created ON subscription_events(created_at DESC);


-- =====================================================
-- VERIFICATION QUERIES (run manually after migration)
-- =====================================================

-- Check profiles have new columns:
-- SELECT id, email, subscription_plan, subscription_status, billing_cycle, currency, ai_prompt_limit, trial_end
-- FROM profiles LIMIT 10;

-- Check no old pricing references remain in plans:
-- SELECT id, email, subscription_plan FROM profiles 
-- WHERE subscription_plan NOT IN ('free', 'free_trial', 'starter', 'pro', 'business');
