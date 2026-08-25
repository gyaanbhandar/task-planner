// services/couponService.js
// ============================================
// Server-side coupon validation & discount math.
// Import ONLY from API routes (uses the admin/service client).
// Never expose the coupons table to the browser directly.
// ============================================

/**
 * Look up and validate a coupon against a given order.
 * @param {object} adminClient - Supabase client created with the service role key
 * @param {object} args
 * @param {string} args.code        - coupon code entered by the user
 * @param {string} args.planId      - plan being purchased
 * @param {string} args.currency    - 'INR' | 'USD'
 * @param {number} args.baseAmount  - list price before discount
 * @returns {Promise<{ok: boolean, error?: string, coupon?: object, discount?: number, final?: number}>}
 */
export async function validateCoupon(adminClient, { code, planId, currency, baseAmount }) {
  if (!code || !code.trim()) return { ok: false, error: 'No coupon code provided.' };

  const normalized = code.trim().toUpperCase();

  const { data: coupon, error } = await adminClient
    .from('coupons')
    .select('*')
    .ilike('code', normalized)
    .maybeSingle();

  if (error) return { ok: false, error: 'Could not validate coupon. Try again.' };
  if (!coupon) return { ok: false, error: 'Invalid coupon code.' };

  if (!coupon.active) return { ok: false, error: 'This coupon is no longer active.' };

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { ok: false, error: 'This coupon has expired.' };
  }

  if (coupon.max_redemptions != null && coupon.times_redeemed >= coupon.max_redemptions) {
    return { ok: false, error: 'This coupon has reached its redemption limit.' };
  }

  if (Array.isArray(coupon.applies_to_plans) && coupon.applies_to_plans.length > 0
      && !coupon.applies_to_plans.includes(planId)) {
    return { ok: false, error: 'This coupon does not apply to the selected plan.' };
  }

  if (coupon.min_amount && baseAmount < Number(coupon.min_amount)) {
    return { ok: false, error: `Minimum order of ${coupon.min_amount} required for this coupon.` };
  }

  // For flat coupons tied to a specific currency, only apply on matching currency
  if (coupon.discount_type === 'flat' && coupon.currency && coupon.currency !== currency) {
    return { ok: false, error: `This coupon applies to ${coupon.currency} pricing only.` };
  }

  const discount = computeDiscount(coupon, baseAmount);
  const final = Math.max(0, Number((baseAmount - discount).toFixed(2)));

  return { ok: true, coupon, discount: Number(discount.toFixed(2)), final };
}

/** Pure discount calculation — kept separate so it's easy to unit test. */
export function computeDiscount(coupon, baseAmount) {
  if (!coupon) return 0;
  if (coupon.discount_type === 'percent') {
    const pct = Math.min(100, Math.max(0, Number(coupon.discount_value)));
    return (baseAmount * pct) / 100;
  }
  // flat
  return Math.min(baseAmount, Math.max(0, Number(coupon.discount_value)));
}
