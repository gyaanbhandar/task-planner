'use client';
import React, { useState, useRef, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

export default function TaskCard({ task, onToggle, onSelectDetail, onEdit, onDelete, isMobile, showCategory = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close overflow menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const isDone = task.status === 'done';
  // Subtle overdue indicator only: a pending task whose deadline is before today.
  const isOverdue = !isDone && task.deadline && task.deadline < todayStr();

  return (
    <div
      style={{
        padding: isMobile ? '12px' : '13px 16px',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: `1px solid ${VISUAL_THEME.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxSizing: 'border-box',
        marginBottom: '4px',
        overflow: 'visible',
        maxWidth: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <input
          type="checkbox"
          checked={isDone}
          onChange={(e) => { e.stopPropagation(); onToggle(task.id, task.status); }}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: VISUAL_THEME.accent, flexShrink: 0 }}
        />

        {/* Subtle overdue dot — the only permitted metadata indicator */}
        {isOverdue && (
          <span
            title="Overdue"
            style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }}
          />
        )}

        <div
          style={{ cursor: 'pointer', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px' }}
          onClick={() => onSelectDetail(task)}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isDone ? '#94A3B8' : VISUAL_THEME.text,
              textDecoration: isDone ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0
            }}
          >
            {task.title}
          </span>

          {/* Category chip — only shown on cross-category views (All Tasks) */}
          {showCategory && task.category && (
            <span style={{ fontSize: '11px', background: '#EEF2FF', color: VISUAL_THEME.accent, padding: '2px 8px', borderRadius: '6px', fontWeight: 500, textTransform: 'capitalize', flexShrink: 0 }}>
              {task.category}
            </span>
          )}
        </div>
      </div>

      {/* Three-dot overflow menu */}
      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          aria-label="Task options"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          style={{
            background: menuOpen ? '#F1F5F9' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            color: VISUAL_THEME.textSec,
            padding: '6px 8px',
            borderRadius: '8px',
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.background = '#F1F5F9'; }}
          onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}
        >
          ⋮
        </button>

        {menuOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: '#FFFFFF',
              borderRadius: '10px',
              border: `1px solid ${VISUAL_THEME.border}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 1000,
              overflow: 'hidden',
              minWidth: '150px'
            }}
          >
            <button
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(task); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: 500, color: VISUAL_THEME.text, cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              ✏️ Edit
            </button>
            <button
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(task.id); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', borderTop: `1px solid ${VISUAL_THEME.borderAlt}`, background: 'transparent', fontSize: '13px', fontWeight: 500, color: '#DC2626', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
