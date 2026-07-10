'use client';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getS } from '../constants/taskConstants';
import { authService } from '../services/authService';

export default function AuthScreen({ onLogin }) {
  const { theme, t } = useTheme();
  const S = getS(t);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError(''); setSuccess('');
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
        setSuccess('Verification email bheja hai — inbox + spam check karo. Verify ke baad login karo.'); 
        setIsLogin(true); 
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  // Premium Any.do inspired typography stack
  const fontStack = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  return (
    <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fontStack, padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ background: t.surface, borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '380px', border: '1px solid ' + t.border, boxShadow: theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.06)' }}>
        
        {/* Header App Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', display: 'inline-block', filter: 'drop-shadow(0 2px 8px rgba(108,92,231,0.3))' }}>⚡</div>
          <h1 style={{ margin: 0, fontSize: '24px', color: t.text, fontWeight: 700, letterSpacing: '-0.5px' }}>Task Planner</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: t.textSec, fontWeight: 400 }}>AI-Powered Business OS</p>
        </div>

        {/* Tab Switcher (Any.do Style Pill) */}
        <div style={{ display: 'flex', marginBottom: '28px', background: theme === 'dark' ? '#141416' : '#F4F4F5', borderRadius: '30px', padding: '4px', border: '1px solid ' + t.border }}>
          <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: fontStack, background: isLogin ? '#6C5CE7' : 'transparent', color: isLogin ? '#fff' : t.textSec, transition: 'all 0.2s ease' }}>Login</button>
          <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: fontStack, background: !isLogin ? '#6C5CE7' : 'transparent', color: !isLogin ? '#fff' : t.textSec, transition: 'all 0.2s ease' }}>Sign Up</button>
        </div>

        {/* Input Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <input 
              style={{ ...S.input, padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: theme === 'dark' ? '#141416' : '#FFFFFF' }} 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              onKeyDown={handleKeyDown} 
            />
          )}
          <input 
            style={{ ...S.input, padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: theme === 'dark' ? '#141416' : '#FFFFFF' }} 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            onKeyDown={handleKeyDown} 
          />
          <input 
            style={{ ...S.input, padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: theme === 'dark' ? '#141416' : '#FFFFFF' }} 
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
              ...S.primaryBtn, 
              background: '#6C5CE7',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px 0', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 600, 
              fontFamily: fontStack,
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
