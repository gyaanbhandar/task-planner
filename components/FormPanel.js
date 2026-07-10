'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, PRIORITY_COLORS, getS } from '../constants/taskConstants';

export default function FormPanel({ form, setForm, editTask, onSubmit, onClose, isMobile }) {
  const { t } = useTheme();
  const S = getS(t);
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', padding: 16, boxSizing: 'border-box' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: t.surface, borderRadius: 14, padding: 24, width: '100%', maxWidth: 440, border: '1px solid ' + t.border, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 48px rgba(0,0,0,0.4)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, color: t.text, fontWeight: 700 }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.textSec, fontSize: 20, cursor: 'pointer', padding: 2 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <input style={S.input} placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          
          <div>
            <textarea style={{ ...S.input, height: 70, resize: 'none', lineHeight: '1.5' }} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          
          <div>
            <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setForm({ ...form, category: c.id })} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid ' + (form.category === c.id ? '#6C5CE7' : t.border), background: form.category === c.id ? 'rgba(108,92,231,0.08)' : t.inputBg, color: form.category === c.id ? '#6C5CE7' : t.textSec, fontSize: 13, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.icon} {c.name}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subcategory</label>
              <input style={S.input} placeholder="e.g. project x" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deadline</label>
              <input type="date" style={{ ...S.input, padding: '9px 10px' }} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid ' + (form.priority === p ? PRIORITY_COLORS[p] : t.border), background: form.priority === p ? PRIORITY_COLORS[p] + '12' : t.inputBg, color: form.priority === p ? PRIORITY_COLORS[p] : t.textSec, fontSize: 13, cursor: 'pointer' }}>{p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '⚪'} {p[0].toUpperCase() + p.slice(1)}</button>
              ))}
            </div>
          </div>
          
          <div>
            <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['daily', 'weekly', 'monthly', 'one-time'].map(tp => (
                <button key={tp} onClick={() => setForm({ ...form, type: tp })} style={{ flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid ' + (form.type === tp ? '#6C5CE7' : t.border), background: form.type === tp ? 'rgba(108,92,231,0.08)' : t.inputBg, color: form.type === tp ? '#6C5CE7' : t.textSec }}>{tp[0].toUpperCase() + tp.slice(1)}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: '1px solid ' + t.border, background: t.inputBg, color: t.textSec, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Cancel</button>
            <button onClick={onSubmit} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: 'none', background: '#6C5CE7', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Save</button>
          </div>
        </div>

      </div>
    </div>
  );
}
