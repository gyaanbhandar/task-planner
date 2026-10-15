'use client';
import React, { useState, useRef, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

function RecurringRow({ t, onViewDetail, setInspectedTask, handleDeleteTask }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  // Concise, truthful schedule label built only from real fields.
  const typeLabel = t.type === 'daily' ? 'Daily' : t.type === 'weekly' ? 'Weekly' : t.type === 'monthly' ? 'Monthly' : 'Recurring';
  const schedule = t.time ? `${typeLabel} at ${t.time}` : typeLabel;

  return (
    <div style={{ padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>🔄</span>
        <div style={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => onViewDetail(t)}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: VISUAL_THEME.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</h4>
          <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '3px 0 0 0' }}>{schedule}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '3px 10px', borderRadius: '999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} /> Active
        </span>
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Routine options"
            style={{ background: menuOpen ? '#F1F5F9' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1, color: VISUAL_THEME.textSec, padding: '6px 8px', borderRadius: '8px' }}
            onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.background = '#F1F5F9'; }}
            onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}
          >⋮</button>
          {menuOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#FFFFFF', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden', minWidth: '150px' }}>
              <button
                onClick={() => { setMenuOpen(false); setInspectedTask(t); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: 500, color: VISUAL_THEME.text, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >✏️ Edit</button>
              <button
                onClick={() => { setMenuOpen(false); handleDeleteTask(t.id); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', borderTop: `1px solid ${VISUAL_THEME.borderAlt}`, background: 'transparent', fontSize: '13px', fontWeight: 500, color: '#DC2626', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >🗑️ Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ViewRecurring({ tasks, setInspectedTask, onViewDetail, handleDeleteTask, isMobile, sortBy, setSortBy }) {
  const RECURRING_TYPES = ['daily', 'weekly', 'monthly'];
  let recurringItems = tasks.filter(t => RECURRING_TYPES.includes(t.type));

  if (sortBy && sortBy !== 'manual') {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...recurringItems];
    switch (sortBy) {
      case 'date_asc': recurringItems = sorted.sort((a, b) => (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31')); break;
      case 'date_desc': recurringItems = sorted.sort((a, b) => (b.deadline || '0000-01-01').localeCompare(a.deadline || '0000-01-01')); break;
      case 'priority': recurringItems = sorted.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1)); break;
      case 'time': recurringItems = sorted.sort((a, b) => {
        const toMin = (x) => { if (!x) return 999; const m = x.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return 999; let h = parseInt(m[1]); if (m[3].toUpperCase() === 'PM' && h < 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return h * 60 + parseInt(m[2]); };
        return toMin(a.time) - toMin(b.time);
      }); break;
      case 'created_newest': recurringItems = sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')); break;
      case 'created_oldest': recurringItems = sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')); break;
      case 'category': recurringItems = sorted.sort((a, b) => (a.category || '').localeCompare(b.category || '')); break;
    }
  }

  const activeCount = recurringItems.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0' }}>
        <div>
          <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>Manage routines that repeat automatically.</p>
          <p style={{ fontSize: '13px', color: VISUAL_THEME.text, fontWeight: 600, margin: '6px 0 0 0' }}>{activeCount} active routine{activeCount !== 1 ? 's' : ''}</p>
        </div>
        {setSortBy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, whiteSpace: 'nowrap' }}>Sort:</span>
            <select
              value={sortBy || 'manual'}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '7px 28px 7px 10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`,
                fontSize: '12px', fontWeight: 500, color: VISUAL_THEME.text,
                background: sortBy && sortBy !== 'manual' ? '#EEF2FF' : '#FFFFFF', cursor: 'pointer', appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2.5\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', minWidth: '130px', boxSizing: 'border-box'
              }}
            >
              <option value="manual">Default</option>
              <option value="date_asc">Date (Nearest)</option>
              <option value="date_desc">Date (Farthest)</option>
              <option value="priority">Priority (High→Low)</option>
              <option value="time">Time (Earliest)</option>
              <option value="created_newest">Newest first</option>
              <option value="created_oldest">Oldest first</option>
              <option value="category">Category (A–Z)</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '16px', boxSizing: 'border-box' }}>
        {recurringItems.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>🔄</div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 6px 0' }}>No recurring tasks yet</p>
            <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>Create a task with a daily, weekly or monthly schedule to see it here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recurringItems.map(t => (
              <RecurringRow key={t.id + '_rec'} t={t} onViewDetail={onViewDetail} setInspectedTask={setInspectedTask} handleDeleteTask={handleDeleteTask} />
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        🔄 Recurring tasks repeat automatically on their schedule.
      </p>
    </div>
  );
}
