import { supabase } from '../lib/supabase';

export const authService = {
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      callback(session);
    });
    return subscription;
  },
  async signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  async signUp(email, password, name) {
    return await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { full_name: name } } 
    });
  },
  async signOut() {
    return await supabase.auth.signOut();
  },

  // Profile Management
  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
    return data;
  },

  async updateEmail(newEmail) {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  // Send a password-reset email. The link brings the user back to /dashboard
  // where AuthScreen detects the recovery token and shows the "set new password" form.
  async sendPasswordReset(email) {
    const redirectTo =
      (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '')) + '/dashboard';
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return data;
  },

  // ============================================
  // SUPER ADMIN ACCESS CONTROL
  // ============================================
  // A user counts as super-admin ONLY if the SERVER confirms BOTH:
  //   1) their email is in the private ADMIN_EMAILS allowlist (server-only), AND
  //   2) they exist in the admin_users table.
  // The allowlist lives ONLY on the server (never a NEXT_PUBLIC_ var), so the
  // admin email is never exposed to the browser. All checking happens in
  // /api/admin, which returns just a boolean — it leaks nothing.
  // ============================================

  // Check if current user is super admin (server decides — allowlist + DB record)
  async isAdmin(userId, email) {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_admin', userId, email }),
      });
      const data = await res.json();
      return res.ok && data.isAdmin === true;
    } catch {
      return false;
    }
  },

  // Admin: list all users with full subscription + payment detail
  async adminListUsers(email) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list_users', email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load users');
    return data.users || [];
  },

  // Admin: platform metrics (revenue, MRR, counts)
  async adminGetMetrics(email) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'metrics', email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load metrics');
    return data.metrics || {};
  },

  // Admin: block/unblock user
  async toggleUserBlock(userId, blocked, email) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_block', userId, blocked, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');
    return data;
  },

  // Admin: change a user's plan / status / expiry / payment method manually
  async adminUpdateSubscription(userId, updates, email) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_subscription', userId, updates, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update subscription');
    return data;
  },

  // Admin: apply an offer/discount to a specific user (grants a plan for N days)
  async adminApplyOffer(userId, offer, email) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'apply_offer', userId, offer, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to apply offer');
    return data;
  },

  // Admin: create user (via admin API with service_role key)
  async adminCreateUser(email, password, name, adminEmail) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_user', email, password, name, adminEmail }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data;
  },

  // Backward-compat alias used by older code
  async listAllUsers(email) {
    return this.adminListUsers(email);
  },
};
