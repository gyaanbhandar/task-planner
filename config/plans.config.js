// config/plans.config.js
// ============================================
// SINGLE SOURCE OF TRUTH — All pricing, limits, features
// Change prices HERE and they update everywhere.
// ============================================

export const PLAN_IDS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  BUSINESS: 'business',
  // Legacy (for existing trial users — maps to 'free' after trial)
  FREE_TRIAL: 'free_trial',
};

export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const CURRENCIES = {
  INR: 'INR',
  USD: 'USD',
};

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
};

// ============================================
// PLAN DEFINITIONS
// ============================================

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    badge: 'FREE FOREVER',
    positioning: 'Try AnuTask and organize your daily work.',
    cta: 'Start Free',
    ctaSubtext: 'No credit card required',
    pricing: {
      INR: { monthly: 0, yearly: 0 },
      USD: { monthly: 0, yearly: 0 },
    },
    limits: {
      maxClients: 1,
      maxCategories: 3,
      aiPromptsPerMonth: 10,
      maxRecurringTasks: Infinity,
      maxActiveTasks: Infinity,
      maxTeamMembers: 1,
    },
    features: {
      unlimitedTasks: true,
      todayView: true,
      calendarView: true,
      listView: true,
      recurringTasks: true,
      basicReminders: true,
      advancedReminders: false,
      dragAndDrop: true,
      basicExport: true,
      fullExport: false,
      priorityBadges: false,
      clientOrganization: false,
      clientWorkspaces: false,
      advancedAiScheduling: false,
      priorityScheduling: false,
      prioritySupport: false,
      teamAccess: false,
      adminDashboard: false,
      rolePermissions: false,
      sharedWorkspace: false,
    },
    featureList: [
      'Unlimited active tasks',
      '1 client',
      '3 categories',
      '10 AI Planner prompts/month',
      'Today, Calendar & List views',
      'Recurring tasks',
      'Basic reminders',
      'Drag-and-drop ordering',
      'Basic task export',
    ],
    exportFormats: ['csv'],
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    badge: 'POPULAR',
    positioning: 'For freelancers and solo professionals.',
    cta: 'Start Starter',
    ctaSubtext: null,
    pricing: {
      INR: { monthly: 199, yearly: 1990 },
      USD: { monthly: 5, yearly: 50 },
    },
    limits: {
      maxClients: 5,
      maxCategories: Infinity,
      aiPromptsPerMonth: 50,
      maxRecurringTasks: Infinity,
      maxActiveTasks: Infinity,
      maxTeamMembers: 1,
    },
    features: {
      unlimitedTasks: true,
      todayView: true,
      calendarView: true,
      listView: true,
      recurringTasks: true,
      basicReminders: true,
      advancedReminders: true,
      dragAndDrop: true,
      basicExport: true,
      fullExport: true,
      priorityBadges: true,
      clientOrganization: true,
      clientWorkspaces: false,
      advancedAiScheduling: false,
      priorityScheduling: false,
      prioritySupport: false,
      teamAccess: false,
      adminDashboard: false,
      rolePermissions: false,
      sharedWorkspace: false,
    },
    featureList: [
      'Unlimited active tasks',
      'Up to 5 clients',
      'Unlimited categories',
      '50 AI Planner prompts/month',
      'Today, Calendar & List views',
      'Recurring tasks',
      'Advanced reminders',
      'Drag-and-drop ordering',
      'Task export (CSV & JSON)',
      'Client organization',
      'Priority badges',
    ],
    exportFormats: ['csv', 'json'],
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    badge: 'BEST VALUE',
    positioning: 'For professionals managing multiple clients and deadlines.',
    cta: 'Start Pro',
    ctaTrial: 'Start Pro Trial',
    ctaSubtext: '14-day Pro trial',
    isRecommended: true,
    pricing: {
      INR: { monthly: 499, yearly: 4990 },
      USD: { monthly: 12, yearly: 120 },
    },
    limits: {
      maxClients: Infinity,
      maxCategories: Infinity,
      aiPromptsPerMonth: 150,
      maxRecurringTasks: Infinity,
      maxActiveTasks: Infinity,
      maxTeamMembers: 1,
    },
    features: {
      unlimitedTasks: true,
      todayView: true,
      calendarView: true,
      listView: true,
      recurringTasks: true,
      basicReminders: true,
      advancedReminders: true,
      dragAndDrop: true,
      basicExport: true,
      fullExport: true,
      priorityBadges: true,
      clientOrganization: true,
      clientWorkspaces: true,
      advancedAiScheduling: true,
      priorityScheduling: true,
      prioritySupport: true,
      teamAccess: false,
      adminDashboard: false,
      rolePermissions: false,
      sharedWorkspace: false,
    },
    featureList: [
      'Unlimited active tasks',
      'Unlimited clients',
      'Unlimited categories',
      '150 AI Planner prompts/month',
      'Advanced AI scheduling',
      'Client workspaces',
      'Recurring tasks',
      'Advanced reminders',
      'Full task export',
      'Priority scheduling',
      'Priority support',
    ],
    exportFormats: ['csv', 'json'],
  },

  business: {
    id: 'business',
    name: 'Business',
    badge: 'COMING SOON',
    positioning: 'For small teams managing shared work.',
    cta: 'Coming Soon',
    ctaSubtext: null,
    isComingSoon: true,
    pricing: {
      INR: { monthly: 999, yearly: 9990 },
      USD: { monthly: 25, yearly: 250 },
    },
    limits: {
      maxClients: Infinity,
      maxCategories: Infinity,
      aiPromptsPerMonth: 500,
      maxRecurringTasks: Infinity,
      maxActiveTasks: Infinity,
      maxTeamMembers: 5,
    },
    features: {
      unlimitedTasks: true,
      todayView: true,
      calendarView: true,
      listView: true,
      recurringTasks: true,
      basicReminders: true,
      advancedReminders: true,
      dragAndDrop: true,
      basicExport: true,
      fullExport: true,
      priorityBadges: true,
      clientOrganization: true,
      clientWorkspaces: true,
      advancedAiScheduling: true,
      priorityScheduling: true,
      prioritySupport: true,
      teamAccess: true,
      adminDashboard: true,
      rolePermissions: true,
      sharedWorkspace: true,
    },
    featureList: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared workspace',
      'Team task management',
      'Admin dashboard',
      'Role permissions',
      'Higher AI usage (500/month)',
      'Priority support',
    ],
    exportFormats: ['csv', 'json'],
  },
};

// ============================================
// PLAN ORDER (for display)
// ============================================
export const PLAN_ORDER = ['free', 'starter', 'pro', 'business'];
export const PURCHASABLE_PLANS = ['starter', 'pro', 'business'];

// ============================================
// TRIAL CONFIG
// ============================================
export const TRIAL_CONFIG = {
  durationDays: 14,
  trialPlanLevel: 'pro', // Trial gives Pro-level access
};

// ============================================
// SUBSCRIPTION STATUSES
// ============================================
export const SUB_STATUS = {
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELING: 'canceling',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
  FREE: 'free',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/** Get plan config by ID */
export function getPlan(planId) {
  // Map legacy IDs
  if (planId === 'free_trial') return PLANS.pro; // Trial = Pro-level access
  return PLANS[planId] || PLANS.free;
}

/** Get price for plan in given currency and cycle */
export function getPlanPrice(planId, currency = 'INR', cycle = 'monthly') {
  const plan = PLANS[planId];
  if (!plan) return 0;
  return plan.pricing[currency]?.[cycle] ?? 0;
}

/** Format price with currency symbol */
export function formatPrice(amount, currency = 'INR') {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  if (amount === 0) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

/** Get annual savings text */
export function getAnnualSavingsText() {
  return 'Save 2 months';
}

/** Get AI prompt limit for a plan */
export function getAiPromptLimit(planId) {
  const plan = getPlan(planId);
  return plan?.limits?.aiPromptsPerMonth ?? 10;
}

/** Get display limit text (handles Infinity) */
export function formatLimit(value) {
  if (value === Infinity || value >= 999) return 'Unlimited';
  return String(value);
}

// ============================================
// FEATURE COMPARISON TABLE DATA
// ============================================
export const COMPARISON_SECTIONS = [
  {
    title: 'Task Management',
    rows: [
      { label: 'Active Tasks', free: 'Unlimited', starter: 'Unlimited', pro: 'Unlimited', business: 'Unlimited' },
      { label: 'Recurring Tasks', free: true, starter: true, pro: true, business: true },
      { label: 'Drag-and-drop', free: true, starter: true, pro: true, business: true },
      { label: 'Priority Badges', free: false, starter: true, pro: true, business: true },
    ],
  },
  {
    title: 'AI Planner',
    rows: [
      { label: 'Monthly Prompts', free: '10', starter: '50', pro: '150', business: '500' },
      { label: 'Advanced AI Scheduling', free: false, starter: false, pro: true, business: true },
    ],
  },
  {
    title: 'Client Management',
    rows: [
      { label: 'Clients', free: '1', starter: '5', pro: 'Unlimited', business: 'Unlimited' },
      { label: 'Categories', free: '3', starter: 'Unlimited', pro: 'Unlimited', business: 'Unlimited' },
      { label: 'Client Workspaces', free: false, starter: false, pro: true, business: true },
    ],
  },
  {
    title: 'Reminders & Views',
    rows: [
      { label: 'Today View', free: true, starter: true, pro: true, business: true },
      { label: 'Calendar View', free: true, starter: true, pro: true, business: true },
      { label: 'Advanced Reminders', free: false, starter: true, pro: true, business: true },
    ],
  },
  {
    title: 'Export & Collaboration',
    rows: [
      { label: 'CSV Export', free: true, starter: true, pro: true, business: true },
      { label: 'JSON Export', free: false, starter: true, pro: true, business: true },
      { label: 'Team Members', free: '1', starter: '1', pro: '1', business: 'Up to 5' },
      { label: 'Shared Workspace', free: false, starter: false, pro: false, business: true },
      { label: 'Admin Controls', free: false, starter: false, pro: false, business: true },
    ],
  },
  {
    title: 'Support',
    rows: [
      { label: 'Email Support', free: true, starter: true, pro: true, business: true },
      { label: 'Priority Support', free: false, starter: false, pro: true, business: true },
    ],
  },
];

// ============================================
// FAQ DATA
// ============================================
export const PRICING_FAQS = [
  {
    q: 'Is AnuTask free?',
    a: 'Yes. AnuTask has a Free plan that you can use without a paid subscription. It includes unlimited tasks, 1 client, 3 categories, and 10 AI Planner prompts per month.',
  },
  {
    q: 'Do I need a credit card for the trial?',
    a: 'No. You can start your 14-day Pro trial without entering any payment details.',
  },
  {
    q: 'What happens after my 14-day Pro trial?',
    a: 'Your account moves to the Free plan automatically. Your data is never deleted — tasks, clients, and categories all remain safe.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancellation stops the next renewal. Your paid access remains active until the current billing period ends.',
  },
  {
    q: 'Can I change plans?',
    a: 'Yes. You can upgrade or downgrade anytime from Settings → Billing.',
  },
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your data remains safe. Features that exceed your new plan\'s limits become restricted until you upgrade again. Nothing is deleted.',
  },
  {
    q: 'How many AI Planner prompts do I get?',
    a: 'Free: 10/month. Starter: 50/month. Pro: 150/month. Prompts reset at the start of each billing period.',
  },
  {
    q: 'Can I use AnuTask outside India?',
    a: 'Yes. International customers are billed in USD. You can switch currency from the pricing page.',
  },
];
