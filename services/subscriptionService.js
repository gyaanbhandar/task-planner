// services/subscriptionService.js
// ============================================
// UPDATED: Uses central plans.config.js
// ============================================

import { supabase } from '../lib/supabase';
import { PLANS, getPlan, getAiPromptLimit } from '../config/plans.config';
import { getEffectivePlan } from './entitlements';

// Re-export PLAN_LIMITS for backward compatibility
// Components that import PLAN_LIMITS will get the new limits
export const PLAN_LIMITS = Object.fromEntries(
  Object.entries(PLANS).map(([id, plan]) => [
    id,
    {
      id: plan.id,
      name: plan.name,
      price_inr: plan.pricing.INR.monthly,
      price_usd: plan.pricing.USD.monthly,
      price_inr_yearly: plan.pricing.INR.yearly,
      price_usd_yearly: plan.pricing.USD.yearly,
      duration: plan.pricing.INR.monthly === 0 ? 'Forever' : '/month',
      max_clients: plan.limits.maxClients === Infinity ? 999 : plan.limits.maxClients,
      max_categories: plan.limits.maxCategories === Infinity ? 999 : plan.limits.maxCategories,
      ai_prompts_per_month: plan.limits.aiPromptsPerMonth,
      max_recurring_tasks: plan.limits.maxRecurringTasks === Infinity ? 999 : plan.limits.maxRecurringTasks,
      export_formats: plan.exportFormats,
      features: Object.entries(plan.features)
        .filter(([, v]) => v === true)
        .map(([k]) => k),
    },
  ])
);

// Also add legacy free_trial mapping → same as pro limits during trial
PLAN_LIMITS.free_trial = { ...PLAN_LIMITS.pro, id: 'free_trial', name: 'Pro Trial' };

export const subscriptionService = {

  // Fetch user's subscription profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code === 'PGRST116') {
      return await this.createDefaultProfile(userId);
    }
    if (error) throw error;

    // Check and auto-downgrade expired trials
    if (data && data.subscription_plan === 'free_trial') {
      const trialEnd = data.trial_end ? new Date(data.trial_end) : null;
      if (trialEnd && new Date() > trialEnd && data.subscription_status !== 'expired') {
        // Auto-downgrade to free
        await supabase.from('profiles').update({
          subscription_status: 'expired',
        }).eq('id', userId);
        data.subscription_status = 'expired';
      }
    }

    return data;
  },

  // Create default profile for new user
  async createDefaultProfile(userId) {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const profile = {
      id: userId,
      subscription_plan: 'free_trial',
      subscription_status: 'trialing',
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
      ai_prompts_used: 0,
      ai_prompts_reset_at: now.toISOString(),
      billing_cycle: 'monthly',
      currency: 'INR',
    };

    const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
    if (error) throw error;

    // Create default demo client
    try {
      await supabase.from('user_clients').insert({
        user_id: userId,
        name: 'Demo Client 01',
        created_at: now.toISOString(),
      });
    } catch (e) { /* ignore if exists */ }

    return data || profile;
  },

  // Get clients for user
  async getUserClients(userId) {
    const { data, error } = await supabase
      .from('user_clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    return data || [];
  },

  // Create client
  async createClient(userId, name) {
    const { data, error } = await supabase
      .from('user_clients')
      .insert({ user_id: userId, name, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update client
  async updateClient(clientId, userId, name) {
    const { error } = await supabase
      .from('user_clients')
      .update({ name })
      .eq('id', clientId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Delete client
  async deleteClient(clientId, userId) {
    const { error } = await supabase
      .from('user_clients')
      .delete()
      .eq('id', clientId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Get user categories
  async getUserCategories(userId) {
    const { data } = await supabase
      .from('user_categories')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    return data || [];
  },

  // Save user categories
  async saveUserCategories(userId, categories) {
    await supabase.from('user_categories').delete().eq('user_id', userId);
    const rows = categories.map((c, i) => ({
      user_id: userId,
      cat_id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color || '#6366F1',
      bg: c.bg || 'rgba(99,102,241,0.08)',
      sort_order: i,
      created_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('user_categories').insert(rows);
    if (error) console.error('Save categories error:', error);
  },

  // Get plan limits (backward-compatible)
  getPlanLimits(planId) {
    return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
  },

  // Check if trial expired
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

  // Check AI prompt usage
  async checkAiUsage(userId, profile) {
    if (!profile) return { allowed: false, used: 0, limit: 0 };

    const effectivePlan = getEffectivePlan(profile);
    const limit = getAiPromptLimit(effectivePlan);
    const used = profile.ai_prompts_used || 0;

    // Check monthly reset
    const resetAt = profile.ai_prompts_reset_at ? new Date(profile.ai_prompts_reset_at) : new Date(0);
    const now = new Date();
    const monthDiff = (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth());

    if (monthDiff >= 1) {
      await supabase.from('profiles').update({
        ai_prompts_used: 0,
        ai_prompts_reset_at: now.toISOString(),
      }).eq('id', userId);
      return { allowed: true, used: 0, limit };
    }

    return { allowed: used < limit, used, limit };
  },

  // Increment AI usage
  async incrementAiUsage(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('ai_prompts_used')
      .eq('id', userId)
      .single();
    const current = data?.ai_prompts_used || 0;
    await supabase.from('profiles').update({
      ai_prompts_used: current + 1,
    }).eq('id', userId);
  },

  // Activate plan (after payment confirmation)
  async activatePlan(userId, planId, billingCycle = 'monthly', currency = 'INR') {
    const now = new Date();
    const periodEnd = billingCycle === 'yearly'
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: planId,
        subscription_status: 'active',
        billing_cycle: billingCycle,
        currency: currency,
        plan_activated_at: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        ai_prompts_used: 0,
        ai_prompts_reset_at: now.toISOString(),
        cancel_at_period_end: false,
      })
      .eq('id', userId);
    if (error) throw error;
  },

  // Check limit: can user add more clients?
  canAddClient(profile, currentClientCount) {
    const limits = this.getPlanLimits(getEffectivePlan(profile));
    return currentClientCount < limits.max_clients;
  },

  // Check limit: can user add more categories?
  canAddCategory(profile, currentCategoryCount) {
    const limits = this.getPlanLimits(getEffectivePlan(profile));
    return currentCategoryCount < limits.max_categories;
  },

  // Check limit: can user add more recurring tasks?
  canAddRecurring(profile, currentRecurringCount) {
    const limits = this.getPlanLimits(getEffectivePlan(profile));
    return currentRecurringCount < limits.max_recurring_tasks;
  },

  // Check if export format allowed
  canExport(profile, format) {
    const limits = this.getPlanLimits(getEffectivePlan(profile));
    return limits.export_formats.includes(format);
  },
};
