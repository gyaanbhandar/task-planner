// constants/taskConstants.js
// ============================================
// UPDATED: SUBSCRIPTION_PLANS now sourced from plans.config.js
// All other constants remain unchanged.
// ============================================

import { PLANS, PLAN_ORDER } from '../config/plans.config';

export const CATEGORIES = [
  { id: 'personal', name: 'Personal', icon: '👤', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.08)' },
  { id: 'work', name: 'Work', icon: '💼', color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)' },
  { id: 'professional', name: 'Professional', icon: '🏢', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)' },
  { id: 'leadgen', name: 'Lead Gen', icon: '🎯', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)' },
  { id: 'clients', name: 'Clients', icon: '👥', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.08)' },
  { id: 'health', name: 'Health', icon: '❤️', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.08)' },
  { id: 'learning', name: 'Learning', icon: '📚', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.08)' },
  { id: 'finance', name: 'Finance', icon: '💳', color: '#14B8A6', bg: 'rgba(20, 184, 166, 0.08)' },
];

export const CLIENTS = [
  { id: 'abc', name: 'ABC Client' },
  { id: 'yun', name: 'YUN Client' },
  { id: 'horizon', name: 'Horizon Solutions' },
  { id: 'network', name: 'Network Scaffol' },
  { id: 'telcos', name: 'Telcos Guru' },
];

export const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#EF4444', bg: '#FEE2E2', icon: '🔺' },
  medium: { label: 'Medium', color: '#F59E0B', bg: '#FEF3C7', icon: '🔸' },
  low: { label: 'Low', color: '#10B981', bg: '#D1FAE5', icon: '🔹' },
};

export const VISUAL_THEME = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  sidebar: '#FFFFFF',
  border: '#E4E4E7',
  borderAlt: '#F4F4F5',
  text: '#0F172A',
  textSec: '#64748B',
  accent: '#6366F1',
};

// Emoji library for Icon Picker
export const EMOJI_LIBRARY = [
  '📋','📂','📁','📌','📎','📝','✏️','🖊️','📖','📚',
  '💼','🏢','👤','👥','🎯','❤️','💳','🔧','⚙️','🛠️',
  '🚀','💡','🔔','⭐','🏆','🎨','🎬','🎵','🎮','🏠',
  '🛒','📱','💻','🖥️','📊','📈','📉','🗂️','🗃️','🗄️',
  '📦','🎁','🔑','🔒','🔓','💎','🪙','💰','🏦','🏥',
  '🏫','🏗️','✈️','🚗','🚢','🔬','🧪','🧬','🌍','🌱',
  '☀️','🌙','⚡','🔥','💧','🧊','🎪','🎭','🎤','📸',
];

// ============================================
// SUBSCRIPTION_PLANS — Generated from central config
// Backward-compatible shape for existing components
// ============================================
export const SUBSCRIPTION_PLANS = PLAN_ORDER.map((planId) => {
  const plan = PLANS[planId];
  return {
    id: plan.id,
    name: plan.name,
    price_inr: plan.pricing.INR.monthly,
    price_usd: plan.pricing.USD.monthly,
    price_inr_yearly: plan.pricing.INR.yearly,
    price_usd_yearly: plan.pricing.USD.yearly,
    duration: plan.pricing.INR.monthly === 0 ? 'Forever' : '/month',
    badge: plan.badge,
    positioning: plan.positioning,
    cta: plan.cta,
    ctaTrial: plan.ctaTrial || null,
    ctaSubtext: plan.ctaSubtext || null,
    isRecommended: plan.isRecommended || false,
    isComingSoon: plan.isComingSoon || false,
    features: plan.featureList,
  };
});
