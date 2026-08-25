'use client';
import React from 'react';

const wrap = { maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0F172A', lineHeight: 1.7 };
const h1 = { fontSize: 32, fontWeight: 800, margin: '0 0 8px' };
const h2 = { fontSize: 20, fontWeight: 700, margin: '32px 0 10px' };
const p = { fontSize: 15, color: '#334155', margin: '0 0 12px' };
const muted = { fontSize: 13, color: '#94A3B8', margin: '0 0 32px' };

export default function PrivacyPage() {
  return (
    <div style={wrap}>
      <a href="/" style={{ fontSize: 14, color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>← Back to AnuTask</a>
      <h1 style={{ ...h1, marginTop: 24 }}>Privacy Policy</h1>
      <p style={muted}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <p style={p}>AnuTask (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what data we collect, why we collect it, and how we handle it.</p>

      <h2 style={h2}>Information we collect</h2>
      <p style={p}>We collect the email address and name you provide at signup, the tasks, clients, and categories you create, and basic usage data such as AI Planner prompt counts. Payment information is processed by our payment provider (Cashfree Payments) and is never stored on our servers.</p>

      <h2 style={h2}>How we use your data</h2>
      <p style={p}>Your data is used solely to provide and improve the AnuTask service: storing your tasks, enforcing plan limits, processing subscriptions, and sending you reminders you have opted into. We do not sell your personal data.</p>

      <h2 style={h2}>Data storage &amp; security</h2>
      <p style={p}>Data is stored securely with row-level security so that each account can only access its own records. We use industry-standard encryption in transit.</p>

      <h2 style={h2}>Data retention</h2>
      <p style={p}>Deleted tasks are held in your Trash for 15 days before permanent removal. Completed tasks are automatically removed 30 days after completion, or immediately when you clear them. You may request full account deletion at any time.</p>

      <h2 style={h2}>Your rights</h2>
      <p style={p}>You can export your data (CSV/JSON, subject to plan), correct your profile, or delete your account. To exercise any right, contact us at the email below.</p>

      <h2 style={h2}>Contact</h2>
      <p style={p}>Questions about this policy? Email <a href="mailto:support@anutask.com" style={{ color: '#6366F1' }}>support@anutask.com</a>.</p>
    </div>
  );
}
