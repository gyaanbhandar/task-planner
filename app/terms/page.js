'use client';
import React from 'react';

const wrap = { maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0F172A', lineHeight: 1.7 };
const h1 = { fontSize: 32, fontWeight: 800, margin: '0 0 8px' };
const h2 = { fontSize: 20, fontWeight: 700, margin: '32px 0 10px' };
const p = { fontSize: 15, color: '#334155', margin: '0 0 12px' };
const muted = { fontSize: 13, color: '#94A3B8', margin: '0 0 32px' };

export default function TermsPage() {
  return (
    <div style={wrap}>
      <a href="/" style={{ fontSize: 14, color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>← Back to AnuTask</a>
      <h1 style={{ ...h1, marginTop: 24 }}>Terms of Service</h1>
      <p style={muted}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <p style={p}>By using AnuTask you agree to these terms. Please read them carefully.</p>

      <h2 style={h2}>Your account</h2>
      <p style={p}>You are responsible for keeping your login credentials secure and for all activity under your account. You must provide accurate information at signup.</p>

      <h2 style={h2}>Plans &amp; billing</h2>
      <p style={p}>AnuTask offers Free, Starter, and Pro plans. Paid plans renew automatically at the end of each billing cycle until cancelled. Prices are shown in INR (₹) or USD ($). Payments are processed securely by Cashfree Payments.</p>

      <h2 style={h2}>Trials</h2>
      <p style={p}>New accounts may receive a 14-day Pro trial. When the trial ends, the account moves to the Free plan automatically. No payment details are required to start a trial.</p>

      <h2 style={h2}>Cancellations &amp; refunds</h2>
      <p style={p}>You may cancel anytime from Settings → Billing. Cancellation stops the next renewal; paid access continues until the end of the current period. Coupons and discounts are applied at checkout and are non-transferable.</p>

      <h2 style={h2}>Acceptable use</h2>
      <p style={p}>You agree not to misuse the service, attempt to breach its security, or use it for unlawful purposes.</p>

      <h2 style={h2}>Availability</h2>
      <p style={p}>We work to keep AnuTask available and reliable but do not guarantee uninterrupted service. Features may change over time.</p>

      <h2 style={h2}>Contact</h2>
      <p style={p}>Questions about these terms? Email <a href="mailto:support@anutask.com" style={{ color: '#6366F1' }}>support@anutask.com</a>.</p>
    </div>
  );
}
