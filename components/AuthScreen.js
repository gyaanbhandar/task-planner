'use client';
import React, { useState, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ onLogin }) {
  // mode: 'login' | 'signup' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Detect entry mode:
  //  - ?mode=signup  -> open Sign Up
  //  - recovery token in URL (from the reset email) -> show "set new password"
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1) Reset-password link detection.
    // Supabase puts the token in the URL hash: #access_token=...&type=recovery
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const looksLikeRecovery =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      hash.includes('access_token'); // recovery links also carry an access_token

    if (looksLikeRecovery && hash.includes('type=recovery')) {
      setMode('reset');
    }

    // Supabase fires PASSWORD_RECOVERY when it processes a recovery link.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('reset');
    });

    // 2) Signup mode from the homepage buttons.
    try {
      const params = new URLSearchParams(search);
      if (params.get('mode') === 'signup') setMode('signup');
    } catch (e) { /* no-op */ }

    return () => { try { subscription.unsubscribe(); } catch (e) {} };
  }, []);

  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

  // ---- Forgot password: send reset email ----
  const handleForgot = async () => {
    setError(''); setSuccess('');
    if (!email) { setError('Enter the email address your account is registered with'); return; }
    setLoading(true);
    try {
      await authService.sendPasswordReset(email);
      setSuccess('✅ Password reset link sent to your email. Check your inbox (and spam folder). The link expires in 1 hour, so please open it soon.');
    } catch (err) {
      setError('❌ Could not send the reset email — ' + (err.message || 'please try again'));
    }
    setLoading(false);
  };

  // ---- Reset: set the new password ----
  const handleReset = async () => {
    setError(''); setSuccess('');
    if (!password || password.length < 6) { setError('🔑 New password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('🔑 The two passwords do not match'); return; }
    setLoading(true);
    try {
      await authService.updatePassword(password);
      setSuccess('✅ Password updated! Taking you to your dashboard...');
      // Clean the recovery token out of the URL.
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {}
      // The recovery link already created a valid session, so log the user
      // straight in with their new password set.
      const sess = await authService.getSession();
      setTimeout(() => {
        if (sess && typeof onLogin === 'function') {
          onLogin(sess);
        } else {
          setMode('login'); setPassword(''); setConfirmPassword(''); setSuccess('');
        }
      }, 1200);
    } catch (err) {
      setError('❌ Password update failed — ' + (err.message || 'the link may have expired; request a new reset email'));
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (mode === 'forgot') return handleForgot();
    if (mode === 'reset') return handleReset();

    const isLogin = mode === 'login';
    if (!email || !password) { setError('Enter both email and password'); return; }
    if (!isLogin && !name.trim()) { setError('Name is required — please enter your name'); return; }
    if (!isLogin && name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    setLoading(true);

    if (isLogin) {
      const { data, error: err } = await authService.signIn(email, password);
      if (err) {
        const errMsg = err.message || '';
        if (errMsg.includes('Invalid login')) setError('❌ Incorrect email or password. Please check and try again.');
        else if (errMsg.includes('Email not confirmed')) setError('📧 Please verify your email first — we sent a verification link to your inbox.');
        else if (errMsg.includes('blocked') || errMsg.includes('banned')) setError('🚫 Your account has been blocked. Please contact support.');
        else setError('❌ Login failed — ' + errMsg);
        setLoading(false);
        return;
      }
      onLogin(data.session);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { setError('📧 Enter a valid email address (e.g. name@gmail.com)'); setLoading(false); return; }
      if (password.length < 6) { setError('🔑 Password must be at least 6 characters'); setLoading(false); return; }

      const { data, error: err } = await authService.signUp(email, password, name);
      if (err) {
        const errMsg = (err.message || err.msg || err.error_description || '').toLowerCase();
        if (errMsg.includes('already registered') || errMsg.includes('already been registered') || errMsg.includes('already exists') || errMsg.includes('duplicate')) {
          setError('📧 This email is already registered. Use the Login tab to sign in, or try a different email.');
        } else if (errMsg.includes('password') && (errMsg.includes('weak') || errMsg.includes('short') || errMsg.includes('length'))) {
          setError('🔑 Password is too weak — use at least 6 characters with a mix of letters and numbers.');
        } else if (errMsg.includes('valid') && errMsg.includes('email')) {
          setError('📧 That is not a valid email address. Enter a correct email (e.g. name@gmail.com).');
        } else if (errMsg.includes('rate') || errMsg.includes('limit') || errMsg.includes('too many')) {
          setError('⏳ Too many attempts. Please try again in a minute or two.');
        } else if (errMsg.includes('network') || errMsg.includes('fetch')) {
          setError('🌐 Please check your internet connection and try again.');
        } else if (errMsg.includes('database') || errMsg.includes('server')) {
          setError('⚙️ There is a server issue — please try again in a minute.');
        } else if (errMsg.includes('signups not allowed') || errMsg.includes('signup disabled')) {
          setError('🚫 New signups are currently closed. Please contact the admin.');
        } else {
          setError('❌ Signup failed — ' + (err.message || 'Something went wrong. Please try again.'));
        }
        setLoading(false);
        return;
      }
      if (data?.session) {
        try {
          const res = await fetch('/api/setup-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.session.user.id, email: email, fullName: name })
          });
          const result = await res.json();
          if (!res.ok) console.error('Profile setup warning:', result.error);
        } catch (e) { console.error('Profile setup error:', e); }
        onLogin(data.session);
      } else if (data?.user && !data?.session) {
        setSuccess('✅ Account created! We sent a verification email — check your inbox (and spam folder).');
        setMode('login');
      } else {
        setSuccess('✅ Account created! Now sign in from the Login tab.');
        setMode('login');
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.text, boxSizing: 'border-box' };

  const title =
    mode === 'reset' ? 'Set New Password' :
    mode === 'forgot' ? 'Reset Password' :
    'AnuTask';

  const submitLabel =
    loading ? 'Wait...' :
    mode === 'login' ? 'Login' :
    mode === 'signup' ? 'Create Account' :
    mode === 'forgot' ? 'Send Reset Link' :
    'Update Password';

  return (
    <div style={{ background: VISUAL_THEME.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '380px', border: `1px solid ${VISUAL_THEME.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '12px', display: 'inline-block' }}>
            <svg viewBox="0 0 120 120" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
              <rect width="120" height="120" rx="22" fill="#6366F1"/>
              <path d="M30 78L50 42L60 58L70 42L90 78" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M52 72L65 52L78 72" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <g transform="translate(60,30)">
                <circle r="3" fill="#FF8A00"/>
                <line x1="0" y1="-6" x2="0" y2="-10" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="5.2" y1="-3" x2="8.7" y2="-5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="5.2" y1="3" x2="8.7" y2="5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="-5.2" y1="-3" x2="-8.7" y2="-5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="-5.2" y1="3" x2="-8.7" y2="5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#312E81', fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: VISUAL_THEME.textSec, fontWeight: 400 }}>
            {mode === 'reset' ? 'Choose a new password' :
             mode === 'forgot' ? 'Enter your email and we will send a reset link' :
             'Smart SaaS OS by Anukant'}
          </p>
        </div>

        {/* Login / Signup toggle — only in those two modes */}
        {(mode === 'login' || mode === 'signup') && (
          <div style={{ display: 'flex', marginBottom: '28px', background: '#F4F4F5', borderRadius: '30px', padding: '4px', border: `1px solid ${VISUAL_THEME.border}` }}>
            <button onClick={() => switchMode('login')} style={{ flex: 1, padding: '10px 0', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: mode === 'login' ? VISUAL_THEME.accent : 'transparent', color: mode === 'login' ? '#fff' : VISUAL_THEME.textSec, transition: 'all 0.2s ease' }}>Login</button>
            <button onClick={() => switchMode('signup')} style={{ flex: 1, padding: '10px 0', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: mode === 'signup' ? VISUAL_THEME.accent : 'transparent', color: mode === 'signup' ? '#fff' : VISUAL_THEME.textSec, transition: 'all 0.2s ease' }}>Sign Up</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <input style={inputStyle} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown} />
          )}

          {/* Email — shown in login, signup, forgot (NOT reset) */}
          {mode !== 'reset' && (
            <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
          )}

          {/* Password — shown in login, signup, reset (NOT forgot) */}
          {mode !== 'forgot' && (
            <input style={inputStyle} type="password" placeholder={mode === 'reset' ? 'New password (min 6 chars)' : 'Password (min 6 chars)'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
          )}

          {/* Confirm password — reset only */}
          {mode === 'reset' && (
            <input style={inputStyle} type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown} />
          )}

          {/* Forgot password link — login mode only */}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '-6px' }}>
              <button onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', color: VISUAL_THEME.accent, fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
            </div>
          )}

          {error && <div style={{ background: '#ff6b6b12', border: '1px solid #ff6b6b30', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: '#ff6b6b', lineHeight: '1.4' }}>{error}</div>}
          {success && <div style={{ background: '#00b89412', border: '1px solid #00b89430', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: '#00b894', lineHeight: '1.4' }}>{success}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '14px 0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(108,92,231,0.2)', opacity: loading ? 0.6 : 1, transition: 'all 0.2s ease' }}>
            {submitLabel}
          </button>

          {/* Back to login link — forgot/reset modes */}
          {(mode === 'forgot' || mode === 'reset') && (
            <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>← Back to Login</button>
          )}

          {mode === 'signup' && (
            <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, textAlign: 'center', margin: 0 }}>
              Sign up includes a 14-day free trial. No credit card needed.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
