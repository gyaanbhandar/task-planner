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

  return (
    <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ background: t.surface, borderRadius: 16, padding: 32, width: '90%', maxWidth: 400, border: '1px solid ' + t.border }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
          <h1 style={{ margin: 0, fontSize: 22, color: t.text, fontWeight: 700 }}>Task Planner</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: t.textSec }}>AI-Powered Business OS</p>
        </div>
        <div style={{ display: 'flex', marginBottom: 20, background: t.inputBg, borderRadius: 8, padding: 3 }}>
          <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: isLogin ? '#6C5CE7' : 'transparent', color: isLogin ? '#fff' : t.textSec }}>Login</button>
          <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: !isLogin ? '#6C5CE7' : 'transparent', color: !isLogin ? '#fff' : t.textSec }}>Sign Up</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isLogin && <input style={S.input} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown} />}
          <input style={S.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
          <input style={S.input} type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
          {error && <div style={{ background: '#ff6b6b18', border: '1px solid #ff6b6b44', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#ff6b6b' }}>{error}</div>}
          {success && <div style={{ background: '#00b89418', border: '1px solid #00b89444', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#00b894' }}>{success}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }}>{loading ? 'Wait...' : isLogin ? 'Login' : 'Create Account'}</button>
        </div>
      </div>
    </div>
  );
}
