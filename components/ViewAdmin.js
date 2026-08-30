'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';
import { PLANS, PURCHASABLE_PLANS, getPlanPrice, formatPrice } from '../config/plans.config';

// Dark admin theme — deliberately different from the user app.
const T = {
  bg: '#0B1120',
  panel: '#111827',
  panelAlt: '#0F1729',
  border: '#1F2937',
  borderAlt: '#273244',
  text: '#F1F5F9',
  textSec: '#94A3B8',
  textDim: '#64748B',
  accent: '#6366F1',
  accentSoft: 'rgba(99,102,241,0.15)',
  green: '#10B981',
  greenSoft: 'rgba(16,185,129,0.12)',
  amber: '#F59E0B',
  amberSoft: 'rgba(245,158,11,0.12)',
  red: '#EF4444',
  redSoft: 'rgba(239,68,68,0.12)',
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const daysLeft = (d) => {
  if (!d) return null;
  const diff = new Date(d) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const planName = (id) => PLANS[id]?.name || (id === 'free_trial' ? 'Pro Trial' : id || '—');

export default function ViewAdmin({ session, adminEmail }) {
  const email = adminEmail || session?.user?.email;

  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [createMsg, setCreateMsg] = useState('');

  // Row action drawer
  const [selected, setSelected] = useState(null);        // user being edited
  const [drawerTab, setDrawerTab] = useState('plan');    // plan | offer
  const [planForm, setPlanForm] = useState({});
  const [offerForm, setOfferForm] = useState({ planId: 'pro', days: 30, billingCycle: 'monthly', note: '' });
  const [savingRow, setSavingRow] = useState(false);
  const [rowMsg, setRowMsg] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setErr('');
    try {
      const [u, m] = await Promise.all([
        authService.adminListUsers(email),
        authService.adminGetMetrics(email),
      ]);
      setUsers(u);
      setMetrics(m);
    } catch (e) {
      setErr(e.message || 'Failed to load admin data');
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  const handleBlock = async (u) => {
    try {
      await authService.toggleUserBlock(u.id, !u.is_blocked, email);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_blocked: !u.is_blocked } : x)));
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleCreate = async () => {
    if (!newUser.email || !newUser.password) return;
    setCreateMsg('');
    try {
      await authService.adminCreateUser(newUser.email, newUser.password, newUser.name, email);
      setCreateMsg('✓ User created with 14-day trial.');
      setNewUser({ name: '', email: '', password: '' });
      loadAll();
    } catch (e) { setCreateMsg('Error: ' + e.message); }
  };

  const openDrawer = (u) => {
    setSelected(u);
    setDrawerTab('plan');
    setRowMsg('');
    setPlanForm({
      subscription_plan: u.subscription_plan || 'free',
      subscription_status: u.subscription_status || 'active',
      billing_cycle: u.billing_cycle || 'monthly',
      currency: u.currency || 'INR',
      payment_method: u.payment_method || 'manual',
      current_period_end: u.current_period_end ? u.current_period_end.slice(0, 10) : '',
    });
    setOfferForm({ planId: 'pro', days: 30, billingCycle: 'monthly', note: '' });
  };

  const savePlan = async () => {
    if (!selected) return;
    setSavingRow(true); setRowMsg('');
    try {
      const updates = { ...planForm };
      if (updates.current_period_end) {
        updates.current_period_end = new Date(updates.current_period_end + 'T23:59:59').toISOString();
      } else delete updates.current_period_end;
      await authService.adminUpdateSubscription(selected.id, updates, email);
      setRowMsg('✓ Subscription updated.');
      await loadAll();
      setSelected((s) => (s ? { ...s, ...planForm } : s));
    } catch (e) { setRowMsg('Error: ' + e.message); }
    setSavingRow(false);
  };

  const applyOffer = async () => {
    if (!selected) return;
    setSavingRow(true); setRowMsg('');
    try {
      const res = await authService.adminApplyOffer(selected.id, offerForm, email);
      setRowMsg(`✓ Offer applied. Active until ${fmtDate(res.until)}.`);
      await loadAll();
    } catch (e) { setRowMsg('Error: ' + e.message); }
    setSavingRow(false);
  };

  const filtered = useMemo(() => {
    let list = users;
    if (statusFilter !== 'all') {
      list = list.filter((u) => {
        if (statusFilter === 'active') return u.subscription_status === 'active';
        if (statusFilter === 'trial') return ['trial', 'trialing'].includes(u.subscription_status);
        if (statusFilter === 'blocked') return u.is_blocked;
        if (statusFilter === 'expired') return u.subscription_status === 'expired';
        return true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((u) =>
        (u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q));
    }
    return list;
  }, [users, searchQuery, statusFilter]);

  const sym = (cur) => (cur === 'USD' ? '$' : '₹');

  const statCards = metrics ? [
    { label: 'Total Users', value: metrics.totalUsers, sub: `${metrics.activeUsers} active`, color: T.accent, icon: '👥' },
    { label: 'Paid Subscribers', value: metrics.activePaid, sub: `${metrics.trialUsers} on trial`, color: T.green, icon: '💎' },
    { label: 'MRR', value: `₹${(metrics.mrr || 0).toLocaleString('en-IN')}`, sub: `₹${(metrics.revenueThisMonth || 0).toLocaleString('en-IN')} this month`, color: T.amber, icon: '💰' },
    { label: 'Expiring in 7 days', value: metrics.expiringSoon, sub: `${metrics.blockedUsers} blocked`, color: T.red, icon: '⏳' },
  ] : [];

  const card = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {err && (
        <div style={{ ...card, padding: '14px 18px', borderColor: T.red, background: T.redSoft, color: '#FCA5A5', fontSize: '13px' }}>
          {err} — check that you're seeded in <code>admin_users</code> and listed in <code>ADMIN_EMAILS</code>.
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
        {(loading && !metrics ? [0, 1, 2, 3] : statCards).map((s, i) => (
          <div key={i} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: T.textSec, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{s.label || '—'}</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: s.color || T.text, lineHeight: 1 }}>{s.value ?? '—'}</div>
              <div style={{ fontSize: '11px', color: T.textDim, marginTop: '6px' }}>{s.sub || ''}</div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: (s.color || T.accent) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{s.icon || '•'}</div>
          </div>
        ))}
      </div>

      {/* Payment method + plan distribution */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: T.text, marginBottom: '14px' }}>💳 Payment Method (active subs)</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, background: T.greenSoft, borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: T.textSec, marginBottom: '4px' }}>Automatic</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: T.green }}>{metrics.automaticCount}</div>
              </div>
              <div style={{ flex: 1, background: T.amberSoft, borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: T.textSec, marginBottom: '4px' }}>Manual</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: T.amber }}>{metrics.manualCount}</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: T.textDim, marginTop: '12px' }}>
              Total collected: ₹{(metrics.revenueTotal || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: T.text, marginBottom: '14px' }}>📊 Plan Distribution</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(metrics.planCounts || {}).sort((a, b) => b[1] - a[1]).map(([id, count]) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: T.textSec }}>{planName(id)}</span>
                  <span style={{ color: T.text, fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User management */}
      <div style={{ ...card, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: T.text }}>👤 User Management</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${T.borderAlt}`, background: T.panelAlt, color: T.text, fontSize: '12px' }}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
              <option value="blocked">Blocked</option>
            </select>
            <input placeholder="Search name or email…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${T.borderAlt}`, background: T.panelAlt, color: T.text, fontSize: '12px', width: '200px' }} />
            <button onClick={() => setShowCreateUser(!showCreateUser)}
              style={{ padding: '8px 14px', background: T.accent, color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Create User</button>
          </div>
        </div>

        {showCreateUser && (
          <div style={{ marginBottom: '18px', padding: '16px', background: T.panelAlt, borderRadius: '12px', border: `1px solid ${T.borderAlt}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <input placeholder="Full name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} style={inp} />
              <input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} style={inp} />
              <input placeholder="Temp password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} style={inp} />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={handleCreate} style={{ padding: '9px 18px', background: T.accent, color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Create User</button>
              <button onClick={() => setShowCreateUser(false)} style={{ padding: '9px 14px', background: 'transparent', color: T.textSec, border: `1px solid ${T.borderAlt}`, borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
              {createMsg && <span style={{ fontSize: '12px', color: createMsg.startsWith('Error') ? T.red : T.green, fontWeight: 600 }}>{createMsg}</span>}
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.borderAlt}` }}>
                {['User', 'Plan', 'Status', 'Payment', 'Expiry', 'Joined', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: T.textDim, fontWeight: 600, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: T.textDim }}>Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: T.textDim }}>No users found</td></tr>
              ) : filtered.map((u) => {
                const end = u.current_period_end || u.trial_end;
                const dl = daysLeft(end);
                const expiringSoon = dl != null && dl >= 0 && dl <= 7;
                const expired = dl != null && dl < 0;
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: T.text }}>{u.full_name || u.email?.split('@')[0] || '—'}</div>
                      <div style={{ color: T.textDim, fontSize: '11px' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ ...pill, background: T.accentSoft, color: '#A5B4FC' }}>{planName(u.subscription_plan)}</span>
                      {u.offer_note && <div style={{ fontSize: '10px', color: T.amber, marginTop: '3px' }}>🎁 {u.offer_note}</div>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {u.is_blocked
                        ? <span style={{ ...pill, background: T.redSoft, color: '#FCA5A5' }}>Blocked</span>
                        : <span style={{ ...pill, background: u.subscription_status === 'active' ? T.greenSoft : T.amberSoft, color: u.subscription_status === 'active' ? '#6EE7B7' : '#FCD34D' }}>{u.subscription_status}</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ ...pill, background: u.payment_method === 'automatic' ? T.greenSoft : (u.payment_method === 'manual' ? T.amberSoft : T.panelAlt), color: u.payment_method === 'automatic' ? '#6EE7B7' : (u.payment_method === 'manual' ? '#FCD34D' : T.textDim) }}>
                        {u.payment_method === 'automatic' ? '⚡ Auto' : u.payment_method === 'manual' ? '✋ Manual' : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: expired ? T.red : expiringSoon ? T.amber : T.textSec }}>
                      {fmtDate(end)}{dl != null && dl >= 0 && <span style={{ fontSize: '10px', display: 'block', color: T.textDim }}>{dl}d left</span>}
                      {expired && <span style={{ fontSize: '10px', display: 'block' }}>expired</span>}
                    </td>
                    <td style={{ padding: '12px 14px', color: T.textDim }}>{fmtDate(u.created_at)}</td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => openDrawer(u)} style={{ ...miniBtn, background: T.accentSoft, color: '#A5B4FC', marginRight: '6px' }}>Manage</button>
                      <button onClick={() => handleBlock(u)} style={{ ...miniBtn, background: u.is_blocked ? T.greenSoft : T.redSoft, color: u.is_blocked ? '#6EE7B7' : '#FCA5A5' }}>{u.is_blocked ? 'Unblock' : 'Block'}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage drawer */}
      {selected && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '460px', height: '100%', background: T.bg, borderLeft: `1px solid ${T.border}`, padding: '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: T.text }}>{selected.full_name || selected.email?.split('@')[0]}</div>
                <div style={{ fontSize: '12px', color: T.textDim }}>{selected.email}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.textSec, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {[['plan', 'Change Plan'], ['offer', 'Apply Offer']].map(([id, label]) => (
                <button key={id} onClick={() => { setDrawerTab(id); setRowMsg(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${drawerTab === id ? T.accent : T.border}`, background: drawerTab === id ? T.accentSoft : T.panel, color: drawerTab === id ? '#A5B4FC' : T.textSec, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>{label}</button>
              ))}
            </div>

            {drawerTab === 'plan' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Plan">
                  <select value={planForm.subscription_plan} onChange={(e) => setPlanForm({ ...planForm, subscription_plan: e.target.value })} style={sel}>
                    {Object.values(PLANS).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={planForm.subscription_status} onChange={(e) => setPlanForm({ ...planForm, subscription_status: e.target.value })} style={sel}>
                    {['active', 'trialing', 'trial', 'expired', 'cancelled', 'free'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Billing">
                    <select value={planForm.billing_cycle} onChange={(e) => setPlanForm({ ...planForm, billing_cycle: e.target.value })} style={sel}>
                      <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                    </select>
                  </Field>
                  <Field label="Currency">
                    <select value={planForm.currency} onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })} style={sel}>
                      <option value="INR">INR ₹</option><option value="USD">USD $</option>
                    </select>
                  </Field>
                </div>
                <Field label="Payment method">
                  <select value={planForm.payment_method} onChange={(e) => setPlanForm({ ...planForm, payment_method: e.target.value })} style={sel}>
                    <option value="manual">✋ Manual</option><option value="automatic">⚡ Automatic</option><option value="none">None</option>
                  </select>
                </Field>
                <Field label="Expiry / renewal date">
                  <input type="date" value={planForm.current_period_end} onChange={(e) => setPlanForm({ ...planForm, current_period_end: e.target.value })} style={sel} />
                </Field>
                <div style={{ fontSize: '11px', color: T.textDim, background: T.panel, padding: '10px 12px', borderRadius: '8px', border: `1px solid ${T.border}` }}>
                  Price for this plan: {sym(planForm.currency)}{(getPlanPrice(planForm.subscription_plan, planForm.currency, planForm.billing_cycle) || 0).toLocaleString('en-IN')} / {planForm.billing_cycle}
                </div>
                <button onClick={savePlan} disabled={savingRow} style={saveBtn}>{savingRow ? 'Saving…' : 'Save Changes'}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', color: T.textDim }}>Grant a plan for a fixed number of days. Marked as a manual offer.</div>
                <Field label="Grant plan">
                  <select value={offerForm.planId} onChange={(e) => setOfferForm({ ...offerForm, planId: e.target.value })} style={sel}>
                    {PURCHASABLE_PLANS.map((id) => <option key={id} value={id}>{PLANS[id].name}</option>)}
                  </select>
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Duration (days)">
                    <input type="number" min="1" value={offerForm.days} onChange={(e) => setOfferForm({ ...offerForm, days: e.target.value })} style={sel} />
                  </Field>
                  <Field label="Billing tag">
                    <select value={offerForm.billingCycle} onChange={(e) => setOfferForm({ ...offerForm, billingCycle: e.target.value })} style={sel}>
                      <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                    </select>
                  </Field>
                </div>
                <Field label="Note (optional)">
                  <input placeholder="e.g. Diwali offer, friend of founder…" value={offerForm.note} onChange={(e) => setOfferForm({ ...offerForm, note: e.target.value })} style={sel} />
                </Field>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[7, 30, 90, 365].map((d) => (
                    <button key={d} onClick={() => setOfferForm({ ...offerForm, days: d })} style={{ ...miniBtn, background: T.panel, color: T.textSec, border: `1px solid ${T.border}` }}>{d}d</button>
                  ))}
                </div>
                <button onClick={applyOffer} disabled={savingRow} style={saveBtn}>{savingRow ? 'Applying…' : `Apply Offer (${offerForm.days} days)`}</button>
              </div>
            )}

            {rowMsg && <div style={{ marginTop: '14px', fontSize: '12px', fontWeight: 600, color: rowMsg.startsWith('Error') ? T.red : T.green }}>{rowMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const inp = { padding: '10px 12px', borderRadius: '8px', border: `1px solid ${T.borderAlt}`, background: T.bg, color: T.text, fontSize: '12px', boxSizing: 'border-box' };
const sel = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${T.borderAlt}`, background: T.bg, color: T.text, fontSize: '13px', boxSizing: 'border-box' };
const pill = { padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
const miniBtn = { padding: '5px 11px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer' };
const saveBtn = { marginTop: '4px', padding: '12px', borderRadius: '10px', border: 'none', background: T.accent, color: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' };

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: T.textSec, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}
