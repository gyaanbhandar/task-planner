import { supabase } from '../lib/supabase';

// Plan definitions matching the feature matrix
export const PLAN_LIMITS = {
  free_trial: {
    id: 'free_trial',
    name: 'Free Trial',
    price_inr: 0,
    price_usd: 0,
    duration: '14 days',
    max_clients: 5,
    max_categories: 999, // unlimited
    ai_prompts_per_month: 10,
    max_recurring_tasks: 999, // unlimited
    export_formats: ['csv', 'json'],
    features: ['drag_reorder', 'priority_badges', 'browser_notifications', 'rls_security', 'all_views']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price_inr: 99,
    price_usd: 2.99,
    duration: '/month',
    max_clients: 2,
    max_categories: 5,
    ai_prompts_per_month: 15,
    max_recurring_tasks: 5,
    export_formats: ['csv'],
    features: ['drag_reorder', 'priority_badges', 'browser_notifications', 'rls_security', 'all_views']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price_inr: 249,
    price_usd: 6.99,
    duration: '/month',
    max_clients: 999, // unlimited
    max_categories: 999, // unlimited
    ai_prompts_per_month: 75,
    max_recurring_tasks: 999, // unlimited
    export_formats: ['csv', 'json'],
    features: ['drag_reorder', 'priority_badges', 'browser_notifications', 'rls_security', 'all_views']
  }
};

export const subscriptionService = {

  // Fetch user's subscription profile from profiles table
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist yet — create it
      return await this.createDefaultProfile(userId);
    }
    if (error) throw error;
    return data;
  },

  // Create default profile for new users (called on first login / signup)
  async createDefaultProfile(userId, email, fullName) {
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    
    const profile = {
      id: userId,
      email: email || '',
      full_name: fullName || '',
      subscription_plan: 'free_trial',
      subscription_status: 'trial',
      trial_start: now,
      trial_end: trialEnd,
      ai_prompts_used: 0,
      ai_prompts_reset_at: now,
      is_blocked: false,
      created_at: now
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();
    
    if (error) {
      console.error('Profile creation error:', error);
      // Return a fallback profile so the app doesn't break
      return profile;
    }
    return data;
  },

  // Create default "Demo Client 01" for new users
  async createDefaultClient(userId) {
    // Check if user already has clients in their categories/clients
    // We store clients in the tasks table subcategory, but we need a separate approach
    // For now, we'll use a user_clients table or store in profiles
    const { data: existing } = await supabase
      .from('user_clients')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existing && existing.length > 0) return; // Already has clients

    const { error } = await supabase
      .from('user_clients')
      .insert([
        { user_id: userId, name: 'Demo Client 01', created_at: new Date().toISOString() }
      ]);
    
    if (error) console.error('Default client creation error:', error);
  },

  // Fetch user's clients from DB
  async getUserClients(userId) {
    const { data, error } = await supabase
      .from('user_clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Fetch clients error:', error);
      return [];
    }
    return data || [];
  },

  // Add a client
  async addClient(userId, name) {
    const { data, error } = await supabase
      .from('user_clients')
      .insert([{ user_id: userId, name, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete a client
  async deleteClient(clientId, userId) {
    const { error } = await supabase
      .from('user_clients')
      .delete()
      .eq('id', clientId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Update client name
  async updateClient(clientId, userId, name) {
    const { error } = await supabase
      .from('user_clients')
      .update({ name })
      .eq('id', clientId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Fetch user's custom categories from DB
  async getUserCategories(userId) {
    const { data, error } = await supabase
      .from('user_categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Fetch categories error:', error);
      return null; // null = use defaults
    }
    return data && data.length > 0 ? data : null;
  },

  // Save user categories
  async saveUserCategories(userId, categories) {
    // Delete existing and re-insert
    await supabase.from('user_categories').delete().eq('user_id', userId);
    
    const rows = categories.map((c, i) => ({
      user_id: userId,
      cat_id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color || '#6366F1',
      bg: c.bg || 'rgba(99,102,241,0.08)',
      sort_order: i,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('user_categories').insert(rows);
    if (error) console.error('Save categories error:', error);
  },

  // Get current plan limits for user
  getPlanLimits(planId) {
    return PLAN_LIMITS[planId] || PLAN_LIMITS.free_trial;
  },

  // Check if trial has expired
  isTrialExpired(profile) {
    if (!profile) return false;
    if (profile.subscription_plan !== 'free_trial') return false;
    if (!profile.trial_end) return false;
    return new Date() > new Date(profile.trial_end);
  },

  // Get trial days remaining
  getTrialDaysLeft(profile) {
    if (!profile || !profile.trial_end) return 0;
    const diff = new Date(profile.trial_end) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  // Check AI prompt usage — returns { allowed: bool, used: number, limit: number }
  async checkAiUsage(userId, profile) {
    if (!profile) return { allowed: false, used: 0, limit: 0 };
    
    const limits = this.getPlanLimits(profile.subscription_plan);
    const used = profile.ai_prompts_used || 0;
    const limit = limits.ai_prompts_per_month;

    // Check if we need to reset the counter (monthly reset)
    const resetAt = profile.ai_prompts_reset_at ? new Date(profile.ai_prompts_reset_at) : new Date(0);
    const now = new Date();
    const monthDiff = (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth());
    
    if (monthDiff >= 1) {
      // Reset counter
      await supabase.from('profiles').update({
        ai_prompts_used: 0,
        ai_prompts_reset_at: now.toISOString()
      }).eq('id', userId);
      return { allowed: true, used: 0, limit };
    }

    return { allowed: used < limit, used, limit };
  },

  // Increment AI usage counter
  async incrementAiUsage(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('ai_prompts_used')
      .eq('id', userId)
      .single();
    
    const current = data?.ai_prompts_used || 0;
    await supabase.from('profiles').update({
      ai_prompts_used: current + 1
    }).eq('id', userId);
  },

  // Activate a subscription plan (called after payment in future)
  async activatePlan(userId, planId) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: planId,
        subscription_status: 'active',
        plan_activated_at: now,
        ai_prompts_used: 0,
        ai_prompts_reset_at: now
      })
      .eq('id', userId);
    if (error) throw error;
  },

  // Check limit: can user add more clients?
  canAddClient(profile, currentClientCount) {
    const limits = this.getPlanLimits(profile?.subscription_plan);
    return currentClientCount < limits.max_clients;
  },

  // Check limit: can user add more categories?
  canAddCategory(profile, currentCategoryCount) {
    const limits = this.getPlanLimits(profile?.subscription_plan);
    return currentCategoryCount < limits.max_categories;
  },

  // Check limit: can user add more recurring tasks?
  canAddRecurring(profile, currentRecurringCount) {
    const limits = this.getPlanLimits(profile?.subscription_plan);
    return currentRecurringCount < limits.max_recurring_tasks;
  },

  // Check if export format is allowed
  canExport(profile, format) {
    const limits = this.getPlanLimits(profile?.subscription_plan);
    return limits.export_formats.includes(format);
  }
};
