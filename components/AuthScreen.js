'use client';
import React, { useState } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { authService } from '../services/authService';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError(''); 
    setSuccess('');
    if (!email || !password) { setError('Email aur password dono daalo'); return; }
    if (!isLogin && !name.trim()) { setError('Name zaroori hai — apna naam daalo'); return; }
    if (!isLogin && name.trim().length < 2) { setError('Naam kam se kam 2 characters ka hona chahiye'); return; }
    setLoading(true);
    
    if (isLogin) {
      const { data, error: err } = await authService.signIn(email, password);
      if (err) { setError('Galat email ya password'); setLoading(false); return; }
      onLogin(data.session);
    } else {
      const { data, error: err } = await authService.signUp(email, password, name);
      if (err) { 
        const msg = typeof err.message === 'string' ? err.message : (err.msg || err.error_description || JSON.stringify(err) || 'Signup failed — try different email/password');
        setError(msg === '{}' ? 'Signup failed — email already registered ya password weak hai (min 6 chars)' : msg); 
        setLoading(false); 
        return; 
      }
      if (data?.session) {
        // Setup profile + default client for new user
        try {
          await fetch('/api/setup-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.session.user.id,
              email: email,
              fullName: name
            })
          });
        } catch(e) { console.error('Profile setup error:', e); }
        onLogin(data.session); 
      } else if (data?.user && !data?.session) {
        setSuccess('Account bana! Verification email bheja hai — inbox check karo.'); 
        setIsLogin(true); 
      } else {
        setSuccess('Account created! Ab Login tab se login karo.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

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
          <h1 style={{ margin: 0, fontSize: '24px', color: '#312E81', fontWeight: 700, letterSpacing: '-0.5px' }}>AnuTask</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: VISUAL_THEME.textSec, fontWeight: 400 }}>Smart SaaS OS by Anukant</p>
        </div>

        <div style={{ display: 'flex', marginBottom: '28px', background: '#F4F4F5', borderRadius: '30px', padding: '4px', border: `1px solid ${VISUAL_THEME.border}` }}>
          <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: isLogin ? VISUAL_THEME.accent : 'transparent', color: isLogin ? '#fff' : VISUAL_THEME.textSec, transition: 'all 0.2s ease' }}>Login</button>
          <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: !isLogin ? VISUAL_THEME.accent : 'transparent', color: !isLogin ? '#fff' : VISUAL_THEME.textSec, transition: 'all 0.2s ease' }}>Sign Up</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <input 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.text, boxSizing: 'border-box' }} 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              onKeyDown={handleKeyDown} 
            />
          )}
          <input 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.text, boxSizing: 'border-box' }} 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            onKeyDown={handleKeyDown} 
          />
          <input 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.text, boxSizing: 'border-box' }} 
            type="password" 
            placeholder="Password (min 6 chars)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            onKeyDown={handleKeyDown} 
          />

          {error && <div style={{ background: '#ff6b6b12', border: '1px solid #ff6b6b30', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: '#ff6b6b', lineHeight: '1.4' }}>{error}</div>}
          {success && <div style={{ background: '#00b89412', border: '1px solid #00b89430', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: '#00b894', lineHeight: '1.4' }}>{success}</div>}
          
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            style={{ 
              background: VISUAL_THEME.accent,
              color: '#FFFFFF',
              border: 'none',
              padding: '14px 0', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 600, 
              cursor: 'pointer',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(108,92,231,0.2)',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>

          {!isLogin && (
            <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, textAlign: 'center', margin: 0 }}>
              Sign up includes a 14-day free trial. No credit card needed.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
