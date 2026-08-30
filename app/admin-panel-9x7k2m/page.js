'use client';

// =====================================================
// SUPER ADMIN PANEL  —  https://www.anutask.com/admin-panel-9x7k2m
// -----------------------------------------------------
// This is a STANDALONE admin shell. It shares AnuTask's logo and brand
// but is a completely separate interface from the user app:
//   • No task views, no "New Task", no user Sidebar.
//   • Its own dark theme + admin navigation.
//   • Hard access gate: a visitor must be a verified SUPER ADMIN
//     (allowlisted email AND a row in admin_users). Any ordinary user
//     who logs in here is rejected and cannot see admin data.
// =====================================================

import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import ViewAdmin from '../../components/ViewAdmin';
import CouponManager from '../../components/CouponManager';

const T = {
  bg: '#0B1120',
  sidebar: '#0D1424',
  panel: '#111827',
  border: '#1F2937',
  text: '#F1F5F9',
  textSec: '#94A3B8',
  textDim: '#64748B',
  accent: '#6366F1',
  accentSoft: 'rgba(99,102,241,0.15)',
  red: '#EF4444',
  green: '#10B981',
};

// AnuTask logo — same mark as the user app, so branding stays consistent.
function Logo({ size = 36 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="24" fill="#6366F1" />
      <path d="M28 88L52 32L66 56" stroke="#FFFFFF" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56 68L68 80L92 44" stroke="#F97316" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'coupons', label: 'Coupons & Offers', icon: '🎟️' },
];

export default function AdminPanelPage() {
  const [session, setSession] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | login | denied | ready
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('dashboard');
  const [mobileNav, setMobileNav] = useState(false);

  // login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const verify = async (s) => {
    if (!s) { setPhase('login'); return; }
    const ok = await authService.isAdmin(s.user.id, s.user.email);
    if (ok) { setIsAdmin(true); setPhase('ready'); }
    else { setIsAdmin(false); setPhase('denied'); }
  };

  useEffect(() => {
    authService.getSession().then(async (s) => {
      setSession(s);
      await verify(s);
    });
    const sub = authService.onAuthStateChange(async (s) => {
      setSession(s);
      if (!s) { setIsAdmin(false); setPhase('login'); }
    });
    return () => sub.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginErr(''); setLoggingIn(true);
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) { setLoginErr(error.message); setLoggingIn(false); return; }
      const s = data.session;
      setSession(s);
      // Gate immediately — non-admins are signed out so their session
      // can't be reused to browse the admin panel.
      const ok = await authService.isAdmin(s.user.id, s.user.email);
      if (!ok) {
        await authService.signOut();
        setSession(null);
        setLoginErr('This account is not authorized for the admin panel.');
        setPhase('login');
      } else {
        setIsAdmin(true);
        setPhase('ready');
      }
    } catch (e) {
      setLoginErr(e.message || 'Login failed.');
    }
    setLoggingIn(false);
  };

  const logout = async () => {
    await authService.signOut();
    setSession(null);
    setIsAdmin(false);
    setPhase('login');
  };

  // ---------- LOADING ----------
  if (phase === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, color: T.textSec, fontSize: '14px', gap: '10px' }}>
        <Logo size={26} /> Verifying admin access…
      </div>
    );
  }

  // ---------- LOGIN ----------
  if (phase === 'login') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '380px', background: T.panel, border: `1px solid ${T.border}`, borderRadius: '18px', padding: '32px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Logo size={44} />
            <div style={{ fontSize: '18px', fontWeight: 800, color: T.text }}>AnuTask Admin</div>
            <div style={{ fontSize: '12px', color: T.textDim, textAlign: 'center' }}>Restricted area — super administrators only.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} style={loginInput} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} style={loginInput} />
            <button onClick={handleLogin} disabled={loggingIn || !email || !password} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: T.accent, color: '#FFF', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: loggingIn ? 0.7 : 1 }}>
              {loggingIn ? 'Signing in…' : 'Sign in'}
            </button>
            {loginErr && <div style={{ fontSize: '12px', color: T.red, fontWeight: 600, textAlign: 'center' }}>{loginErr}</div>}
          </div>
        </div>
      </div>
    );
  }

  // ---------- DENIED (logged in, but not an admin) ----------
  if (phase === 'denied') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: T.panel, border: `1px solid ${T.border}`, borderRadius: '18px', padding: '32px', textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: T.text, marginBottom: '6px' }}>Access denied</div>
          <div style={{ fontSize: '13px', color: T.textSec, marginBottom: '20px' }}>
            You're signed in as <strong style={{ color: T.text }}>{session?.user?.email}</strong>, but this account is not a super administrator.
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={logout} style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Sign out</button>
            <a href="/dashboard" style={{ padding: '10px 18px', borderRadius: '10px', background: T.accent, color: '#FFF', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Go to app</a>
          </div>
        </div>
      </div>
    );
  }

  // ---------- READY (admin shell) ----------
  const SidebarInner = (
    <div style={{ width: '260px', height: '100%', background: T.sidebar, borderRight: `1px solid ${T.border}`, padding: '22px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingLeft: '6px' }}>
        <Logo size={34} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: T.text, letterSpacing: '-0.3px' }}>AnuTask</div>
          <div style={{ fontSize: '10px', color: T.accent, fontWeight: 700, letterSpacing: '0.08em' }}>ADMIN CONSOLE</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <button key={n.id} onClick={() => { setView(n.id); setMobileNav(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '9px', border: 'none', background: active ? T.accentSoft : 'transparent', color: active ? '#A5B4FC' : T.textSec, fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: '15px' }}>{n.icon}</span>{n.label}
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 6px', marginBottom: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: T.accentSoft, color: '#A5B4FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
            {(session?.user?.email || 'A')[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Super Admin</div>
            <div style={{ fontSize: '10px', color: T.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '9px 12px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', color: T.red, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>⏻ Sign out</button>
      </div>
    </div>
  );

  const titleFor = view === 'dashboard' ? 'Admin Dashboard' : 'Coupons & Offers';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: T.bg, overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'flex', flexShrink: 0 }} className="admin-desktop-sidebar">{SidebarInner}</div>

      {/* Mobile drawer */}
      {mobileNav && (
        <>
          <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 9999 }}>{SidebarInner}</div>
        </>
      )}

      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '64px', borderBottom: `1px solid ${T.border}`, background: T.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setMobileNav(true)} className="admin-mobile-menu" style={{ background: 'transparent', border: 'none', color: T.text, fontSize: '20px', cursor: 'pointer', display: 'none' }}>☰</button>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: T.text, margin: 0 }}>{titleFor}</h1>
          </div>
          <div style={{ fontSize: '11px', color: T.textDim, background: T.panel, padding: '6px 12px', borderRadius: '8px', border: `1px solid ${T.border}` }}>🛡️ Super Admin</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {view === 'dashboard' && <ViewAdmin session={session} adminEmail={session?.user?.email} />}
          {view === 'coupons' && (
            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '4px' }}>
              {/* CouponManager is self-contained; it prompts for ADMIN_PANEL_SECRET. */}
              <CouponManager adminEmail={session?.user?.email} dark />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .admin-desktop-sidebar { display: none !important; }
          .admin-mobile-menu { display: inline-block !important; }
        }
      `}</style>
    </div>
  );
}

const loginInput = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: '14px', boxSizing: 'border-box' };
