'use client';
import React from 'react';
import { SUBSCRIPTION_PLANS } from '../../constants/taskConstants';

const ACCENT = '#6366F1';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: '#0F172A', background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Nav */}
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
          <a href="#pricing" style={{ fontSize: '14px', color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
          <a href="/" style={{ padding: '10px 20px', background: ACCENT, color: '#FFF', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: ACCENT, marginBottom: '24px' }}>
          🚀 Now with AI-Powered Planning
        </div>
        <h1 style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', margin: '0 0 20px', color: '#0F172A' }}>
          Your Business,<br />
          <span style={{ color: ACCENT }}>Organized.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 32px' }}>
          AnuTask is the all-in-one SaaS operating system for managing tasks, clients, categories, and deadlines — with AI scheduling and real-time notifications.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ padding: '14px 28px', background: ACCENT, color: '#FFF', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            Start Free Trial →
          </a>
          <a href="#features" style={{ padding: '14px 28px', background: '#F1F5F9', color: '#0F172A', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
            See Features
          </a>
        </div>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '16px' }}>14-day free trial · No credit card required</p>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '60px 32px', background: '#FAFAFA' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 12px' }}>Everything you need to stay on track</h2>
            <p style={{ fontSize: '16px', color: '#64748B' }}>From task management to client tracking — built for professionals.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { icon: '📅', title: 'Smart Today View', desc: 'Auto-filtered daily tasks with priority-based reordering. See what matters now.' },
              { icon: '🔄', title: 'Drag & Drop', desc: 'Reorder tasks with smooth drag-and-drop on both desktop and mobile devices.' },
              { icon: '👥', title: 'Client Workspaces', desc: 'Organize tasks by client with dedicated sub-category workspaces.' },
              { icon: '🧠', title: 'AI Planner', desc: 'Claude-powered AI analyzes your tasks and suggests an optimal daily schedule.' },
              { icon: '🔔', title: 'Real-time Alerts', desc: 'Desktop notifications with sound at your scheduled task times. Never miss a deadline.' },
              { icon: '📥', title: 'Task Export', desc: 'Export all your tasks as CSV or JSON for backups, reporting, and analysis.' },
              { icon: '🔒', title: 'Data Isolation', desc: 'Row-level security ensures your data stays yours. No cross-user leakage.' },
              { icon: '🛡️', title: 'Admin Panel', desc: 'Super admin dashboard with user management, MRR tracking, and subscription controls.' },
              { icon: '💳', title: 'Flexible Billing', desc: 'Choose Auto-Pay or Manual Payment mode. Trial countdown dashboard included.' }
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

      {/* Pricing */}
      <section id="pricing" style={{ padding: '60px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 12px' }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: '16px', color: '#64748B' }}>Start free, upgrade when you need more.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {SUBSCRIPTION_PLANS.map((plan, i) => {
              const isPopular = plan.id === 'pro';
              return (
                <div key={plan.id} style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  border: isPopular ? `2px solid ${ACCENT}` : '1px solid #E4E4E7',
                  position: 'relative',
                  boxShadow: isPopular ? '0 8px 30px rgba(99,102,241,0.12)' : 'none'
                }}>
                  {isPopular && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: ACCENT, color: '#FFF', padding: '4px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A' }}>
                      {plan.price_inr === 0 ? 'Free' : `₹${plan.price_inr}`}
                    </span>
                    {plan.price_inr > 0 && <span style={{ fontSize: '14px', color: '#64748B' }}> {plan.duration}</span>}
                    {plan.price_usd > 0 && <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>${plan.price_usd} {plan.duration}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                        <span style={{ color: '#10B981', fontSize: '14px' }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <a href="/" style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '10px',
                    background: isPopular ? ACCENT : '#F1F5F9',
                    color: isPopular ? '#FFF' : '#0F172A',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {plan.price_inr === 0 ? 'Start Free Trial' : 'Get Started'}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '60px 32px', background: '#0F172A', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px', letterSpacing: '-0.5px' }}>Ready to organize your business?</h2>
        <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '24px' }}>Join professionals who trust AnuTask for their daily workflow.</p>
        <a href="/" style={{ display: 'inline-block', padding: '14px 32px', background: ACCENT, color: '#FFF', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          Get Started Free →
        </a>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 32px', borderTop: '1px solid #E4E4E7', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>
        © {new Date().getFullYear()} AnuTask SaaS. All rights reserved.
      </footer>
    </div>
  );
}
