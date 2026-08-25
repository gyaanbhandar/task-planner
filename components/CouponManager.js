'use client';
import React, { useState, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { PURCHASABLE_PLANS } from '../config/plans.config';

// Admin coupon management. Talks to /api/coupons with a shared-secret adminToken.
// The token is entered once and kept in component state only (not persisted).
export default function CouponManager() {
  const [adminToken, setAdminToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // New coupon form
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const call = async (payload) => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, adminToken }),
    });
    return res.json();
  };

  const loadCoupons = async () => {
    setLoading(true); setMsg('');
    const data = await call({ action: 'list' });
    if (data.coupons) { setCoupons(data.coupons); setAuthed(true); }
    else { setMsg(data.error || 'Failed to load coupons.'); setAuthed(false); }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!code.trim() || discountValue === '') { setMsg('Code and value are required.'); return; }
    setMsg('');
    const data = await call({
      action: 'create',
      coupon: {
        code: code.trim(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: Number(discountValue),
        currency,
        max_redemptions: maxRedemptions ? Number(maxRedemptions) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        active: true,
      },
    });
    if (data.success) {
      setMsg('✅ Coupon created.');
      setCode(''); setDescription(''); setDiscountValue(''); setMaxRedemptions(''); setExpiresAt('');
      loadCoupons();
    } else setMsg('Error: ' + (data.error || 'Could not create coupon.'));
  };

  const handleToggle = async (c) => {
    const data = await call({ action: 'toggle', id: c.id, active: !c.active });
    if (data.success) setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x));
    else setMsg('Error: ' + (data.error || 'Toggle failed.'));
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}? This cannot be undone.`)) return;
    const data = await call({ action: 'delete', id: c.id });
    if (data.success) setCoupons(prev => prev.filter(x => x.id !== c.id));
    else setMsg('Error: ' + (data.error || 'Delete failed.'));
  };

  const cardStyle = { background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', marginBottom: '20px' };
  const inputStyle = { padding: '10px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', boxSizing: 'border-box', width: '100%' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>🎟️ Coupon Management</h3>

      {/* Admin token gate */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label style={labelStyle}>Admin Token</label>
          <input type="password" value={adminToken} onChange={e => setAdminToken(e.target.value)} placeholder="ADMIN_PANEL_SECRET" style={inputStyle} />
        </div>
        <button onClick={loadCoupons} disabled={!adminToken || loading}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: (!adminToken || loading) ? 0.6 : 1 }}>
          {loading ? 'Loading...' : authed ? 'Refresh' : 'Unlock'}
        </button>
      </div>

      {msg && <div style={{ fontSize: '13px', marginBottom: '12px', color: msg.startsWith('✅') ? '#059669' : '#EF4444' }}>{msg}</div>}

      {authed && (
        <>
          {/* Create form */}
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}`, marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Create a coupon</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Code</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="WELCOME20" style={{ ...inputStyle, textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={discountType} onChange={e => setDiscountType(e.target.value)} style={inputStyle}>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat amount</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{discountType === 'percent' ? 'Percent (0-100)' : 'Amount'}</label>
                <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder={discountType === 'percent' ? '20' : '100'} style={inputStyle} />
              </div>
              {discountType === 'flat' && (
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              )}
              <div>
                <label style={labelStyle}>Max redemptions</label>
                <input type="number" value={maxRedemptions} onChange={e => setMaxRedemptions(e.target.value)} placeholder="unlimited" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Expires (optional)</label>
                <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="20% off any plan" style={inputStyle} />
              </div>
            </div>
            <button onClick={handleCreate}
              style={{ marginTop: '12px', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              + Create Coupon
            </button>
          </div>

          {/* Coupon list */}
          {coupons.length === 0 ? (
            <div style={{ fontSize: '13px', color: VISUAL_THEME.textSec, textAlign: 'center', padding: '20px 0' }}>No coupons yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: VISUAL_THEME.textSec, borderBottom: `1px solid ${VISUAL_THEME.border}` }}>
                    <th style={{ padding: '8px' }}>Code</th>
                    <th style={{ padding: '8px' }}>Discount</th>
                    <th style={{ padding: '8px' }}>Used</th>
                    <th style={{ padding: '8px' }}>Expires</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${VISUAL_THEME.borderAlt}` }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}>{c.code}<div style={{ fontWeight: 400, fontSize: '11px', color: VISUAL_THEME.textSec }}>{c.description}</div></td>
                      <td style={{ padding: '8px' }}>{c.discount_type === 'percent' ? `${c.discount_value}%` : `${c.currency} ${c.discount_value}`}</td>
                      <td style={{ padding: '8px' }}>{c.times_redeemed || 0}{c.max_redemptions ? ` / ${c.max_redemptions}` : ''}</td>
                      <td style={{ padding: '8px' }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: c.active ? '#ECFDF5' : '#FEF2F2', color: c.active ? '#059669' : '#EF4444' }}>
                          {c.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => handleToggle(c)} style={{ marginRight: '6px', padding: '4px 10px', borderRadius: '6px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFF', fontSize: '12px', cursor: 'pointer' }}>
                          {c.active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => handleDelete(c)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: '12px', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
