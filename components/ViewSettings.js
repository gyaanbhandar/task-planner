'use client';
import React, { useState, useEffect } from 'react';
import { VISUAL_THEME, SUBSCRIPTION_PLANS } from '../constants/taskConstants';
import { authService } from '../services/authService';
import { PLAN_LIMITS } from '../services/subscriptionService';

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

  // Notification states
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifStatus, setNotifStatus] = useState('Disabled');
  const [isIOS, setIsIOS] = useState(false);

  // Subscription info from profile
  const currentPlan = userProfile?.subscription_plan || 'free_trial';
  const subscriptionStatus = userProfile?.subscription_status || 'trial';
  
  // Trial calculation
  const trialEnd = userProfile?.trial_end ? new Date(userProfile.trial_end) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
  const isTrialActive = currentPlan === 'free_trial' && trialDaysLeft > 0;
  const isTrialExpired = currentPlan === 'free_trial' && trialDaysLeft <= 0;

  useEffect(() => {
    if (userProfile?.full_name) setName(userProfile.full_name);
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

  const handleUpdateProfile = async () => {
    setSaving(true); setMessage('');
    try {
      await authService.updateProfile({ full_name: name });
      setMessage('Profile updated! Refresh to see name change in sidebar.');
    } catch (err) { setMessage('Error: ' + err.message); }
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) { setMessage('Password minimum 6 characters hona chahiye'); return; }
    if (newPassword !== confirmPassword) { setMessage('Dono passwords match nahi kar rahe'); return; }
    setSaving(true); setMessage('');
    try {
      await authService.updatePassword(newPassword);
      setMessage('Password updated!');
      setNewPassword(''); setConfirmPassword('');
    } catch (err) { setMessage('Error: ' + err.message); }
    setSaving(false);
  };

  const handleActivatePlan = async (planId) => {
    if (planId === currentPlan) return;
    setActivatingPlan(planId);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, planId, action: 'activate' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`${planId === 'starter' ? 'Starter' : planId === 'pro' ? 'Pro' : 'Trial'} plan activated! 🎉`);
        // Refresh profile
        if (onProfileUpdate) {
          const updated = { ...userProfile, subscription_plan: planId, subscription_status: planId === 'free_trial' ? 'trial' : 'active' };
          onProfileUpdate(updated);
        }
      } else {
        setMessage('Error: ' + (data.error || 'Plan activation failed'));
      }
    } catch (e) {
      setMessage('Error: ' + e.message);
    }
    setActivatingPlan(null);
  };

  const handleNotifToggle = async () => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) { alert('Aapka browser notifications support nahi karta.'); return; }
    
    if (isIOS && Notification.permission !== 'granted') {
      alert("📱 iPhone Users:\n\n1. Safari mein Share button pe tap karo\n2. 'Add to Home Screen' select karo\n3. Home screen se app kholke toggle ON karo");
      return;
    }
    if (Notification.permission === 'denied') {
      alert("🔒 Browser ne block kiya hai!\n\n1. URL ke paas 🔒 icon pe click karo\n2. 'Site Settings' → 'Notifications' → 'Allow' karo\n3. Page refresh karo");
      return;
    }

    if (!notifEnabled) {
      try {
        let perm = Notification.permission;
        if (perm !== 'granted') perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setNotifEnabled(true);
          setNotifStatus('Active ✅');
          localStorage.setItem('notifications_enabled', 'true');
          new Notification("AnuTask 🔔", { body: "Notifications activated! Ab task reminders aayenge.", icon: '⚡' });
        } else {
          setNotifStatus('Blocked by browser');
          localStorage.setItem('notifications_enabled', 'false');
        }
      } catch (e) { console.error(e); }
    } else {
      setNotifEnabled(false);
      setNotifStatus('Disabled');
      localStorage.setItem('notifications_enabled', 'false');
    }
  };

  const handleTestNotif = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
    
    if ('Notification' in window && Notification.permission === 'granted' && notifEnabled) {
      new Notification("🔔 Test Alert — AnuTask", { 
        body: "Sound + Notification dono kaam kar rahe hain!",
        icon: '⚡',
        tag: 'test-notification'
      });
    } else {
      alert("🔊 Sound test done!\n\nActual notification ke liye pehle toggle ON karo aur browser permission allow karo.");
    }
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'billing', label: '💳 Billing' },
    { id: 'password', label: '🔒 Password' },
    { id: 'notifications', label: '🔔 Notifications' }
  ];

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' };
  const cardStyle = { background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '700px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 4px 0' }}>⚙️ Settings</h2>
        <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>Manage your profile, billing, password and notifications</p>
      </div>

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
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                <div style={{ fontSize: '11px', marginTop: '4px', padding: '2px 8px', background: currentPlan === 'pro' ? '#EEF2FF' : currentPlan === 'starter' ? '#ECFDF5' : '#FEF3C7', color: currentPlan === 'pro' ? '#4338CA' : currentPlan === 'starter' ? '#059669' : '#D97706', borderRadius: '4px', fontWeight: 600, display: 'inline-block' }}>
                  {currentPlan === 'pro' ? '⭐ Pro' : currentPlan === 'starter' ? '🚀 Starter' : '🎁 Free Trial'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Apna naam daalo" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={email} disabled style={{ ...inputStyle, background: '#E2E8F0', cursor: 'not-allowed' }} />
                <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec, marginTop: '4px', display: 'block' }}>Email change karne ke liye Supabase dashboard use karo</span>
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
          {/* Current Status */}
          <div style={{ ...cardStyle, background: isTrialActive ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' : isTrialExpired ? 'linear-gradient(135deg, #FEF2F2, #FECACA)' : 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: VISUAL_THEME.text }}>
                  {isTrialActive ? '🎉 Free Trial Active' : isTrialExpired ? '⚠️ Trial Expired' : `✅ ${currentPlan === 'starter' ? 'Starter' : 'Pro'} Plan Active`}
                </h3>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
                  {isTrialActive ? `${trialDaysLeft} din baaki hain 14-day free trial mein` : isTrialExpired ? 'Trial khatam ho gaya. Plan choose karo neche se.' : `Your ${currentPlan === 'starter' ? 'Starter (₹99/mo)' : 'Pro (₹249/mo)'} plan is active.`}
                </p>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: '20px', background: isTrialActive ? 'rgba(99,102,241,0.12)' : isTrialExpired ? '#FEE2E2' : '#D1FAE5', color: isTrialActive ? VISUAL_THEME.accent : isTrialExpired ? '#EF4444' : '#059669', fontSize: '12px', fontWeight: 700 }}>
                {isTrialActive ? `${trialDaysLeft} days left` : isTrialExpired ? 'Expired' : 'Active'}
              </div>
            </div>
            {isTrialActive && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((14 - trialDaysLeft) / 14) * 100}%`, background: VISUAL_THEME.accent, borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}
          </div>

          {/* AI Usage */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0' }}>🧠 AI Planner Usage</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: VISUAL_THEME.text }}>{userProfile?.ai_prompts_used || 0}</span>
              <span style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>/ {PLAN_LIMITS[currentPlan]?.ai_prompts_per_month || 10} prompts used this month</span>
            </div>
            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', maxWidth: '300px' }}>
              <div style={{ height: '100%', width: `${Math.min(100, ((userProfile?.ai_prompts_used || 0) / (PLAN_LIMITS[currentPlan]?.ai_prompts_per_month || 10)) * 100)}%`, background: VISUAL_THEME.accent, borderRadius: '3px' }} />
            </div>
          </div>

          {/* Plans Comparison */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>📋 Choose Your Plan</h3>
            <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: '-12px 0 20px 0' }}>Payment gateway coming soon — abhi backend se plan activate hoga.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {SUBSCRIPTION_PLANS.map(plan => {
                const isCurrentPlan = plan.id === currentPlan;
                const isPro = plan.id === 'pro';
                return (
                  <div key={plan.id} style={{
                    padding: '20px', borderRadius: '16px', textAlign: 'center',
                    border: isCurrentPlan ? `2px solid ${VISUAL_THEME.accent}` : isPro ? '2px solid #8B5CF6' : `1px solid ${VISUAL_THEME.border}`,
                    background: isCurrentPlan ? 'rgba(99,102,241,0.04)' : isPro ? 'rgba(139,92,246,0.02)' : '#FFFFFF',
                    position: 'relative'
                  }}>
                    {plan.badge && (
                      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', padding: '2px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, background: isCurrentPlan ? VISUAL_THEME.accent : isPro ? '#8B5CF6' : '#F59E0B', color: '#FFF' }}>
                        {isCurrentPlan ? 'CURRENT' : plan.badge}
                      </div>
                    )}
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', marginTop: '8px' }}>{plan.name}</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: VISUAL_THEME.text, marginBottom: '4px' }}>
                      {plan.price_inr === 0 ? 'Free' : `₹${plan.price_inr}`}
                    </div>
                    <div style={{ fontSize: '12px', color: VISUAL_THEME.textSec, marginBottom: '16px' }}>
                      {plan.price_usd > 0 ? `$${plan.price_usd} ${plan.duration}` : plan.duration}
                    </div>
                    
                    <div style={{ textAlign: 'left', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                      {plan.features.slice(0, 6).map((f, i) => (
                        <div key={i} style={{ padding: '3px 0', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                      {plan.features.length > 6 && (
                        <div style={{ padding: '3px 0', fontSize: '11px', color: VISUAL_THEME.textSec }}>
                          + {plan.features.length - 6} more features
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleActivatePlan(plan.id)}
                      disabled={isCurrentPlan || activatingPlan === plan.id}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: isCurrentPlan ? 'default' : 'pointer',
                        background: isCurrentPlan ? '#E2E8F0' : isPro ? '#8B5CF6' : VISUAL_THEME.accent,
                        color: isCurrentPlan ? '#64748B' : '#FFF',
                        border: 'none',
                        opacity: activatingPlan === plan.id ? 0.6 : 1
                      }}
                    >
                      {isCurrentPlan ? '✓ Current Plan' : activatingPlan === plan.id ? 'Activating...' : `Select ${plan.name}`}
                    </button>
                  </div>
                );
              })}
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
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Dobara password daalo" style={inputStyle} />
            </div>
            <button onClick={handleUpdatePassword} disabled={saving} style={{ padding: '12px', background: '#0F172A', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, alignSelf: 'flex-start' }}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* =================== NOTIFICATIONS TAB =================== */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0' }}>Desktop & Sound Alerts</h3>
                <p style={{ fontSize: '13px', margin: 0, color: VISUAL_THEME.textSec }}>
                  Status: <span style={{ color: notifEnabled ? '#16a34a' : '#EF4444', fontWeight: 700 }}>{notifStatus}</span>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={handleTestNotif} style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  🔊 Test
                </button>
                <div onClick={handleNotifToggle} style={{ width: '50px', height: '26px', backgroundColor: notifEnabled ? '#6366f1' : '#cbd5e1', borderRadius: '20px', padding: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: notifEnabled ? 'flex-end' : 'flex-start', transition: 'background-color 0.2s', boxSizing: 'border-box' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#ffffff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0' }}>Kaise Kaam Karta Hai?</h3>
            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '8px' }}>• Jab aapke <strong>Today's Tasks</strong> ka exact time aayega (jaise 02:30 PM), tab Windows/Mac pe notification popup aayega screen ke corner mein.</p>
              <p style={{ marginBottom: '8px' }}>• Saath mein 🔔 sound bhi bajegi taaki koi task miss na ho.</p>
              <p style={{ marginBottom: '8px' }}>• <strong>Zaroori:</strong> Browser mein notification permission "Allow" karna padega — toggle ON karne pe browser permission poochega.</p>
              <p>• Windows pe notifications <strong>Action Center</strong> mein bhi dikhenge (taskbar ke right side mein).</p>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: message.startsWith('Error') ? '#FEE2E2' : '#ECFDF5', color: message.startsWith('Error') ? '#EF4444' : '#059669', fontSize: '13px', fontWeight: 600 }}>
          {message}
        </div>
      )}
    </div>
  );
}
