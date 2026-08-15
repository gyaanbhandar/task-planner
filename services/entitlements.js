// services/entitlements.js
// ============================================
// CENTRALIZED ENTITLEMENT ENGINE
// Never scatter plan checks. Use these helpers everywhere.
// ============================================

import { PLANS, TRIAL_CONFIG, SUB_STATUS, getAiPromptLimit } from '../config/plans.config';

/**
 * Determine the effective plan level for a user.
 * Handles trial → pro mapping and expired trial → free fallback.
 */
export function getEffectivePlan(profile) {
  if (!profile) return 'free';

  const plan = profile.subscription_plan || 'free';
  const status = profile.subscription_status || 'free';

  // Legacy: free_trial with active trial = pro-level access
  if (plan === 'free_trial' && status === 'trialing') {
    const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
    if (trialEnd && new Date() < trialEnd) {
      return TRIAL_CONFIG.trialPlanLevel; // 'pro'
    }
    // Trial expired
    return 'free';
  }

  // Active subscriptions
  if (['active', 'trialing', 'canceling'].includes(status)) {
    return plan;
  }

  // Expired, canceled, past_due → fallback to free
  if (['expired', 'canceled'].includes(status)) {
    return 'free';
  }

  // past_due gets grace period — keep current plan for now
  if (status === 'past_due') {
    return plan;
  }

  return plan === 'free' ? 'free' : plan;
}

/**
 * Get all entitlements for a user in one call.
 */
export function getUserEntitlements(profile) {
  const effectivePlan = getEffectivePlan(profile);
  const planConfig = PLANS[effectivePlan] || PLANS.free;
  const limits = planConfig.limits;
  const features = planConfig.features;

  return {
    planId: effectivePlan,
    planName: planConfig.name,
    limits: { ...limits },
    features: { ...features },
    exportFormats: [...planConfig.exportFormats],
    aiPromptLimit: limits.aiPromptsPerMonth,
  };
}

/**
 * Can user create a new client?
 */
export function canCreateClient(profile, currentClientCount) {
  const { limits } = getUserEntitlements(profile);
  return currentClientCount < limits.maxClients;
}

/**
 * Can user create a new category?
 */
export function canCreateCategory(profile, currentCategoryCount) {
  const { limits } = getUserEntitlements(profile);
  return currentCategoryCount < limits.maxCategories;
}

/**
 * Can user use a specific feature?
 */
export function canUseFeature(profile, featureKey) {
  const { features } = getUserEntitlements(profile);
  return features[featureKey] === true;
}

/**
 * Can user create more recurring tasks?
 */
export function canCreateRecurringTask(profile, currentRecurringCount) {
  const { limits } = getUserEntitlements(profile);
  return currentRecurringCount < limits.maxRecurringTasks;
}

/**
 * Can user export in given format?
 */
export function canExportFormat(profile, format) {
  const { exportFormats } = getUserEntitlements(profile);
  return exportFormats.includes(format);
}

/**
 * Get AI prompt usage status
 */
export function getAiUsageStatus(profile) {
  const effectivePlan = getEffectivePlan(profile);
  const limit = getAiPromptLimit(effectivePlan);
  const used = profile?.ai_prompts_used || 0;
  const remaining = Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    allowed: used < limit,
    percentUsed: limit > 0 ? Math.min(100, (used / limit) * 100) : 100,
  };
}

/**
 * Get subscription display info for UI badges and status cards.
 */
export function getSubscriptionDisplay(profile) {
  if (!profile) {
    return { badge: 'FREE', statusText: 'Free Plan', color: '#64748B', bgColor: '#F1F5F9' };
  }

  const plan = profile.subscription_plan || 'free';
  const status = profile.subscription_status || 'free';

  // Trial
  if (plan === 'free_trial' && status === 'trialing') {
    const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
    if (trialEnd && new Date() < trialEnd) {
      const daysLeft = Math.max(0, Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24)));
      return {
        badge: 'PRO TRIAL',
        statusText: `Pro Trial — ${daysLeft} days left`,
        color: '#6366F1',
        bgColor: '#EEF2FF',
        daysLeft,
        isTrialing: true,
      };
    }
    // Expired trial
    return { badge: 'FREE', statusText: 'Trial ended — Free Plan', color: '#EF4444', bgColor: '#FEF2F2', isExpired: true };
  }

  // Active subscription
  if (status === 'active') {
    const colors = {
      starter: { color: '#059669', bg: '#ECFDF5' },
      pro: { color: '#6366F1', bg: '#EEF2FF' },
      business: { color: '#7C3AED', bg: '#F3E8FF' },
    };
    const c = colors[plan] || { color: '#059669', bg: '#ECFDF5' };
    return { badge: plan.toUpperCase(), statusText: `${PLANS[plan]?.name || plan} Plan Active`, color: c.color, bgColor: c.bg };
  }

  // Canceling
  if (status === 'canceling') {
    const endDate = profile.current_period_end ? new Date(profile.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'end of period';
    return { badge: `${plan.toUpperCase()}`, statusText: `Cancels on ${endDate}`, color: '#D97706', bgColor: '#FEF3C7', isCanceling: true };
  }

  // Past due
  if (status === 'past_due') {
    return { badge: 'PAST DUE', statusText: 'Payment failed — update payment method', color: '#EF4444', bgColor: '#FEF2F2', isPastDue: true };
  }

  // Free
  return { badge: 'FREE', statusText: 'Free Plan', color: '#64748B', bgColor: '#F1F5F9' };
}

/**
 * Get upgrade suggestion when a limit is hit.
 * Returns { targetPlan, reason, benefits } or null if already on highest.
 */
export function getUpgradeSuggestion(profile, limitType) {
  const effectivePlan = getEffectivePlan(profile);
  const upgradeMap = { free: 'starter', starter: 'pro', pro: 'business' };
  const targetId = upgradeMap[effectivePlan];
  if (!targetId) return null;

  const target = PLANS[targetId];
  if (!target) return null;

  const messages = {
    ai_limit: {
      title: "You've reached your AI Planner limit",
      reason: `You've used all ${PLANS[effectivePlan]?.limits.aiPromptsPerMonth || 10} AI Planner prompts included with your ${PLANS[effectivePlan]?.name || 'current'} plan.`,
      benefits: [
        `${target.limits.aiPromptsPerMonth} AI Planner prompts/month`,
        target.limits.maxClients === Infinity ? 'Unlimited clients' : `Up to ${target.limits.maxClients} clients`,
        target.features.advancedReminders ? 'Advanced reminders' : null,
        target.features.clientWorkspaces ? 'Client workspaces' : null,
      ].filter(Boolean),
    },
    client_limit: {
      title: 'Manage more clients',
      reason: `Your ${PLANS[effectivePlan]?.name || 'current'} plan includes ${PLANS[effectivePlan]?.limits.maxClients || 1} client${PLANS[effectivePlan]?.limits.maxClients === 1 ? '' : 's'}.`,
      benefits: [
        target.limits.maxClients === Infinity ? 'Unlimited clients' : `Up to ${target.limits.maxClients} clients`,
        `${target.limits.aiPromptsPerMonth} AI Planner prompts/month`,
        target.features.advancedReminders ? 'Advanced reminders' : null,
      ].filter(Boolean),
    },
    category_limit: {
      title: 'Need more categories?',
      reason: `Your ${PLANS[effectivePlan]?.name || 'current'} plan includes ${PLANS[effectivePlan]?.limits.maxCategories || 3} categories.`,
      benefits: [
        target.limits.maxCategories === Infinity ? 'Unlimited categories' : `Up to ${target.limits.maxCategories} categories`,
        `${target.limits.aiPromptsPerMonth} AI Planner prompts/month`,
      ].filter(Boolean),
    },
  };

  const msg = messages[limitType] || messages.ai_limit;

  return {
    targetPlan: target,
    ...msg,
    cta: `Upgrade to ${target.name}`,
  };
}
