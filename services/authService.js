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

  // Check if current user is super admin
  async isAdmin(userId) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single();
    return !error && !!data;
  },

  // Admin: list all users via admin_users_view (or profiles table)
  async listAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Admin: block/unblock user
  async toggleUserBlock(userId, blocked) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: blocked })
      .eq('id', userId);
    if (error) throw error;
  },

  // Admin: create user (via edge function or admin API)
  async adminCreateUser(email, password, name) {
    // This would typically call a Supabase Edge Function with service_role key
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data;
  }
};
