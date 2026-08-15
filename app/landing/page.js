'use client';
import React, { useState } from 'react';
import {
  PLANS, PLAN_ORDER, CURRENCY_SYMBOLS, CURRENCIES,
  formatPrice, getAnnualSavingsText, COMPARISON_SECTIONS, PRICING_FAQS,
} from '../../config/plans.config';

const ACCENT = '#6366F1';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currency, setCurrency] = useState('INR');
  const [openFaq, setOpenFaq] = useState(null);

  const getPrice = (planId) => {
    const plan = PLANS[planId];
    if (!plan) return 0;
    return plan.pricing[currency]?.[billingCycle] ?? 0;
  };

  const getPriceLabel = (planId) => {
    const price = getPrice(planId);
    if (price === 0) return 'Free';
    return formatPrice(price, currency);
  };

  const getCycleLabel = (planId) => {
    const price = getPrice(planId);
    if (price === 0) return 'Forever';
    return billingCycle === 'yearly' ? '/year' : '/month';
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: '#0F172A', background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* =================== NAV =================== */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg viewBox="0 0 120 120" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="22" fill="#6366F1"/>
            <path d="M30 78L50 42L60 58L70 42L90 78" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M52 72L65 52L78 72" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <g transform="translate(60,30)"><circle r="3" fill="#FF8A00"/><line x1="0" y1="-6" x2="0" y2="-10" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/><line x1="5.2" y1="-3" x2="8.7" y2="-5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/><line x1="5.2" y1="3" x2="8.7" y2="5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/><line x1="-5.2" y1="-3" x2="-8.7" y2="-5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/><line x1="-5.2" y1="3" x2="-8.7" y2="5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/></g>
          </svg>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px', color: '#312E81' }}>AnuTask</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#features" style={{ fontSize: '14px', color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>Features</a>
          <a href="#ai-planner" style={{ fontSize: '14px', color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>AI Planner</a>
          <a href="#pricing" style={{ fontSize: '14px', color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
          <a href="/" style={{ fontSize: '14px', color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>Login</a>
          <a href="/" style={{ padding: '10px 20px', background: ACCENT, color: '#FFF', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Start Free</a>
        </div>
      </nav>

      {/* =================== HERO =================== */}
      <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: ACCENT, marginBottom: '24px' }}>
          ✨ AI-Powered Task Intelligence
        </div>
        <h1 style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', margin: '0 0 20px', color: '#0F172A' }}>
          Your Business,<br />
          <span style={{ color: ACCENT }}>Organized.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 32px' }}>
          The all-in-one SaaS operating system for managing tasks, clients, categories, and deadlines — with AI scheduling and real-time notifications.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ padding: '14px 28px', background: ACCENT, color: '#FFF', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            Start Free →
          </a>
          <a href="#features" style={{ padding: '14px 28px', background: '#F1F5F9', color: '#0F172A', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
            See How It Works
          </a>
        </div>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '16px' }}>✓ 14-day Pro trial · No credit card required · Cancel anytime</p>
      </section>

      {/* =================== TRUST BADGES =================== */}
      <section style={{ textAlign: 'center', padding: '40px 32px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '24px' }}>
          Trusted by professionals across India
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
          {[
            { value: '500+', label: 'Active Users' },
            { value: '15K+', label: 'Tasks Completed' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9★', label: 'User Rating' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* =================== FEATURES =================== */}
      <section id="features" style={{ padding: '60px 32px', background: '#FAFAFA' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: ACCENT, textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>Features</p>
            <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 12px' }}>Everything you need to stay on track</h2>
            <p style={{ fontSize: '16px', color: '#64748B' }}>From task management to client tracking — built for professionals who mean business.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { icon: '📅', title: 'Smart Today View', desc: 'Auto-filtered daily tasks with priority-based reordering. See what matters right now.' },
              { icon: '🔄', title: 'Drag & Drop', desc: 'Reorder tasks with smooth drag-and-drop on both desktop and mobile devices.' },
              { icon: '👥', title: 'Client Workspaces', desc: 'Organize tasks by client with dedicated sub-category workspaces for every project.' },
              { icon: '🧠', title: 'AI Planner', desc: 'Claude-powered AI analyzes your tasks and suggests an optimal daily schedule.' },
              { icon: '🔔', title: 'Real-time Alerts', desc: 'Desktop notifications with sound at your scheduled task times. Never miss a deadline.' },
              { icon: '📥', title: 'Task Export', desc: 'Export all your tasks as CSV or JSON for backups, reporting, and analysis.' },
              { icon: '🔒', title: 'Data Isolation', desc: 'Row-level security ensures your data stays yours. No cross-user leakage ever.' },
              { icon: '🛡️', title: 'Admin Panel', desc: 'Super admin dashboard with user management, MRR tracking, and subscription controls.' },
              { icon: '💳', title: 'Flexible Billing', desc: 'Monthly and yearly plans with transparent pricing. No hidden fees.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E4E4E7' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: '#0F172A' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== AI PLANNER SECTION =================== */}
      <section id="ai-planner" style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '48px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E4E4E7', padding: '24px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>🧠 AI Planner</div>
            <div style={{ background: ACCENT, color: '#FFF', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '12px' }}>
              Aaj ke tasks plan kar do optimally 🎯
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              Done! Here&apos;s your optimized schedule:<br /><br />
              9:00 AM — Client call (ABC)<br />
              10:30 AM — Proposal draft<br />
              1:00 PM — Lead follow-up<br />
              3:30 PM — Code review<br /><br />
              <span style={{ fontSize: '11px', color: '#10B981' }}>✓ 4 tasks · Priority sorted</span>
            </div>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
              Meet Your AI <span style={{ color: ACCENT }}>Planner</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
              Powered by Claude AI, AnuTask&apos;s planner analyzes your tasks, deadlines, and priorities to create the perfect daily schedule — automatically.
            </p>
            {[
              'Priority-based intelligent scheduling',
              'Deadline-aware task ordering',
              'Natural language commands in Hindi & English',
              'One-click schedule generation',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: ACCENT, flexShrink: 0 }}>✓</div>
                <span style={{ fontSize: '14px', color: '#475569' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== PRICING =================== */}
      <section id="pricing" style={{ padding: '80px 32px', background: '#FAFAFA' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: ACCENT, textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>Pricing</p>
            <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 12px' }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: '16px', color: '#64748B' }}>Start free. Upgrade when you need more power.</p>
          </div>

          {/* Billing Toggle + Currency */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {/* Monthly / Yearly Toggle */}
            <div style={{ display: 'flex', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E4E4E7', padding: '3px', gap: '2px' }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  background: billingCycle === 'monthly' ? ACCENT : 'transparent',
                  color: billingCycle === 'monthly' ? '#FFF' : '#64748B',
                }}
              >Monthly</button>
              <button
                onClick={() => setBillingCycle('yearly')}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  background: billingCycle === 'yearly' ? ACCENT : 'transparent',
                  color: billingCycle === 'yearly' ? '#FFF' : '#64748B',
                }}
              >Yearly</button>
            </div>
            {billingCycle === 'yearly' && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', background: '#ECFDF5', padding: '4px 12px', borderRadius: '12px' }}>
                {getAnnualSavingsText()}
              </span>
            )}

            {/* Currency Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Prices in</span>
              <div style={{ display: 'flex', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E4E4E7', padding: '2px', gap: '2px' }}>
                {Object.keys(CURRENCIES).map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      background: currency === cur ? '#0F172A' : 'transparent',
                      color: currency === cur ? '#FFF' : '#64748B',
                    }}
                  >{cur}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Plan Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', maxWidth: '1050px', margin: '0 auto' }}>
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];
              const isPro = plan.isRecommended;
              const isComingSoon = plan.isComingSoon;
              const price = getPrice(planId);

              return (
                <div key={planId} style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  border: isPro ? `2px solid ${ACCENT}` : '1px solid #E4E4E7',
                  position: 'relative',
                  boxShadow: isPro ? '0 8px 30px rgba(99,102,241,0.12)' : 'none',
                  opacity: isComingSoon ? 0.85 : 1,
                }}>
                  {/* Badge */}
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: isPro ? ACCENT : plan.badge === 'POPULAR' ? '#F59E0B' : plan.badge === 'FREE FOREVER' ? '#10B981' : '#7C3AED',
                    color: '#FFF', padding: '4px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>

                  {/* Plan Name */}
                  <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0 4px', color: '#0F172A' }}>{plan.name}</h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.4 }}>{plan.positioning}</p>

                  {/* Price */}
                  <div style={{ marginBottom: '24px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A' }}>
                      {getPriceLabel(planId)}
                    </span>
                    {price > 0 && (
                      <span style={{ fontSize: '14px', color: '#64748B' }}>{getCycleLabel(planId)}</span>
                    )}
                  </div>

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', minHeight: '200px' }}>
                    {plan.featureList.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#475569' }}>
                        <span style={{ color: '#10B981', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {isComingSoon ? (
                    <button disabled style={{
                      width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
                      background: '#F1F5F9', color: '#94A3B8', border: '1px dashed #CBD5E1', cursor: 'not-allowed',
                    }}>
                      Coming Soon
                    </button>
                  ) : (
                    <a href="/" style={{
                      display: 'block', textAlign: 'center', padding: '12px', borderRadius: '10px',
                      background: isPro ? ACCENT : price === 0 ? '#0F172A' : '#F1F5F9',
                      color: isPro || price === 0 ? '#FFF' : '#0F172A',
                      textDecoration: 'none', fontWeight: 600, fontSize: '14px',
                      boxShadow: isPro ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                    }}>
                      {isPro ? (plan.ctaTrial || plan.cta) : plan.cta}
                    </a>
                  )}
                  {plan.ctaSubtext && !isComingSoon && (
                    <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', margin: '8px 0 0' }}>{plan.ctaSubtext}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* =================== COMPARISON TABLE =================== */}
          <div style={{ marginTop: '64px', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, textAlign: 'center', marginBottom: '32px' }}>Compare Plans</h3>
            {COMPARISON_SECTIONS.map((section, si) => (
              <div key={si} style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 0', borderBottom: `2px solid ${ACCENT}`, marginBottom: '8px' }}>
                  {section.title}
                </div>
                {section.rows.map((row, ri) => (
                  <div key={ri} style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '8px',
                    padding: '10px 0', borderBottom: '1px solid #F1F5F9', alignItems: 'center', fontSize: '13px',
                  }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{row.label}</span>
                    {['free', 'starter', 'pro', 'business'].map((planKey) => {
                      const val = row[planKey];
                      if (typeof val === 'boolean') {
                        return (
                          <span key={planKey} style={{ textAlign: 'center', color: val ? '#10B981' : '#CBD5E1', fontSize: '16px' }}>
                            {val ? '✓' : '—'}
                          </span>
                        );
                      }
                      return <span key={planKey} style={{ textAlign: 'center', color: '#475569' }}>{val}</span>;
                    })}
                  </div>
                ))}
              </div>
            ))}
            {/* Column headers for mobile (hidden on desktop, shown via responsive) */}
            <style>{`
              @media (max-width: 700px) {
                .comparison-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>

          {/* =================== FAQ =================== */}
          <div style={{ marginTop: '64px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, textAlign: 'center', marginBottom: '32px' }}>Frequently Asked Questions</h3>
            {PRICING_FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #E4E4E7', padding: '16px 0' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{faq.q}</span>
                  <span style={{ fontSize: '18px', color: '#94A3B8', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: '12px 0 0', paddingRight: '24px' }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== SECURITY =================== */}
      <section style={{ padding: '60px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', color: ACCENT, textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>Security</p>
        <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 32px', letterSpacing: '-0.5px' }}>Enterprise-grade security,<br />startup-friendly pricing</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {[
            { icon: '🔒', title: 'Row-Level Security', desc: 'Supabase RLS per user' },
            { icon: '☁️', title: 'Cloud-Native', desc: 'Built on Vercel + Supabase' },
            { icon: '🛡️', title: 'Data Isolation', desc: 'Zero cross-user access' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', maxWidth: '180px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{s.title}</div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>⚡</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>99.9% Uptime</span>
        </div>
      </section>

      {/* =================== FOOTER CTA =================== */}
      <section style={{ padding: '60px 32px', background: '#0F172A', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px', letterSpacing: '-0.5px' }}>Start Organizing Your Work — Free</h2>
        <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '24px' }}>Join professionals who trust AnuTask for their daily workflow.</p>
        <a href="/" style={{ display: 'inline-block', padding: '14px 32px', background: ACCENT, color: '#FFF', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          Start Free →
        </a>
      </section>

      {/* =================== FOOTER =================== */}
      <footer style={{ padding: '24px 32px', borderTop: '1px solid #E4E4E7', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>
        © {new Date().getFullYear()} AnuTask — Smart SaaS OS by Anukant. All rights reserved.
      </footer>
    </div>
  );
}
