-- =====================================================
-- AnuTask — Migration v3: Payments (Cashfree) + Coupons
-- Run this ENTIRE script in Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
-- =====================================================


-- =====================================================
-- STEP 1: coupons table (admin-defined discounts)
--   discount_type: 'percent' (value = 0-100) or 'flat' (value = amount in the coupon's currency)
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  currency TEXT DEFAULT 'INR',            -- applies to 'flat' coupons; percent ignores this
  applies_to_plans TEXT[] DEFAULT NULL,   -- NULL = all purchasable plans, else e.g. ARRAY['pro']
  max_redemptions INTEGER DEFAULT NULL,   -- NULL = unlimited
  times_redeemed INTEGER DEFAULT 0,
  min_amount NUMERIC DEFAULT 0,           -- minimum order amount for coupon to apply
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ DEFAULT NULL,    -- NULL = never expires
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store codes case-insensitively as UPPER for consistent lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_upper ON coupons (UPPER(code));

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Only the service role (server API routes) may read/write coupons.
-- Clients never query this table directly — validation happens server-side.
DROP POLICY IF EXISTS "Service role full access coupons" ON coupons;
CREATE POLICY "Service role full access coupons" ON coupons
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- =====================================================
-- STEP 2: payment_orders table (Cashfree order lifecycle)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cf_order_id TEXT,                        -- Cashfree order_id
  plan_id TEXT NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  currency TEXT NOT NULL DEFAULT 'INR',
  base_amount NUMERIC NOT NULL,            -- list price before discount
  discount_amount NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL,           -- amount actually charged
  coupon_code TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'created',  -- created | paid | failed | expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_cf_order ON payment_orders(cf_order_id);

ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Users may read their own orders; only service role writes.
DROP POLICY IF EXISTS "Users can view own orders" ON payment_orders;
CREATE POLICY "Users can view own orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access payment_orders" ON payment_orders;
CREATE POLICY "Service role full access payment_orders" ON payment_orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- =====================================================
-- STEP 3: Optional seed coupons (comment out if not wanted)
-- =====================================================
INSERT INTO coupons (code, description, discount_type, discount_value, currency, active)
VALUES
  ('WELCOME20', '20% off any plan', 'percent', 20, 'INR', TRUE),
  ('FLAT100',   '₹100 off (INR plans)', 'flat', 100, 'INR', TRUE)
ON CONFLICT (code) DO NOTHING;


-- =====================================================
-- DONE.
-- Verify:  SELECT code, discount_type, discount_value, active FROM coupons;
-- =====================================================
