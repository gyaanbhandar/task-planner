'use client';
import React, { useState } from 'react';
import { VISUAL_THEME, SUBSCRIPTION_PLANS } from '../constants/taskConstants';
import { authService } from '../services/authService';

export default function ViewProfile({ session }) {
  const userMeta = session?.user?.user_metadata || {};
  const [name, setName] = useState(userMeta.full_name || '');
  const [email] = useState(session?.user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [paymentMode, setPaymentMode] = useState('auto'); // 'auto' or 'manual'
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Calculate trial info (mock — in production, read from profiles table)
  const joinDate = new Date(session?.user?.created_at || Date.now());
  const trialEndDate = new Date(joinDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const trialDaysLeft = Math.max(0, Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24)));
  const isTrialActive = trialDaysLeft > 0;

  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      await authService.updateProfile({ full_name: name });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await authService.updatePassword(newPassword);
      setMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
    setSaving(false);
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: `1px solid ${VISUAL_THEME.border}`,
    padding: '24px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1px solid ${VISUAL_THEME.border}`,
    fontSize: '14px',
    background: '#F8FAFC',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
      
      {/* Subscription Status */}
      <div style={{ ...cardStyle, background: isTrialActive ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' : '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: VISUAL_THEME.text }}>
              {isTrialActive ? '🎉 Free Trial Active' : '📋 Subscription Status'}
            </h3>
            <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
              {isTrialActive
                ? `${trialDaysLeft} days remaining in your 14-day free trial`
                : 'Your trial has expired. Choose a plan to continue.'
              }
            </p>
          </div>
          <div style={{
            padding: '8px 16px',
            borderRadius: '20px',
            background: isTrialActive ? 'rgba(99,102,241,0.12)' : '#FEE2E2',
            color: isTrialActive ? VISUAL_THEME.accent : '#EF4444',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {isTrialActive ? `${trialDaysLeft} days left` : 'Expired'}
          </div>
        </div>

        {/* Trial Progress Bar */}
        {isTrialActive && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((14 - trialDaysLeft) / 14) * 100}%`, background: VISUAL_THEME.accent, borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Payment Mode Toggle */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: VISUAL_THEME.text }}>💳 Payment Mode</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setPaymentMode('auto')}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: paymentMode === 'auto' ? `2px solid ${VISUAL_THEME.accent}` : `1px solid ${VISUAL_THEME.border}`,
              background: paymentMode === 'auto' ? 'rgba(99,102,241,0.04)' : '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>🔄</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '4px' }}>Auto-Pay</div>
            <div style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>Automatic monthly deduction. Recommended for uninterrupted access.</div>
            {paymentMode === 'auto' && <div style={{ fontSize: '11px', color: VISUAL_THEME.accent, fontWeight: 700, marginTop: '8px' }}>✓ Selected</div>}
          </button>
          <button
            onClick={() => setPaymentMode('manual')}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: paymentMode === 'manual' ? `2px solid ${VISUAL_THEME.accent}` : `1px solid ${VISUAL_THEME.border}`,
              background: paymentMode === 'manual' ? 'rgba(99,102,241,0.04)' : '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>🏦</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '4px' }}>Manual Payment</div>
            <div style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>Pay manually each month via UPI/bank transfer before renewal.</div>
            {paymentMode === 'manual' && <div style={{ fontSize: '11px', color: VISUAL_THEME.accent, fontWeight: 700, marginTop: '8px' }}>✓ Selected</div>}
          </button>
        </div>
      </div>

      {/* Profile Settings */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: VISUAL_THEME.text }}>👤 Profile Settings</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" value={email} disabled style={{ ...inputStyle, background: '#E2E8F0', cursor: 'not-allowed' }} />
            <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec, marginTop: '4px', display: 'block' }}>Email changes require re-verification</span>
          </div>
          <button onClick={handleUpdateProfile} disabled={saving} style={{ padding: '12px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, alignSelf: 'flex-start' }}>
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </div>

      {/* Password Update */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: VISUAL_THEME.text }}>🔒 Change Password</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" style={inputStyle} />
          </div>
          <button onClick={handleUpdatePassword} disabled={saving} style={{ padding: '12px', background: '#0F172A', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, alignSelf: 'flex-start' }}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: message.startsWith('Error') ? '#FEE2E2' : '#ECFDF5',
          color: message.startsWith('Error') ? '#EF4444' : '#059669',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
