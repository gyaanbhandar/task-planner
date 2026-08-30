-- =====================================================
-- AnuTask — Migration v4: Super Admin
-- Run this ENTIRE script in the Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
-- =====================================================


-- =====================================================
-- STEP 1: admin_users table
--   Only rows here (AND an allowlisted email) can access the admin panel.
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'super_admin',   -- super_admin | admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(LOWER(email));

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only the service role (server API routes) may read/write admin_users.
-- The browser never queries this table directly.
DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;
CREATE POLICY "Service role full access admin_users" ON admin_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- =====================================================
-- STEP 2: profile columns used by the admin panel
--   payment_method: 'manual' | 'automatic' | 'none'
--   offer_note:     free-text note when an offer is applied manually
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='profiles' AND column_name='payment_method') THEN
    ALTER TABLE profiles ADD COLUMN payment_method TEXT DEFAULT 'none';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='profiles' AND column_name='offer_note') THEN
    ALTER TABLE profiles ADD COLUMN offer_note TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='profiles' AND column_name='current_period_start') THEN
    ALTER TABLE profiles ADD COLUMN current_period_start TIMESTAMPTZ;
  END IF;
END $$;


-- =====================================================
-- STEP 3: Seed your super-admin account.
--   Replace the email below with YOUR admin email, then run.
--   This email must ALSO be added to the ADMIN_EMAILS env var.
-- =====================================================
INSERT INTO admin_users (user_id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE LOWER(email) = LOWER('admin@anutask.com')   -- <-- CHANGE THIS
ON CONFLICT (user_id) DO NOTHING;


-- =====================================================
-- DONE.
-- Verify:  SELECT email, role FROM admin_users;
-- =====================================================
