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
    if (!isLogin && !name) { setError('Naam daalo'); return; }
    setLoading(true);
    
    if (isLogin) {
      const { data, error: err } = await authService.signIn(email, password);
      if (err) { setError('Galat email ya password'); setLoading(false); return; }
      onLogin(data.session);
    } else {
      const { data, error: err } = await authService.signUp(email, password, name);
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.session) { 
        onLogin(data.session); 
      } else { 
        setSuccess('Verification email bheja hai — inbox check karo.'); 
        setIsLogin(true); 
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div style={{ background: VISUAL_THEME.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '380px', border: `1px solid ${VISUAL_THEME.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
        
        {/* Header App Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', display: 'inline-block' }}>⚡</div>
          <h1 style={{ margin: 0, fontSize: '24px', color: VISUAL_THEME.text, fontWeight: 700, letterSpacing: '-0.5px' }}>Task Planner</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: VISUAL_THEME.textSec, fontWeight: 400 }}>AI-Powered Business OS</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', marginBottom: '28px', background: '#F4F4F5', borderRadius: '30px', padding: '4px', border: `1px solid ${VISUAL_THEME.border}` }}>
          <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: isLogin ? VISUAL_THEME.accent : 'transparent', color: isLogin ? '#fff' : VISUAL_THEME.textSec, transition: 'all 0.2s ease' }}>Login</button>
          <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: !isLogin ? VISUAL_THEME.accent : 'transparent', color: !isLogin ? '#fff' : VISUAL_THEME.textSec, transition: 'all 0.2s ease' }}>Sign Up</button>
        </div>

        {/* Input Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <input 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.text }} 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              onKeyDown={handleKeyDown} 
            />
          )}
          <input 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.text }} 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            onKeyDown={handleKeyDown} 
          />
          <input 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.text }} 
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
        </div>

      </div>
    </div>
  );
}
