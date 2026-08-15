'use client';
import React, { useEffect, useRef } from 'react';
import { SUBSCRIPTION_PLANS } from '../constants/taskConstants';

const ACCENT = '#6366F1';
const ORANGE = '#FF8A00';

const Logo = ({ size = 36 }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
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
);

export default function LandingPage() {
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.style.background = window.scrollY > 40 ? 'rgba(255,255,255,0.92)' : 'transparent';
        navRef.current.style.backdropFilter = window.scrollY > 40 ? 'blur(20px)' : 'none';
        navRef.current.style.borderBottom = window.scrollY > 40 ? '1px solid #E2E8F0' : '1px solid transparent';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.ani-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: '📅', title: 'Smart Today View', desc: 'Auto-filtered daily tasks with priority-based reordering. See what matters right now.' },
    { icon: '🔄', title: 'Drag & Drop', desc: 'Reorder tasks with smooth drag-and-drop on both desktop and mobile devices.' },
    { icon: '👥', title: 'Client Workspaces', desc: 'Organize tasks by client with dedicated sub-category workspaces for every project.' },
    { icon: '🧠', title: 'AI Planner', desc: 'Claude-powered AI analyzes your tasks and suggests an optimal daily schedule.' },
    { icon: '🔔', title: 'Real-time Alerts', desc: 'Desktop notifications with sound at your scheduled task times. Never miss a deadline.' },
    { icon: '📥', title: 'Task Export', desc: 'Export all your tasks as CSV or JSON for backups, reporting, and analysis.' },
    { icon: '🔒', title: 'Data Isolation', desc: 'Row-level security ensures your data stays yours. No cross-user leakage ever.' },
    { icon: '🛡️', title: 'Admin Panel', desc: 'Super admin dashboard with user management, MRR tracking, and subscription controls.' },
    { icon: '💳', title: 'Flexible Billing', desc: 'Choose Auto-Pay or Manual Payment mode. Trial countdown dashboard included.' },
  ];

  const stats = [
    { num: '500+', label: 'Active Users' },
    { num: '15K+', label: 'Tasks Completed' },
    { num: '99.9%', label: 'Uptime' },
    { num: '4.9★', label: 'User Rating' },
  ];

  const trust = [
    { icon: '🔐', title: 'Row-Level Security', sub: 'Supabase RLS per user' },
    { icon: '☁️', title: 'Cloud-Native', sub: 'Built on Vercel + Supabase' },
    { icon: '🔒', title: 'Data Isolation', sub: 'Zero cross-user access' },
    { icon: '⚡', title: '99.9% Uptime', sub: 'Always available' },
  ];

  const s = {
    page: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#0F172A', background: '#FAFBFF', minHeight: '100vh', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' },
    nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 0', transition: 'all 0.3s', background: 'transparent', borderBottom: '1px solid transparent' },
    navInner: { maxWidth: 1140, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logoWrap: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
    logoText: { fontSize: 20, fontWeight: 800, color: '#312E81', letterSpacing: -0.5 },
    logoSub: { fontSize: 10, color: '#64748B', marginTop: -2 },
    navLinks: { display: 'flex', alignItems: 'center', gap: 28 },
    navLink: { fontSize: 14, fontWeight: 500, color: '#64748B', textDecoration: 'none' },
    btnJoin: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: `linear-gradient(135deg, ${ACCENT}, #4F46E5)`, color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', transition: 'all 0.25s' },
    hero: { position: 'relative', padding: '150px 32px 100px', textAlign: 'center', overflow: 'hidden' },
    heroOrb: (color, top, left, size) => ({ position: 'absolute', width: size, height: size, borderRadius: '50%', background: color, filter: 'blur(80px)', opacity: 0.1, top, left, pointerEvents: 'none' }),
    badge: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 50, fontSize: 13, fontWeight: 600, color: ACCENT, marginBottom: 28 },
    dot: { width: 7, height: 7, background: ORANGE, borderRadius: '50%', boxShadow: `0 0 8px ${ORANGE}` },
    h1: { fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -2, maxWidth: 700, margin: '0 auto 20px' },
    gradient: { background: `linear-gradient(135deg, ${ACCENT}, #818CF8, ${ORANGE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    heroP: { fontSize: 18, lineHeight: 1.65, color: '#64748B', maxWidth: 540, margin: '0 auto 36px' },
    heroCtas: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' },
    btnHero: { padding: '16px 40px', fontSize: 16, borderRadius: 14, fontWeight: 700, background: `linear-gradient(135deg, ${ACCENT}, #4F46E5)`, color: '#fff', textDecoration: 'none', boxShadow: '0 8px 30px rgba(99,102,241,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.25s' },
    btnSecondary: { padding: '16px 32px', background: '#fff', color: '#0F172A', border: '1.5px solid #E2E8F0', borderRadius: 14, fontSize: 16, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.25s' },
    heroSub: { fontSize: 13, color: '#94A3B8', marginTop: 18 },
    section: { padding: '80px 32px' },
    sectionWhite: { padding: '80px 32px', background: '#fff' },
    eyebrow: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 2.5, color: ACCENT, fontWeight: 700, marginBottom: 12 },
    h2: { fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1.15, marginBottom: 14 },
    secP: { fontSize: 16, color: '#64748B', lineHeight: 1.6 },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 1060, margin: '0 auto' },
    card: { padding: '32px 28px', borderRadius: 18, border: '1px solid #E2E8F0', background: '#FAFBFF', transition: 'all 0.3s', position: 'relative', overflow: 'hidden', opacity: 0, transform: 'translateY(24px)' },
    cardIcon: { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18, background: 'rgba(99,102,241,0.08)' },
    cardH3: { fontSize: 17, fontWeight: 700, marginBottom: 8 },
    cardP: { fontSize: 14, color: '#64748B', lineHeight: 1.55 },
    aiGrid: { maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' },
    aiCard: { background: '#fff', borderRadius: 24, padding: 36, border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0,0,0,0.04)' },
    aiMsg: (isUser) => ({ padding: '14px 18px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, marginBottom: 10, maxWidth: '85%', ...(isUser ? { background: ACCENT, color: '#fff', marginLeft: 'auto', borderBottomRightRadius: 4 } : { background: '#F1F5F9', color: '#0F172A', borderBottomLeftRadius: 4 }) }),
    planCard: (isPopular) => ({ borderRadius: 24, padding: '36px 28px', border: isPopular ? `2px solid ${ACCENT}` : '1px solid #E2E8F0', background: isPopular ? '#fff' : '#FAFBFF', position: 'relative', transition: 'all 0.3s', boxShadow: isPopular ? '0 20px 60px rgba(99,102,241,0.12)' : 'none', transform: isPopular ? 'scale(1.03)' : 'none', opacity: 0, transformOrigin: 'center' }),
    planBadge: (bg) => ({ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', padding: '5px 18px', borderRadius: 50, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: '#fff', background: bg }),
    planPrice: { fontSize: 42, fontWeight: 900, marginBottom: 4 },
    btnPlan: (fill) => ({ display: 'block', width: '100%', padding: 15, borderRadius: 14, fontSize: 15, fontWeight: 700, textAlign: 'center', textDecoration: 'none', border: fill ? 'none' : `1.5px solid ${ACCENT}`, background: fill ? `linear-gradient(135deg, ${ACCENT}, #4F46E5)` : 'transparent', color: fill ? '#fff' : ACCENT, cursor: 'pointer', boxShadow: fill ? '0 4px 16px rgba(99,102,241,0.3)' : 'none', transition: 'all 0.25s' }),
    ctaSection: { padding: '100px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A, #312E81)' },
    ctaGlow: (color, pos) => ({ position: 'absolute', width: 600, height: 600, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.12, background: color, ...pos }),
    footer: { padding: '30px 32px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: 13, color: '#94A3B8', background: '#fff' },
  };

  const aniUp = { opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' };

  return (
    <div style={s.page}>

      {/* ═══ NAV ═══ */}
      <nav ref={navRef} style={s.nav}>
        <div style={s.navInner}>
          <a href="#" style={s.logoWrap}>
            <Logo size={36} />
            <div>
              <div style={s.logoText}>AnuTask</div>
              <div style={s.logoSub}>Smart SaaS OS by Anukant</div>
            </div>
          </a>
          <div style={s.navLinks}>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#ai" style={s.navLink}>AI Planner</a>
            <a href="#pricing" style={s.navLink}>Pricing</a>
            <a href="/dashboard" style={s.btnJoin}>Join Now →</a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={s.hero}>
        <div style={s.heroOrb(ACCENT, -200, -100, 500)} />
        <div style={s.heroOrb(ORANGE, 'auto', 'auto', 400)} />

        <div style={{ marginBottom: 0 }}>
          <div style={s.badge}>
            <span style={s.dot} />
            AI-Powered Task Intelligence
          </div>
        </div>

        <h1 style={s.h1}>
          Your Business,<br />
          <span style={s.gradient}>Organized.</span>
        </h1>

        <p style={s.heroP}>
          The all-in-one SaaS operating system for managing tasks, clients, categories, and deadlines — with AI scheduling and real-time notifications.
        </p>

        <div style={s.heroCtas}>
          <a href="/dashboard" style={s.btnHero}>Join Now — It&apos;s Free →</a>
          <a href="#features" style={s.btnSecondary}>See Features</a>
        </div>

        <p style={s.heroSub}>
          <span style={{ color: '#10B981', fontWeight: 600 }}>✓</span> 14-day free trial &nbsp;·&nbsp; No credit card required &nbsp;·&nbsp; Cancel anytime
        </p>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section style={{ textAlign: 'center', padding: '50px 32px 60px' }}>
        <p style={{ fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, marginBottom: 24 }}>Trusted by professionals across India</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
          {stats.map((st, i) => (
            <div key={i} className="ani-up" style={{ ...aniUp, textAlign: 'center', transitionDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 36, fontWeight: 900, background: `linear-gradient(135deg, ${ACCENT}, ${ORANGE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{st.num}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" style={s.sectionWhite}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px' }}>
          <div style={s.eyebrow}>Features</div>
          <h2 style={s.h2}>Everything you need to stay on track</h2>
          <p style={s.secP}>From task management to client tracking — built for professionals who mean business.</p>
        </div>
        <div style={s.grid3}>
          {features.map((f, i) => (
            <div key={i} className="ani-up" style={{ ...s.card, transitionDelay: `${i * 0.05}s` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${ACCENT}, ${ORANGE})`, opacity: 0, transition: 'opacity 0.3s' }} />
              <div style={s.cardIcon}>{f.icon}</div>
              <h3 style={s.cardH3}>{f.title}</h3>
              <p style={s.cardP}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ AI PLANNER ═══ */}
      <section id="ai" style={s.section}>
        <div style={s.aiGrid}>
          <div>
            <div style={s.aiCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ fontSize: 13, color: '#64748B', marginLeft: 8 }}>AI Planner</span>
              </div>
              <div style={s.aiMsg(true)}>Aaj ke tasks plan kar do optimally 🧠</div>
              <div style={s.aiMsg(false)}>
                Done! Here&apos;s your optimized schedule:<br /><br />
                <strong>9:00 AM</strong> — Client call (ABC)<br />
                <strong>10:30 AM</strong> — Proposal draft<br />
                <strong>1:00 PM</strong> — Lead follow-ups<br />
                <strong>3:30 PM</strong> — Code review<br /><br />
                <span style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(99,102,241,0.12)', color: ACCENT, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>⚡ 4 tasks · Priority-sorted</span>
              </div>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 16 }}>Meet Your AI <span style={{ color: ORANGE }}>Planner</span></h2>
            <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.65, marginBottom: 24 }}>Powered by Claude AI, AnuTask&apos;s planner analyzes your tasks, deadlines, and priorities to create the perfect daily schedule — automatically.</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Priority-based intelligent scheduling', 'Deadline-aware task ordering', 'Natural language commands in Hindi & English', 'One-click schedule generation'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', fontSize: 15, color: '#334155' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${ACCENT}, #818CF8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={s.sectionWhite}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px' }}>
          <div style={s.eyebrow}>Pricing</div>
          <h2 style={s.h2}>Simple, transparent pricing</h2>
          <p style={s.secP}>Start free. Upgrade when you need more power.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 960, margin: '0 auto' }}>
          {SUBSCRIPTION_PLANS.map((plan, i) => {
            const isPopular = plan.id === 'pro';
            const badgeBg = plan.id === 'free_trial' ? '#94A3B8' : plan.id === 'starter' ? '#10B981' : `linear-gradient(135deg, ${ACCENT}, ${ORANGE})`;
            return (
              <div key={plan.id} className="ani-up" style={{ ...s.planCard(isPopular), transitionDelay: `${i * 0.1}s` }}>
                {plan.badge && (
                  <div style={s.planBadge(badgeBg)}>
                    {isPopular ? 'BEST VALUE ⚡' : plan.badge}
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 8 }}>{plan.name}</div>
                <div style={s.planPrice}>
                  {plan.price_inr === 0 ? 'Free' : <><span style={{ fontSize: 22, fontWeight: 700, verticalAlign: 'super' }}>₹</span>{plan.price_inr}<span style={{ fontSize: 16, fontWeight: 500, color: '#64748B' }}>/mo</span></>}
                </div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
                  {plan.price_usd > 0 ? `$${plan.price_usd} ${plan.duration}` : plan.duration}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
                  {plan.features.slice(0, 7).map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', fontSize: 13.5, color: '#334155' }}>
                      <span style={{ color: '#10B981', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 7 && (
                    <li style={{ padding: '4px 0', fontSize: 11, color: '#94A3B8' }}>+ {plan.features.length - 7} more features</li>
                  )}
                </ul>
                <a href="/dashboard" style={s.btnPlan(isPopular)}>
                  {plan.price_inr === 0 ? 'Start Free Trial' : isPopular ? 'Join Now →' : 'Get Started'}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section style={{ ...s.section, textAlign: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 40px' }}>
          <div style={s.eyebrow}>Security</div>
          <h2 style={s.h2}>Enterprise-grade security, startup-friendly pricing</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
          {trust.map((t, i) => (
            <div key={i} className="ani-up" style={{ ...aniUp, display: 'flex', alignItems: 'center', gap: 12, transitionDelay: `${i * 0.1}s` }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{t.icon}</div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{t.title}</strong>
                <span style={{ fontSize: 12, color: '#64748B' }}>{t.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={s.ctaSection}>
        <div style={s.ctaGlow(ACCENT, { top: -200, left: -100 })} />
        <div style={s.ctaGlow(ORANGE, { bottom: -200, right: -100 })} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 14 }}>Ready to organize your business?</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 36 }}>Join professionals who trust AnuTask for their daily workflow.</p>
          <a href="/dashboard" style={{ ...s.btnJoin, padding: '18px 48px', fontSize: 17, borderRadius: 16, background: `linear-gradient(135deg, ${ORANGE}, #F97316)`, boxShadow: '0 8px 30px rgba(255,138,0,0.35)' }}>
            Join Now — Start Free →
          </a>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={s.footer}>
        <p>© {new Date().getFullYear()} <a href="/" style={{ color: ACCENT, textDecoration: 'none' }}>AnuTask</a> — Smart SaaS OS by Anukant. All rights reserved.</p>
      </footer>

      {/* ═══ RESPONSIVE ═══ */}
      <style>{`
        @media (max-width: 900px) {
          #ai > div { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          nav > div > div:last-child { display: none !important; }
          nav > div::after { content: '☰'; font-size: 22px; color: #312E81; cursor: pointer; }
        }
      `}</style>
    </div>
  );
}
