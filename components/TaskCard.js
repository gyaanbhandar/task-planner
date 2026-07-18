// components/TaskCard.js
'use client';
import React from 'react';
import { CATEGORIES, PRIORITY_CONFIG, VISUAL_THEME } from '../constants/taskConstants';

export default function TaskCard({ task, onToggle, onSelectDetail, onDelete }) {
  const matchedCat = CATEGORIES.find(c => c.id === task.category);
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const isDone = task.status === 'done';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: VISUAL_THEME.surface, border: `1px solid ${VISUAL_THEME.border}`, borderRadius: '12px', transition: 'all 0.2s ease', cursor: 'pointer' }} onClick={() => onSelectDetail(task)}>
      
      {/* Left Structural Side Details Meta Frame */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        <div onClick={(e) => { e.stopPropagation(); onToggle(task.id); }} style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${isDone ? VISUAL_THEME.accent : '#CBD5E1'}`, background: isDone ? VISUAL_THEME.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
          {isDone && <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
        </div>

        <div style={{ minWidth: 0 }}>
          <h4 style={{ fontSize: '14px', fontWeight: 500, color: isDone ? VISUAL_THEME.textSec : VISUAL_THEME.text, textDecoration: isDone ? 'line-through' : 'none', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: matchedCat?.bg || '#F1F5F9', color: matchedCat?.color || VISUAL_THEME.textSec, fontWeight: 500 }}>
              {matchedCat ? `${matchedCat.icon} ${matchedCat.name}` : 'Task'}
            </span>
            {task.subcategory && (
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#F8FAFC', color: VISUAL_THEME.textSec, border: `1px solid ${VISUAL_THEME.border}` }}>
                {task.subcategory}
              </span>
            )}
            {task.deadline && (
              <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec, display: 'flex', alignItems: 'center', gap: '4px' }}>
                📅 {task.deadline}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Core Automation Logs Operations Panel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '12px' }} onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec, fontWeight: 500 }}>
          {task.time || '09:00 AM'}
        </span>
        <span style={{ fontSize: '11px', color: priorityInfo.color, background: priorityInfo.bg, padding: '3px 8px', borderRadius: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
          {priorityInfo.label}
        </span>
        <button onClick={() => onDelete(task.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '14px', padding: '4px' }}>🗑️</button>
      </div>

    </div>
  );
}
