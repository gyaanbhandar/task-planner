-- =====================================================
-- AnuTask — Migration v5: Custom Categories Fix
-- Run this ENTIRE script in the Supabase SQL Editor.
-- Safe to re-run.
-- =====================================================
--
-- WHY THIS EXISTS
--   The `tasks` table carries an old CHECK constraint
--   (`tasks_category_check`) that only permits the 8 original
--   hardcoded category IDs. As soon as a user creates a custom
--   category (e.g. "loan"), inserting a task with that category
--   is rejected by Postgres with:
--     new row for relation "tasks" violates check constraint
--     "tasks_category_check"
--
--   Categories are now per-user and stored in `user_categories`,
--   so the fixed allow-list no longer makes sense. This migration
--   removes the constraint so any category id is accepted.
-- =====================================================


-- =====================================================
-- STEP 1: Drop the old category check constraint on tasks
--   The constraint name may differ slightly if the table was
--   created manually. Both the known name and a dynamic sweep
--   are handled below so this works regardless.
-- =====================================================

-- 1a. Drop by its known name (no-op if it is already gone).
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_check;

-- 1b. Safety net: drop ANY remaining CHECK constraint on tasks
--     whose definition references the `category` column, in case
--     it was created under a different name.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel     ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'tasks'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%category%'
  LOOP
    EXECUTE format('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS %I', c.conname);
    RAISE NOTICE 'Dropped category check constraint: %', c.conname;
  END LOOP;
END $$;


-- =====================================================
-- STEP 2: Ensure user_categories exists (idempotent)
--   Present in the base migration; repeated here so v5 is
--   self-contained for anyone running migrations out of order.
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

CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON user_categories(user_id);


-- =====================================================
-- DONE
--   After running this:
--     • Tasks can be created under any custom category.
--     • Categories persist per-user in user_categories.
-- =====================================================
