// services/cashfreeCheckout.js
// ============================================
// Loads the Cashfree Checkout JS SDK on demand and opens the hosted checkout.
// The SDK is loaded from Cashfree's CDN only when a user starts a payment.
// ============================================

const SDK_SRC = 'https://sdk.cashfree.com/js/v3/cashfree.js';

let sdkPromise = null;

function loadSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Cashfree));
      existing.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK')));
      return;
    }
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.body.appendChild(script);
  });
  return sdkPromise;
}

/**
 * Open Cashfree Checkout for a given payment session.
 * @param {string} paymentSessionId - from POST /api/payment { action: 'create_order' }
 * @param {'sandbox'|'production'} env
 * @returns {Promise<object>} resolves with the SDK result (order_id available for verification)
 */
export async function openCashfreeCheckout(paymentSessionId, env = 'sandbox') {
  const Cashfree = await loadSdk();
  const cashfree = Cashfree({ mode: env === 'production' ? 'production' : 'sandbox' });

  // "_self" keeps the user in the same tab; the return_url on the order brings
  // them back to /dashboard?cf_order_id=...&cf_return=1 where we verify.
  return cashfree.checkout({
    paymentSessionId,
    redirectTarget: '_self',
  });
}
