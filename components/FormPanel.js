'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, PRIORITY_COLORS, getS } from '../constants/taskConstants';

export default function FormPanel({ form, setForm, editTask, onSubmit, onClose, isMobile }) {
  const { t } = useTheme();
  const S = getS(t);
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', padding: 12, boxSizing: 'border-box' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: t.surface, borderRadius: 12, padding: 20, width: '100%', maxWidth: 400, border: '1px solid ' + t.border, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10, shadow: '0 20px 48px rgba(0,0,0,0.5)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: t.text, fontWeight: 600 }}>{editTask ? 'Configure Node' : 'New Directive'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.textSec, fontSize: 18, cursor: 'pointer', padding: 2 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input style={S.input} placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input style={{ ...S.input, padding: '8px 12px' }} placeholder="Description strings (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 2 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setForm({ ...form, category: c.id })} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid ' + (form.category === c.id ? '#6C5CE7' : t.border), background: form.category === c.id ? 'rgba(108,92,231,0.08)' : t.inputBg, color: form.category === c.id ? '#6C5CE7' : t.textSec, fontSize: 12, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.icon} {c.name}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 2 }}>
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: 3 }}>Sub-Namespace</label>
              <input style={S.input} placeholder="e.g. dev" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
            </div>
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: 3 }}>Deadline</label>
              <input type="date" style={{ ...S.input, padding: '8px 10px' }} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>

          <div style={{ marginTop: 2 }}>
            <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Priority Matrix</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {['high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid ' + (form.priority === p ? PRIORITY_COLORS[p] : t.border), background: form.priority === p ? PRIORITY_COLORS[p] + '12' : t.inputBg, color: form.priority === p ? PRIORITY_COLORS[p] : t.textSec, fontSize: 12, cursor: 'pointer' }}>{p[0].toUpperCase() + p.slice(1)}</button>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: 2 }}>
            <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Interval Frequency</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {['daily', 'weekly', 'one-time'].map(tp => (
                <button key={tp} onClick={() => setForm({ ...form, type: tp })} style={{ flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: '1px solid ' + (form.type === tp ? '#6C5CE7' : t.border), background: form.type === tp ? 'rgba(108,92,231,0.08)' : t.inputBg, color: form.type === tp ? '#6C5CE7' : t.textSec }}>{tp === 'one-time' ? 'Once' : tp[0].toUpperCase() + tp.slice(1)}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: '1px solid ' + t.border, background: t.inputBg, color: t.textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
            <button onClick={onSubmit} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', background: '#6C5CE7', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Deploy</button>
          </div>
        </div>

      </div>
    </div>
  );
}
