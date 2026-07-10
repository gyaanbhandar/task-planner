'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, PRIORITY_COLORS, getS } from '../constants/taskConstants';

export default function FormPanel({ form, setForm, editTask, onSubmit, onClose, isMobile }) {
  const { t } = useTheme();
  const S = getS(t);
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000aa' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: t.surface, borderRadius: 16, padding: 24, width: isMobile ? '92%' : 440, maxHeight: '90vh', overflowY: 'auto', border: '1px solid ' + t.border }}>
        <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: t.text }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.textSec, fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={S.input} placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea style={{ ...S.input, height: 80, resize: 'none' }} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          
          <label style={S.label}>Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setForm({ ...form, category: c.id })} style={{ padding: '8px', borderRadius: 8, border: '1px solid ' + (form.category === c.id ? '#6C5CE7' : t.borderAlt), background: form.category === c.id ? '#6C5CE718' : 'transparent', color: form.category === c.id ? '#6C5CE7' : t.textSec, fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>{c.icon} {c.name}</button>
            ))}
          </div>

          <label style={S.label}>Subcategory</label>
          <input style={S.input} placeholder="e.g. work project" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />

          <label style={S.label}>Deadline</label>
          <input type="date" style={S.input} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />

          <label style={S.label}>Priority</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['high', 'medium', 'low'].map(p => (
              <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid ' + (form.priority === p ? PRIORITY_COLORS[p] : t.borderAlt), background: form.priority === p ? PRIORITY_COLORS[p] + '18' : 'transparent', color: form.priority === p ? PRIORITY_COLORS[p] : t.textSec, fontSize: 13, cursor: 'pointer' }}>{p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '⚪'} {p[0].toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
          
          <label style={S.label}>Type</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['daily', 'weekly', 'monthly', 'one-time'].map(tp => (
              <button key={tp} onClick={() => setForm({ ...form, type: tp })} style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, cursor: 'pointer', border: '1px solid ' + (form.type === tp ? '#6C5CE7' : t.borderAlt), background: form.type === tp ? '#6C5CE718' : 'transparent', color: form.type === tp ? '#6C5CE7' : t.textSec }}>{tp[0].toUpperCase() + tp.slice(1)}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid ' + t.borderAlt, background: 'transparent', color: t.textSec, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button onClick={onSubmit} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#6C5CE7', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
