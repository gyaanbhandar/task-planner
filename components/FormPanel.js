'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, PRIORITY_COLORS, getS } from '../constants/taskConstants';

export default function FormPanel({ form, setForm, editTask, onSubmit, onClose, isMobile }) {
  const { theme, t } = useTheme();
  const S = getS(t);

  // High contrast adaptive border and ambient shadow for Dark Mode isolation
  const modalBorder = theme === 'dark' ? '1px solid #282830' : '1px solid ' + t.border;
  const modalShadow = theme === 'dark' 
    ? '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.15)' 
    : '0 24px 64px rgba(0,0,0,0.15)';
  
  return (
    <div 
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: 16, boxSizing: 'border-box' }} 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: t.surface, borderRadius: 16, padding: 28, width: '100%', maxWidth: 450, border: modalBorder, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: modalShadow }}>
        
        {/* Form Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, color: t.text, fontWeight: 700, letterSpacing: '-0.3px' }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background: theme === 'dark' ? '#1C1C1E' : '#F4F4F5', border: 'none', borderRadius: '50%', color: t.textSec, fontSize: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main Inputs */}
          <div>
            <input style={{ ...S.input, background: theme === 'dark' ? '#141416' : t.inputBg, border: theme === 'dark' ? '1px solid #222227' : '1px solid ' + t.border }} placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          
          <div>
            <textarea style={{ ...S.input, background: theme === 'dark' ? '#141416' : t.inputBg, border: theme === 'dark' ? '1px solid #222227' : '1px solid ' + t.border, height: 75, resize: 'none', lineHeight: '1.5' }} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          
          {/* Category Engine Map Grid */}
          <div>
            <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setForm({ ...form, category: c.id })} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid ' + (form.category === c.id ? '#6C5CE7' : theme === 'dark' ? '#222227' : t.border), background: form.category === c.id ? 'rgba(108,92,231,0.12)' : theme === 'dark' ? '#141416' : t.inputBg, color: form.category === c.id ? '#8275f0' : t.textSec, fontSize: 13, fontWeight: form.category === c.id ? 600 : 500, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}>{c.icon} &nbsp;{c.name}</button>
              ))}
            </div>
          </div>

          {/* Subcategory and Date Setup row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subcategory</label>
              <input style={{ ...S.input, background: theme === 'dark' ? '#141416' : t.inputBg, border: theme === 'dark' ? '1px solid #222227' : '1px solid ' + t.border }} placeholder="e.g. project x" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deadline</label>
              <input type="date" style={{ ...S.input, background: theme === 'dark' ? '#141416' : t.inputBg, border: theme === 'dark' ? '1px solid #222227' : '1px solid ' + t.border, padding: '9px 10px', colorScheme: theme }} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>

          {/* Priority Matrix Selector */}
          <div>
            <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid ' + (form.priority === p ? PRIORITY_COLORS[p] : theme === 'dark' ? '#222227' : t.border), background: form.priority === p ? PRIORITY_COLORS[p] + '18' : theme === 'dark' ? '#141416' : t.inputBg, color: form.priority === p ? PRIORITY_COLORS[p] : t.textSec, fontSize: 13, fontWeight: form.priority === p ? 600 : 500, cursor: 'pointer', transition: 'all 0.15s ease' }}>{p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '⚪'} {p[0].toUpperCase() + p.slice(1)}</button>
              ))}
            </div>
          </div>
          
          {/* Recurrence Pattern Configuration */}
          <div>
            <label style={{ fontSize: 11, color: t.textSec, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['daily', 'weekly', 'monthly', 'one-time'].map(tp => (
                <button key={tp} onClick={() => setForm({ ...form, type: tp })} style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid ' + (form.type === tp ? '#6C5CE7' : theme === 'dark' ? '#222227' : t.border), background: form.type === tp ? 'rgba(108,92,231,0.12)' : theme === 'dark' ? '#141416' : t.inputBg, color: form.type === tp ? '#8275f0' : t.textSec, fontWeight: form.type === tp ? 600 : 500, transition: 'all 0.15s ease' }}>{tp[0].toUpperCase() + tp.slice(1)}</button>
              ))}
            </div>
          </div>

          {/* Dialog Action CTA Triggers */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid ' + (theme === 'dark' ? '#222227' : t.border), background: theme === 'dark' ? '#1C1C1E' : t.inputBg, color: t.textSec, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Cancel</button>
            <button onClick={onSubmit} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: '#6C5CE7', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 12px rgba(108,92,231,0.2)' }}>Save</button>
          </div>
        </div>

      </div>
    </div>
  );
}
