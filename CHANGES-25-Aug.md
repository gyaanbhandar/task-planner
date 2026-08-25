# AnuTask — Fixes (25 Aug batch)

This document explains what changed and the two setup steps needed before the
payment/coupon features work in production.

---

## 1. Payment gateway (Cashfree)

Previously the "activate plan" button flipped the plan for free with no payment.
It is now a real Cashfree Payment Gateway flow.

**New files**
- `app/api/payment/route.js` — creates a Cashfree order (coupon-aware) and verifies payment server-side, then activates the plan.
- `services/cashfreeCheckout.js` — loads the Cashfree Checkout JS SDK and opens hosted checkout.

**Changed**
- `components/ViewSettings.js` — plan cards now start a real payment; the button shows the amount to pay. On return from Cashfree the payment is verified and the plan activates.
- `app/dashboard/page.js` — also verifies the payment on return (works even if the user isn't on the Settings tab).

**Flow:** user picks a plan → `create_order` → Cashfree checkout → redirect back to `/dashboard?cf_order_id=...` → server `verify` confirms `PAID` with Cashfree → plan activated. The discount is always recalculated **server-side** — a client can never fake a price.

---

## 2. Coupons (percentage + flat, admin-defined)

**New files**
- `services/couponService.js` — server-side validation + discount math.
- `app/api/coupons/route.js` — `validate` (used at checkout) and admin CRUD (`list`/`create`/`toggle`/`delete`).
- `components/CouponManager.js` — coupon management UI inside the Admin Panel.

**Changed**
- `components/ViewSettings.js` — a "Have a coupon?" field on each paid plan; applying a valid coupon shows the discounted price before payment.
- `components/ViewAdmin.js` — renders the Coupon Manager.

Coupons support: percentage or flat discount, per-currency flat codes, optional
plan restriction, expiry date, redemption limit, and enable/disable.

---

## 3. Completed tasks auto-delete after 30 days (+ manual clear)

**Changed**
- `services/taskService.js` — `autoCleanCompleted()` (moves `done` tasks older than 30 days to Trash) and `clearCompleted()` (manual).
- `hooks/useTasks.js` — `handleAutoCleanCompleted` (runs on login) and `handleClearCompleted`.
- `app/dashboard/page.js` — runs the 30-day auto-clean on login.
- `components/ViewToday.js` — "🧹 Clear Completed" button (shown when completed tasks exist).

Completed tasks are moved to Trash (not hard-deleted), so they're still restorable
for 15 days via the existing Trash flow.

---

## 4. One-time tasks no longer appear under Recurring

**Changed**
- `components/ViewRecurring.js` — filter now shows only `daily`/`weekly`/`monthly` tasks. The old filter (`type !== 'one-time' || t.time`) leaked one-time tasks that had a time set.

---

## 5. Plan-based limits are now enforced

**Changed**
- `app/dashboard/page.js` — enforces client and category limits from `entitlements.js` at creation time (with an upgrade prompt).
- `components/ViewToday.js` — JSON export gate fixed to use the effective plan (Free = CSV only; Starter/Pro/Business = CSV + JSON). The old check was inverted.
- `services/subscriptionService.js` — added the missing `addClient()` (the dashboard called it but only `createClient` existed, so client creation was failing).

---

## 6. Homepage 404 links fixed

**Changed**
- `app/page.js` (the live homepage) — the fix now covers **all 11 dead links**:
  - 3 `href="#"` links: logo now scrolls to top; footer Privacy / Terms point to real pages.
  - 8 external `https://www.anutask.com/dashboard/signup` and `/dashboard/login` buttons that returned 404 (Sign In, Start Free Forever, Get Started Free, Start with Starter, Choose Pro, header CTA, mobile menu CTA, final CTA). All now point to the internal `/dashboard` route.
- `app/landing/page.js` — same set of fixes applied for consistency.
- `components/AuthScreen.js` — now reads `?mode=signup` from the URL and opens the Sign Up tab automatically, so "Start Free Forever" lands the user directly on the signup form instead of the login form.

**New pages**
- `app/privacy/page.js`, `app/terms/page.js`.

The five nav anchors (Features / How It Works / About / Pricing / Contact) were already valid.

---

## 7. Payment UI is behind a feature flag

The Cashfree code is fully wired but the plan cards should not offer paid checkout until Cashfree activates your Payment Gateway product. This is now controlled by a single env var:

**`NEXT_PUBLIC_PAYMENTS_ENABLED`**
- `false` (default): plan cards show `🔒 Payment Gateway Coming Soon` for paid plans and hide the coupon field. Free plan CTA still works. Coupon management in the Admin Panel still works too, so you can prepare codes ahead of launch.
- `true`: enables the full checkout (coupon apply + Cashfree pay button).

Flip the flag the day Cashfree approves your PG product — no code change needed. When you flip it, also make sure the Cashfree env vars (`CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV`) are set.

---

## SETUP — do these before going live

### A. Run the SQL migration
In Supabase → SQL Editor, run:

    supabase-migration-v3-payments-coupons.sql

This creates the `coupons` and `payment_orders` tables (with RLS) and seeds two
sample coupons (`WELCOME20`, `FLAT100`) — remove the seed block if you don't want them.

### B. Set environment variables
See `.env.example`. The new ones are:

- `NEXT_PUBLIC_APP_URL` — your app origin (for the Cashfree return URL)
- `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV` (`sandbox` → `production`)
- `ADMIN_PANEL_SECRET` — the token you type in the Admin Panel to manage coupons
- `NEXT_PUBLIC_PAYMENTS_ENABLED` — keep as `false` until Cashfree approves your PG; flip to `true` on activation day

Test in `CASHFREE_ENV=sandbox` first with Cashfree test cards, then switch to
`production` once your Payment Gateway product is fully activated (per your
Cashfree dashboard it was "in review").
