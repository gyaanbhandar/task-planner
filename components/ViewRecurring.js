'use client';
import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function ViewRecurring({ tasks, setInspectedTask, onViewDetail, handleDeleteTask, isMobile, sortBy, setSortBy }) {
  let recurringItems = tasks.filter(t => t.type !== 'one-time' || t.time);

  // Apply sorting
  if (sortBy && sortBy !== 'manual') {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...recurringItems];
    switch (sortBy) {
      case 'date_asc':
        recurringItems = sorted.sort((a, b) => (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31'));
        break;
      case 'date_desc':
        recurringItems = sorted.sort((a, b) => (b.deadline || '0000-01-01').localeCompare(a.deadline || '0000-01-01'));
        break;
      case 'priority':
        recurringItems = sorted.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
        break;
      case 'time':
        recurringItems = sorted.sort((a, b) => {
          const toMin = (t) => { if (!t) return 999; const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return 999; let h = parseInt(m[1]); if (m[3].toUpperCase() === 'PM' && h < 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return h * 60 + parseInt(m[2]); };
          return toMin(a.time) - toMin(b.time);
        });
        break;
      case 'created_newest':
        recurringItems = sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        break;
      case 'created_oldest':
        recurringItems = sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
        break;
      case 'category':
        recurringItems = sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        break;
    }
  }

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '16px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Recurring Routines Operations</h3>
        {setSortBy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, whiteSpace: 'nowrap' }}>Sort:</span>
            <select
              value={sortBy || 'manual'}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '6px 28px 6px 10px',
                borderRadius: '8px',
                border: `1px solid ${VISUAL_THEME.border}`,
                fontSize: '12px',
                fontWeight: 500,
                color: VISUAL_THEME.text,
                background: sortBy && sortBy !== 'manual' ? '#EEF2FF' : '#F8FAFC',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2.5\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                flex: isMobile ? 1 : 'none',
                minWidth: isMobile ? '0' : '140px',
                boxSizing: 'border-box'
              }}
            >
              <option value="manual">🔀 Default</option>
              <option value="date_asc">📅 Date ↑ (Nearest)</option>
              <option value="date_desc">📅 Date ↓ (Farthest)</option>
              <option value="priority">🔺 Priority (High→Low)</option>
              <option value="time">🕒 Time (Earliest)</option>
              <option value="created_newest">🆕 Newest First</option>
              <option value="created_oldest">📦 Oldest First</option>
              <option value="category">📂 Category (A-Z)</option>
            </select>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recurringItems.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: VISUAL_THEME.textSec, fontSize: '13px' }}>
            No recurring tasks found.
          </div>
        )}
        {recurringItems.map(t => (
          <div key={t.id + '_rec'} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}`, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', boxSizing: 'border-box', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '18px' }}>🔄</span>
              <div style={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => onViewDetail(t)}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: VISUAL_THEME.text, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</h4>
                <p style={{ fontSize: '11px', color: VISUAL_THEME.textSec, margin: '4px 0 0 0' }}>Routine Type: Custom cycle mapped target to execution window at {t.time || '09:00 AM'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Active Loop</span>
              <span onClick={() => setInspectedTask(t)} style={{ cursor: 'pointer', fontSize: '13px' }}>✏️</span>
              <span onClick={() => handleDeleteTask(t.id)} style={{ cursor: 'pointer', fontSize: '13px', color: '#EF4444' }}>🗑️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
