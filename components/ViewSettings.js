'use client';
import React, { useState, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { authService } from '../services/authService';
import { PLAN_LIMITS } from '../services/subscriptionService';
import {
  PLANS, PLAN_ORDER, CURRENCIES, CURRENCY_SYMBOLS,
  formatPrice, getAnnualSavingsText, COMPARISON_SECTIONS,
} from '../config/plans.config';
import { getEffectivePlan, getSubscriptionDisplay, getAiUsageStatus, getUpgradeSuggestion } from '../services/entitlements';

export default function ViewSettings({ session, userProfile, onProfileUpdate }) {
  const userMeta = session?.user?.user_metadata || {};
  const [name, setName] = useState(userProfile?.full_name || userMeta.full_name || '');
  const [email] = useState(session?.user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [activatingPlan, setActivatingPlan] = useState(null);

  // Billing states
  const [billingCycle, setBillingCycle] = useState(userProfile?.billing_cycle || 'monthly');
  const [currency, setCurrency] = useState(userProfile?.currency || 'INR');

  // Notification states
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifStatus, setNotifStatus] = useState('Disabled');
  const [isIOS, setIsIOS] = useState(false);

  // Computed subscription info
  const effectivePlan = getEffectivePlan(userProfile);
  const subDisplay = getSubscriptionDisplay(userProfile);
  const aiUsage = getAiUsageStatus(userProfile);

  // Trial calculation
  const currentPlan = userProfile?.subscription_plan || 'free';
  const isTrialing = currentPlan === 'free_trial' && subDisplay.isTrialing;
  const isExpired = subDisplay.isExpired;

  useEffect(() => {
    if (userProfile?.full_name) setName(userProfile.full_name);
    if (userProfile?.currency) setCurrency(userProfile.currency);
    if (userProfile?.billing_cycle) setBillingCycle(userProfile.billing_cycle);
  }, [userProfile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(ua));
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const saved = localStorage.getItem('notifications_enabled');
          const active = saved !== 'false';
          setNotifEnabled(active);
          setNotifStatus(active ? 'Active ✅' : 'Disabled');
        } else if (Notification.permission === 'denied') {
          setNotifStatus('Blocked by browser');
        }
      } else {
        setNotifStatus('Not supported');
      }
    }
  }, []);

  // =================== HANDLERS ===================

  const handleUpdateProfile = async () => {
    setSaving(true); setMessage('');
    try {
      await authService.updateProfile({ full_name: name });
      setMessage('Profile updated! Refresh to see name change in sidebar.');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) { setMessage('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setMessage('Passwords do not match'); return; }
    setSaving(true); setMessage('');
    try {
      await authService.updatePassword(newPassword);
      setMessage('Password updated!');
      setNewPassword(''); setConfirmPassword('');
    } catch (err) { setMessage('Error: ' + err.message); }
    setSaving(false);
  };

  const handleActivatePlan = async (planId) => {
    setActivatingPlan(planId);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          planId,
          action: 'activate',
          billingCycle,
          currency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        if (onProfileUpdate) {
          const updated = { ...userProfile, subscription_plan: planId, subscription_status: planId === 'free' ? 'free' : 'active', billing_cycle: billingCycle, currency };
          onProfileUpdate(updated);
        }
      } else {
        setMessage('Error: ' + (data.error || 'Something went wrong'));
      }
    } catch (err) { setMessage('Error: ' + err.message); }
    setActivatingPlan(null);
  };

  const handleToggleNotifications = async () => {
    if (typeof window === 'undefined') return;
    if (isIOS) { alert('iOS Safari does not support web push notifications. Use the PWA version or enable in iOS Settings.'); return; }
    if (!isEnabled()) {
      try {
        let perm = Notification.permission;
        if (perm !== 'granted') perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setNotifEnabled(true); setNotifStatus('Active ✅');
          localStorage.setItem('notifications_enabled', 'true');
          new Notification('AnuTask', { body: 'Notifications active ho gaye hain!' });
        } else {
          setNotifEnabled(false); setNotifStatus('Blocked ❌');
          localStorage.setItem('notifications_enabled', 'false');
        }
      } catch (e) { console.error(e); }
    } else {
      setNotifEnabled(false); setNotifStatus('Disabled ❌');
      localStorage.setItem('notifications_enabled', 'false');
    }
  };

  function isEnabled() { return notifEnabled; }

  const handleTestAlert = () => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
    if ('Notification' in window && Notification.permission === 'granted' && notifEnabled) {
      new Notification('AnuTask Test Alert 🔔', { body: 'Sound and Desktop Alert test successful!', tag: 'test-notification' });
    } else {
      alert('🔊 Sound test done!\n\nFor notifications, enable toggle first and allow browser permission.');
    }
  };

  // =================== STYLES ===================

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'billing', label: '💳 Billing' },
    { id: 'password', label: '🔒 Password' },
    { id: 'notifications', label: '🔔 Notifications' },
  ];

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' };
  const cardStyle = { background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', boxSizing: 'border-box' };

  const getPrice = (planId) => {
    const plan = PLANS[planId];
    if (!plan) return 0;
    return plan.pricing[currency]?.[billingCycle] ?? 0;
  };

  return (
    <div style={{ maxWidth: '700px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 4px 0' }}>⚙️ Settings</h2>
        <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>Manage your profile, billing, password and notifications</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#F4F4F5', borderRadius: '12px', padding: '4px', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: '10px', border: 'none',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? VISUAL_THEME.accent : VISUAL_THEME.textSec,
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: 500, background: message.startsWith('Error') ? '#FEF2F2' : '#ECFDF5', color: message.startsWith('Error') ? '#DC2626' : '#059669' }}>
          {message}
        </div>
      )}

      {/* =================== PROFILE TAB =================== */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(99,102,241,0.1)', color: VISUAL_THEME.accent, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', flexShrink: 0 }}>
                {(name || email)[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: VISUAL_THEME.text }}>{name || 'Set your name'}</div>
                <div style={{ fontSize: '13px', color: VISUAL_THEME.textSec }}>{email}</div>
                <div style={{
                  fontSize: '11px', marginTop: '4px', padding: '2px 8px',
                  background: subDisplay.bgColor, color: subDisplay.color,
                  borderRadius: '4px', fontWeight: 600, display: 'inline-block',
                }}>
                  {subDisplay.badge}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={email} disabled style={{ ...inputStyle, background: '#E2E8F0', cursor: 'not-allowed' }} />
              </div>
              <button onClick={handleUpdateProfile} disabled={saving} style={{ padding: '12px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, alignSelf: 'flex-start' }}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== BILLING TAB =================== */}
      {activeTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 1. Current Plan Status Card */}
          <div style={{
            ...cardStyle,
            background: isTrialing ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
              : isExpired ? 'linear-gradient(135deg, #FEF2F2, #FECACA)'
              : subDisplay.isPastDue ? 'linear-gradient(135deg, #FEF2F2, #FECACA)'
              : 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: VISUAL_THEME.text }}>
                  {isTrialing ? '🎉 Pro Trial Active' : isExpired ? '⚠️ Trial Ended' : subDisplay.isPastDue ? '⚠️ Payment Failed' : `✅ ${subDisplay.badge} Plan Active`}
                </h3>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
                  {subDisplay.statusText}
                </p>
                {userProfile?.current_period_end && !isTrialing && !isExpired && effectivePlan !== 'free' && (
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>
                    Next billing: {new Date(userProfile.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div style={{ padding: '8px 16px', borderRadius: '20px', background: subDisplay.bgColor, color: subDisplay.color, fontSize: '12px', fontWeight: 700 }}>
                {isTrialing ? `${subDisplay.daysLeft} days left` : isExpired ? 'Expired' : subDisplay.isCanceling ? 'Canceling' : 'Active'}
              </div>
            </div>
            {/* Trial progress bar */}
            {isTrialing && subDisplay.daysLeft !== undefined && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((14 - subDisplay.daysLeft) / 14) * 100}%`, background: VISUAL_THEME.accent, borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: '11px', color: '#6366F1', marginTop: '6px' }}>
                  {subDisplay.daysLeft} of 14 days remaining — Upgrade now to keep Pro features
                </p>
              </div>
            )}
            {/* Expired CTA */}
            {isExpired && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 8px' }}>
                  Your Pro trial has ended. Your account is now on the Free plan. Your data is safe — upgrade anytime to unlock full features.
                </p>
              </div>
            )}
          </div>

          {/* 2. AI Planner Usage */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0' }}>🧠 AI Planner Usage</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: VISUAL_THEME.text }}>{aiUsage.used}</span>
              <span style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>/ {aiUsage.limit} prompts used this month</span>
            </div>
            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', maxWidth: '400px' }}>
              <div style={{
                height: '100%',
                width: `${aiUsage.percentUsed}%`,
                background: aiUsage.percentUsed > 80 ? '#EF4444' : aiUsage.percentUsed > 60 ? '#F59E0B' : VISUAL_THEME.accent,
                borderRadius: '3px', transition: 'width 0.3s',
              }} />
            </div>
            {aiUsage.remaining <= 3 && aiUsage.remaining > 0 && (
              <p style={{ fontSize: '12px', color: '#F59E0B', marginTop: '8px', fontWeight: 600 }}>
                ⚠️ {aiUsage.remaining} prompt{aiUsage.remaining !== 1 ? 's' : ''} remaining
              </p>
            )}
            {!aiUsage.allowed && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#FEF2F2', borderRadius: '10px' }}>
                <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 600, margin: '0 0 4px' }}>
                  You&apos;ve reached your monthly AI Planner limit.
                </p>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  Upgrade your plan for more AI planning prompts.
                </p>
              </div>
            )}
          </div>

          {/* 3. Billing Cycle + Currency Toggles */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Monthly / Yearly */}
            <div style={{ display: 'flex', background: '#F4F4F5', borderRadius: '10px', padding: '3px', gap: '2px' }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  background: billingCycle === 'monthly' ? VISUAL_THEME.accent : 'transparent',
                  color: billingCycle === 'monthly' ? '#FFF' : '#64748B',
                }}
              >Monthly</button>
              <button
                onClick={() => setBillingCycle('yearly')}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  background: billingCycle === 'yearly' ? VISUAL_THEME.accent : 'transparent',
                  color: billingCycle === 'yearly' ? '#FFF' : '#64748B',
                }}
              >Yearly</button>
            </div>
            {billingCycle === 'yearly' && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', background: '#ECFDF5', padding: '4px 12px', borderRadius: '12px' }}>
                {getAnnualSavingsText()}
              </span>
            )}

            {/* Currency */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Currency:</span>
              <div style={{ display: 'flex', background: '#F4F4F5', borderRadius: '8px', padding: '2px', gap: '2px' }}>
                {Object.keys(CURRENCIES).map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      background: currency === cur ? '#0F172A' : 'transparent',
                      color: currency === cur ? '#FFF' : '#64748B',
                    }}
                  >{cur}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Plan Cards */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>📋 Choose Your Plan</h3>
            <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: '0 0 20px 0' }}>
              Payment gateway coming soon — plans shown for preview.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {PLAN_ORDER.map(planId => {
                const plan = PLANS[planId];
                const isCurrentPlan = effectivePlan === planId;
                const isPro = plan.isRecommended;
                const isComingSoon = plan.isComingSoon;
                const price = getPrice(planId);

                return (
                  <div key={planId} style={{
                    padding: '20px', borderRadius: '16px', textAlign: 'center',
                    border: isCurrentPlan ? `2px solid ${VISUAL_THEME.accent}` : isPro ? `2px solid rgba(99,102,241,0.3)` : `1px solid ${VISUAL_THEME.border}`,
                    background: isCurrentPlan ? 'rgba(99,102,241,0.03)' : '#FFFFFF',
                    position: 'relative',
                    opacity: isComingSoon ? 0.8 : 1,
                  }}>
                    {/* Badge */}
                    <div style={{
                      position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                      background: isCurrentPlan ? VISUAL_THEME.accent : isPro ? VISUAL_THEME.accent : plan.badge === 'POPULAR' ? '#F59E0B' : plan.badge === 'FREE FOREVER' ? '#10B981' : '#7C3AED',
                      color: '#FFF', padding: '3px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                      {isCurrentPlan ? 'CURRENT' : plan.badge}
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '8px 0 4px' }}>{plan.name}</h4>

                    {/* Price */}
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>
                        {price === 0 ? 'Free' : formatPrice(price, currency)}
                      </span>
                      {price > 0 && (
                        <span style={{ fontSize: '13px', color: '#64748B' }}>
                          {billingCycle === 'yearly' ? '/year' : '/month'}
                        </span>
                      )}
                    </div>

                    {/* Key features */}
                    <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                      {plan.featureList.slice(0, 5).map((f, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                          <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                      {plan.featureList.length > 5 && (
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                          + {plan.featureList.length - 5} more features
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    {isComingSoon ? (
                      <button disabled style={{
                        width: '100%', padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'not-allowed',
                        background: '#F1F5F9', color: '#94A3B8', border: '1px dashed #CBD5E1',
                      }}>
                        Coming Soon
                      </button>
                    ) : (
                      <button
                        onClick={() => !isCurrentPlan && handleActivatePlan(planId)}
                        disabled={isCurrentPlan || activatingPlan === planId}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '13px',
                          cursor: isCurrentPlan ? 'default' : 'pointer',
                          background: isCurrentPlan ? '#E2E8F0' : VISUAL_THEME.accent,
                          color: isCurrentPlan ? '#64748B' : '#FFF',
                          border: 'none',
                          opacity: activatingPlan === planId ? 0.6 : 1,
                        }}
                      >
                        {isCurrentPlan ? '✓ Current Plan' : activatingPlan === planId ? 'Processing...' : `🔒 Payment Gateway Coming Soon`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Payment Info (placeholder) */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>💳 Payment Information</h3>
            <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
              Payment gateway integration coming soon. You&apos;ll be able to manage your payment method, view invoices, and update billing details here.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981' }}>
                <span>🔒</span> Secure checkout
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981' }}>
                <span>↩️</span> Cancel anytime
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981' }}>
                <span>📋</span> No hidden fees
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== PASSWORD TAB =================== */}
      {activeTab === 'password' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>🔒 Change Password</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" style={inputStyle} />
            </div>
            <button onClick={handleUpdatePassword} disabled={saving} style={{ padding: '12px', background: '#0F172A', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, alignSelf: 'flex-start' }}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* =================== NOTIFICATIONS TAB =================== */}
      {activeTab === 'notifications' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>🔔 Notification Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text }}>Desktop Notifications</div>
                <div style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>{notifStatus}</div>
              </div>
              <button
                onClick={handleToggleNotifications}
                style={{
                  padding: '6px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  background: notifEnabled ? '#DC2626' : '#10B981', color: '#FFF',
                }}
              >
                {notifEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
            {isIOS && (
              <div style={{ padding: '12px', background: '#FEF3C7', borderRadius: '10px', fontSize: '13px', color: '#92400E' }}>
                ⚠️ iOS Safari has limited notification support. For best experience, add AnuTask to your Home Screen.
              </div>
            )}
            <button
              onClick={handleTestAlert}
              style={{ padding: '10px', background: '#F1F5F9', color: '#475569', border: '1px solid #E4E4E7', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              🔊 Test Sound & Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
