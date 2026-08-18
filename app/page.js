'use client';
import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    return () => { document.body.style.margin = ''; document.body.style.padding = ''; };
  }, []);

  const theme = isDark ? {
    bgPrimary: '#0B0F19', bgSecondary: '#111827', bgCard: '#111827', bgInput: '#0B0F19',
    textPrimary: '#F1F5F9', textSecondary: '#CBD5E1', textMuted: '#64748B',
    borderColor: '#1E293B', borderCard: '#1E293B',
    headerBg: 'rgba(11,15,25,0.92)',
    shadowCard: '0 1px 3px rgba(0,0,0,0.3)',
    shadowCardHover: '0 10px 25px rgba(79,70,229,0.12)',
    iconBg: 'rgba(79,70,229,0.15)', iconColor: '#818CF8',
    checkColor: '#818CF8',
    tagFreeBg: '#1E293B', tagFreeText: '#CBD5E1',
    tagStarterBg: 'rgba(5,150,105,0.12)', tagStarterText: '#34D399',
    tagProBg: 'rgba(79,70,229,0.15)', tagProText: '#A5B4FC',
    eyebrowColor: '#A5B4FC',
  } : {
    bgPrimary: '#FFFFFF', bgSecondary: '#F8FAFC', bgCard: '#FFFFFF', bgInput: '#FFFFFF',
    textPrimary: '#0F172A', textSecondary: '#475569', textMuted: '#94A3B8',
    borderColor: '#E2E8F0', borderCard: '#E2E8F0',
    headerBg: 'rgba(255,255,255,0.88)',
    shadowCard: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    shadowCardHover: '0 10px 25px rgba(0,0,0,0.08)',
    iconBg: '#EEF2FF', iconColor: '#4F46E5',
    checkColor: '#4F46E5',
    tagFreeBg: '#F1F5F9', tagFreeText: '#475569',
    tagStarterBg: '#ECFDF5', tagStarterText: '#059669',
    tagProBg: '#EEF2FF', tagProText: '#4F46E5',
    eyebrowColor: '#4F46E5',
  };

  const INDIGO = '#4F46E5';
  const INDIGO_HOVER = '#4338CA';
  const ORANGE = '#F97316';
  const ORANGE_HOVER = '#EA580C';

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const features = [
    { title: 'Smart Today View', desc: 'See what needs your attention today and focus on the work that matters most.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
    )},
    { title: 'Drag & Drop', desc: 'Reorder tasks instantly and keep your priorities exactly where you want them.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
    )},
    { title: 'Client Workspaces', desc: 'Organize tasks by client with dedicated workspaces for every project.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
    )},
    { title: 'Calendar & Planning', desc: 'See your upcoming work clearly and manage tasks around important deadlines.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
    )},
    { title: 'Real-time Alerts', desc: 'Get timely browser notifications so important tasks and deadlines never slip through.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
    )},
    { title: 'Recurring Tasks', desc: 'Set repeating tasks once and let AnuTask keep your routine work organized automatically.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
    )},
    { title: 'CSV & JSON Export', desc: 'Export and import your tasks as CSV or JSON for backups, reporting, and data portability.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    )},
    { title: 'Secure Data Isolation', desc: 'Your workspace data is securely isolated — no cross-user leakage, ever.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    )},
    { title: 'Productivity Dashboard', desc: 'See your priorities, pending work, completed tasks, and progress in one clear view.', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    )},
  ];

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'About Us', id: 'about' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Contact', id: 'contact' },
  ];

  const s = {
    // Common reusable styles
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
    section: { padding: '96px 0' },
    sectionAlt: { padding: '96px 0', background: theme.bgSecondary },
    sectionBorder: { padding: '96px 0', borderTop: `1px solid ${theme.borderColor}` },
    sectionHeader: { textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' },
    eyebrow: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.eyebrowColor, marginBottom: 12 },
    h2: { fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16, color: theme.textPrimary },
    subtext: { color: theme.textSecondary, fontSize: 16, margin: 0, lineHeight: 1.6 },
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", background: theme.bgPrimary, color: theme.textPrimary, minHeight: '100vh', transition: 'background 0.3s, color 0.3s', WebkitFontSmoothing: 'antialiased' }}>

      {/* ===== HEADER ===== */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: theme.headerBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${theme.borderColor}`, transition: 'background 0.3s, border-color 0.3s' }}>
        <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #4F46E5, #3730A3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <path d="M4 20L10.5 4L14 12" />
                <path d="M11 15L14 18L20 8" stroke="#F97316" strokeWidth="3" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: isDark ? '#fff' : INDIGO, letterSpacing: '-0.02em', lineHeight: 1 }}>AnuTask</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: ORANGE, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>SMART SAAS OS</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
            {navLinks.map(n => (
              <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); scrollTo(n.id); }} style={{ fontSize: 14, fontWeight: 600, color: theme.textSecondary, textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}>{n.label}</a>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Theme Toggle */}
            <button onClick={() => setIsDark(!isDark)} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${theme.borderColor}`, background: theme.bgSecondary, color: theme.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} aria-label="Toggle theme">
              {isDark ? (
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd"/></svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
              )}
            </button>

            <a href="https://app.anutask.com/login" style={{ fontSize: 14, fontWeight: 600, color: theme.textSecondary, textDecoration: 'none' }} className="desktop-only">Sign In</a>

            <a href="https://app.anutask.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: ORANGE, color: '#fff', fontSize: 14, fontWeight: 700, padding: '10px 20px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }} className="desktop-only">
              <span>Launch App</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(true)} style={{ display: 'none', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: `1px solid ${theme.borderColor}`, background: theme.bgSecondary, color: theme.textSecondary, cursor: 'pointer' }} className="mobile-menu-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE NAV ===== */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: theme.bgPrimary, padding: '80px 24px 40px', display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setMobileMenuOpen(false)} style={{ position: 'absolute', top: 20, right: 24, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: `1px solid ${theme.borderColor}`, background: theme.bgSecondary, color: theme.textSecondary, cursor: 'pointer' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          {navLinks.map(n => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); scrollTo(n.id); }} style={{ display: 'block', padding: '16px 0', fontSize: 18, fontWeight: 600, color: theme.textPrimary, textDecoration: 'none', borderBottom: `1px solid ${theme.borderColor}` }}>{n.label}</a>
          ))}
          <a href="https://app.anutask.com/login" style={{ display: 'block', padding: '16px 0', fontSize: 18, fontWeight: 600, color: theme.textPrimary, textDecoration: 'none', borderBottom: `1px solid ${theme.borderColor}` }}>Sign In</a>
          <a href="https://app.anutask.com/signup" style={{ display: 'block', marginTop: 24, padding: '16px', borderRadius: 14, background: ORANGE, color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>Start Free Forever →</a>
        </div>
      )}

      <main style={{ paddingTop: 0 }}>

        {/* ===== HERO ===== */}
        <section style={{ padding: '140px 0 80px', textAlign: 'center', overflow: 'hidden' }}>
          <div style={s.container}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: theme.iconBg, border: '1px solid rgba(79,70,229,0.2)', color: theme.eyebrowColor, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 32 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, animation: 'pulse 2s infinite' }} />
              Simple Work-Management SaaS
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20, color: theme.textPrimary }}>
              Your Business,<br/>
              <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Organized.</span>
            </h1>

            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: theme.textSecondary, maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
              The all-in-one workspace to manage tasks, clients, categories, and deadlines — built for professionals who mean business.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <a href="https://app.anutask.com/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: ORANGE, color: '#fff', fontSize: 16, fontWeight: 700, padding: '16px 32px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 30px rgba(249,115,22,0.3)' }}>
                Start Free Forever
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </a>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }} style={{ display: 'inline-flex', alignItems: 'center', background: theme.bgSecondary, color: theme.textPrimary, border: `1px solid ${theme.borderColor}`, fontSize: 16, fontWeight: 600, padding: '16px 32px', borderRadius: 14, textDecoration: 'none' }}>See Features</a>
            </div>

            <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 60 }}>
              ✓ Free forever &nbsp;·&nbsp; ✓ No credit card required &nbsp;·&nbsp; ✓ Cancel anytime
            </p>

            {/* Dashboard Mockup */}
            <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 20, border: `1px solid ${theme.borderColor}`, background: theme.bgSecondary, padding: 12, boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.4)' : '0 25px 60px rgba(0,0,0,0.08)' }}>
              <div style={{ borderRadius: 14, overflow: 'hidden', background: '#0F172A', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div style={{ textAlign: 'center', padding: 40, position: 'relative', zIndex: 2 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: ORANGE }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  </div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>AnuTask Operations Hub</h4>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>Multi-tenant client management & task execution active.</p>
                  <a href="https://app.anutask.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>Launch Dashboard →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== VALUE STRIP ===== */}
        <section style={{ borderTop: `1px solid ${theme.borderColor}`, borderBottom: `1px solid ${theme.borderColor}`, background: theme.bgSecondary, padding: '48px 0', transition: 'all 0.3s' }}>
          <div style={s.container}>
            <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: theme.textMuted, marginBottom: 32 }}>Built For Modern Professionals</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
              {[
                { value: '99.9%', label: 'Guaranteed Uptime', color: theme.textPrimary },
                { value: '<200ms', label: 'Avg Response Time', color: INDIGO },
                { value: '256-bit', label: 'SSL Encryption', color: ORANGE },
                { value: '24/7', label: 'System Monitoring', color: theme.textPrimary },
              ].map((v, i) => (
                <div key={i}>
                  <h4 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: v.color }}>{v.value}</h4>
                  <p style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, margin: 0 }}>{v.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="features" style={{ ...s.sectionBorder }}>
          <div style={s.container}>
            <div style={s.sectionHeader}>
              <div style={s.eyebrow}>Features</div>
              <h2 style={s.h2}>Everything you need to manage your work</h2>
              <p style={s.subtext}>Tasks, clients, categories, schedules, and priorities — all in one simple workspace.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {features.map((f, i) => (
                <div key={i} style={{ padding: 32, borderRadius: 16, border: `1px solid ${theme.borderCard}`, background: theme.bgCard, boxShadow: theme.shadowCard, transition: 'all 0.3s' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: theme.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: theme.iconColor }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: theme.textPrimary }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how-it-works" style={{ ...s.sectionAlt }}>
          <div style={s.container}>
            <div style={s.sectionHeader}>
              <div style={s.eyebrow}>How It Works</div>
              <h2 style={s.h2}>Organize your work in three simple steps</h2>
              <p style={s.subtext}>Get up and running in minutes without complex setup.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48 }}>
              {[
                { num: '1', title: 'Create your workspace', desc: 'Set up custom categories, clients, and projects effortlessly.' },
                { num: '2', title: 'Add and organize tasks', desc: 'Set priorities, due dates, and recurring workflows with drag & drop.' },
                { num: '3', title: 'Get more done', desc: 'See what matters today and keep your business moving forward.' },
              ].map((step, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: INDIGO, color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>{step.num}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: theme.textPrimary }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ABOUT US ===== */}
        <section id="about" style={{ ...s.sectionBorder }}>
          <div style={s.container}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 48, alignItems: 'start' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: isDark ? 'rgba(249,115,22,0.1)' : '#FFF7ED', border: '1px solid rgba(249,115,22,0.2)', color: ORANGE, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>About Our Company</div>
                <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 24, color: theme.textPrimary }}>Building Next-Generation Infrastructure for Modern Operations</h2>
                <p style={{ color: theme.textSecondary, marginBottom: 16, lineHeight: 1.7, fontSize: 15 }}>At AnuTask, our mission is to redefine how modern organizations execute work. We combine streamlined operational frameworks with intuitive design to eliminate daily workflow friction.</p>
                <p style={{ color: theme.textSecondary, marginBottom: 24, lineHeight: 1.7, fontSize: 15 }}>Our team designed AnuTask after managing complex enterprise systems. We recognized that traditional SaaS platforms add overhead rather than efficiency. AnuTask provides an intuitive, high-performance operating system engineered for growing companies.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 24, borderTop: `1px solid ${theme.borderColor}`, textAlign: 'center' }}>
                  <div><div style={{ fontSize: 28, fontWeight: 800, color: theme.textPrimary }}>99.9%</div><div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>Uptime SLA</div></div>
                  <div><div style={{ fontSize: 28, fontWeight: 800, color: ORANGE }}>10x</div><div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>Efficiency Gain</div></div>
                  <div><div style={{ fontSize: 28, fontWeight: 800, color: INDIGO }}>24/7</div><div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>System Monitoring</div></div>
                </div>
              </div>

              <div style={{ padding: 32, borderRadius: 16, border: `1px solid ${theme.borderCard}`, background: theme.bgCard, boxShadow: theme.shadowCard }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: theme.textPrimary }}>Our Core Principles</h3>
                {[
                  { num: '01', title: 'Enterprise Reliability', desc: 'Built on modern multi-tenant cloud architecture to ensure performance and data isolation.' },
                  { num: '02', title: 'Simplicity First', desc: 'No learning curve. Clean interfaces designed for professionals who value their time.' },
                  { num: '03', title: 'Client Experience First', desc: 'Dedicated client workspaces for seamless collaboration and organized project delivery.' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 2 ? 20 : 0 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: theme.iconBg, color: theme.iconColor, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>{p.num}</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 4, color: theme.textPrimary }}>{p.title}</strong>
                      <span style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.5 }}>{p.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section id="pricing" style={{ ...s.sectionAlt }}>
          <div style={s.container}>
            <div style={s.sectionHeader}>
              <div style={s.eyebrow}>Pricing</div>
              <h2 style={s.h2}>Simple pricing. Powerful productivity.</h2>
              <p style={s.subtext}>Start free forever. Upgrade when your workflow grows.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

              {/* FREE */}
              <div style={{ padding: 32, borderRadius: 16, border: `1px solid ${theme.borderCard}`, background: theme.bgCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: theme.tagFreeBg, color: theme.tagFreeText, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Free Forever</span>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: theme.textPrimary }}>Free</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 24 }}>For getting started</div>
                  <div style={{ marginBottom: 24 }}><span style={{ fontSize: 40, fontWeight: 800, color: theme.textPrimary }}>₹0</span></div>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                    {[
                      { check: true, bold: true, text: '20 active tasks' },
                      { check: true, bold: true, text: 'Up to 2 clients' },
                      { check: true, bold: true, text: 'Up to 3 categories' },
                      { check: true, bold: false, text: 'Task priorities & calendar' },
                      { check: true, bold: false, text: 'Recurring tasks' },
                      { check: true, bold: false, text: 'Basic reminders' },
                      { check: false, bold: false, text: 'No CSV/JSON Import-Export' },
                    ].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: f.check ? theme.textSecondary : theme.textMuted, padding: '6px 0', textDecoration: f.check ? 'none' : 'line-through' }}>
                        <span style={{ color: f.check ? theme.checkColor : '#EF4444', fontWeight: 700, fontSize: 14, flexShrink: 0, textDecoration: 'none' }}>{f.check ? '✓' : '✕'}</span>
                        {f.bold ? <strong style={{ fontWeight: 600, color: theme.textPrimary }}>{f.text}</strong> : f.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="https://app.anutask.com/signup" style={{ display: 'block', width: '100%', textAlign: 'center', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, background: theme.bgSecondary, color: theme.textPrimary, border: `1px solid ${theme.borderColor}`, textDecoration: 'none' }}>Get Started Free →</a>
              </div>

              {/* STARTER */}
              <div style={{ padding: 32, borderRadius: 16, border: `1px solid ${theme.borderCard}`, background: theme.bgCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 100, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', background: '#059669' }}>Best Value</div>
                <div>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: theme.tagStarterBg, color: theme.tagStarterText, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Starter</span>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: theme.textPrimary }}>Starter</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 24 }}>For freelancers & professionals</div>
                  <div style={{ marginBottom: 24 }}><span style={{ fontSize: 40, fontWeight: 800, color: theme.textPrimary }}>₹199</span><span style={{ fontSize: 14, color: theme.textMuted }}>/mo</span></div>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                    {['Everything in Free', 'Unlimited active tasks', 'Up to 10 clients', 'Unlimited categories', 'CSV & JSON Import/Export', 'Full task history', 'Advanced reminders'].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: theme.textSecondary, padding: '6px 0' }}>
                        <span style={{ color: theme.checkColor, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
                        {i < 2 || i === 4 ? <strong style={{ fontWeight: 600, color: theme.textPrimary }}>{f}</strong> : f}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="https://app.anutask.com/signup" style={{ display: 'block', width: '100%', textAlign: 'center', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, background: INDIGO, color: '#fff', textDecoration: 'none' }}>Start with Starter →</a>
              </div>

              {/* PRO */}
              <div style={{ padding: 32, borderRadius: 16, border: `2px solid ${INDIGO}`, background: theme.bgCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', boxShadow: '0 8px 30px rgba(79,70,229,0.12)' }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 100, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', background: ORANGE }}>Most Popular</div>
                <div>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: theme.tagProBg, color: theme.tagProText, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Pro</span>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: theme.textPrimary }}>Pro</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 24 }}>For business owners & teams</div>
                  <div style={{ marginBottom: 24 }}><span style={{ fontSize: 40, fontWeight: 800, color: theme.textPrimary }}>₹499</span><span style={{ fontSize: 14, color: theme.textMuted }}>/mo</span></div>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                    {['Everything in Starter', 'Unlimited clients & categories', 'Productivity dashboard & insights', 'Advanced reporting', 'Priority support'].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: theme.textSecondary, padding: '6px 0' }}>
                        <span style={{ color: theme.checkColor, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
                        {i < 2 ? <strong style={{ fontWeight: 600, color: theme.textPrimary }}>{f}</strong> : f}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="https://app.anutask.com/signup" style={{ display: 'block', width: '100%', textAlign: 'center', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, background: ORANGE, color: '#fff', textDecoration: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }}>Choose Pro →</a>
              </div>

            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section id="contact" style={{ ...s.sectionBorder }}>
          <div style={s.container}>
            <div style={s.sectionHeader}>
              <div style={s.eyebrow}>Contact</div>
              <h2 style={s.h2}>Contact Our Team</h2>
              <p style={s.subtext}>Have questions regarding platform onboarding, custom integrations, or enterprise deployment? Reach out to us.</p>
            </div>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: 40, borderRadius: 20, border: `1px solid ${theme.borderCard}`, background: theme.bgCard, boxShadow: theme.shadowCard }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 20 }}>
                {[
                  { label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                  { label: 'Work Email', type: 'email', placeholder: 'john@company.com' },
                  { label: 'Phone / Mobile Number', type: 'tel', placeholder: '+91 98765 43210' },
                  { label: 'Company / Organization', type: 'text', placeholder: 'Acme Corp' },
                ].map((field, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, marginBottom: 8 }}>{field.label}</label>
                    <input type={field.type} placeholder={field.placeholder} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.borderColor}`, background: theme.bgInput, color: theme.textPrimary, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, marginBottom: 8, display: 'block' }}>How can our team help?</label>
                <textarea rows="4" placeholder="Tell us about your requirements..." style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.borderColor}`, background: theme.bgInput, color: theme.textPrimary, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <button style={{ width: '100%', padding: 16, borderRadius: 12, background: INDIGO, color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}>Submit Inquiry</button>
            </div>
          </div>
        </section>

        {/* ===== BOTTOM CTA ===== */}
        <section style={{ padding: '80px 24px', textAlign: 'center', background: isDark ? '#111827' : '#0B0F19', color: '#fff', overflow: 'hidden' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 16 }}>Ready to organize your business?</h2>
          <p style={{ color: '#94A3B8', marginBottom: 32, maxWidth: 520, margin: '0 auto 32px', fontSize: 15 }}>Bring your tasks, clients, projects, and priorities into one simple workspace.</p>
          <a href="https://app.anutask.com/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: ORANGE, color: '#fff', fontSize: 16, fontWeight: 700, padding: '18px 40px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 30px rgba(249,115,22,0.3)' }}>Start Free Forever →</a>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: `1px solid ${theme.borderColor}`, padding: '24px 0', background: theme.bgPrimary, transition: 'all 0.3s' }}>
        <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 12, color: theme.textMuted }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ color: theme.textPrimary, fontWeight: 700 }}>AnuTask</strong>
            <span>— Smart SaaS OS Platform</span>
          </div>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} AnuTask. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: theme.textMuted, textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: theme.textMuted, textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* ===== RESPONSIVE CSS ===== */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
