'use client';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, PRIORITY_COLORS } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

export default function TaskCard({ task, onToggle, onEdit, onDelete, isMobile }) {
  const { t } = useTheme();
  const [exp, setExp] = useState(false);
  const cat = CATEGORIES.find(c => c.id === task.category);
  const overdue = task.deadline && task.deadline < todayStr() && task.status !== 'done';
  const isDone = task.status === 'done';

  return (
    <div style={{ background: t.surface, borderRadius: 8, padding: '10px 12px', border: '1px solid ' + t.border, borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || t.border}`, opacity: isDone ? 0.45 : 1, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        
        <button 
          onClick={() => onToggle(task.id)} 
          style={{ 
            background: isDone ? '#6C5CE7' : t.inputBg, 
            border: isDone ? '1px solid #6C5CE7' : '1px solid ' + t.borderAlt, 
            borderRadius: 4, width: 14, height: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0
          }}
        >
          {isDone && <span style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>✓</span>}
        </button>

        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExp(!exp)}>
          <div style={{ fontSize: 13, color: t.text, fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.title}
          </div>
          
          <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap', fontSize: 10, fontFamily: 'monospace', color: t.textSec }}>
            <span>{cat?.icon} {cat?.name}</span>
            {task.subcategory && <span>&bull; {task.subcategory}</span>}
            {task.deadline && (
              <span style={{ color: overdue ? '#EF4444' : t.textSec }}>
                📅 {task.deadline}
              </span>
            )}
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: 0.6 }}>
            <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 2 }}>✏️</button>
            <button onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 2 }}>🗑️</button>
          </div>
        )}
      </div>

      {exp && (
        <div style={{ marginTop: 8, paddingLeft: 24, paddingTop: 6, borderTop: '1px solid ' + t.border }}>
          <p style={{ fontSize: 12, color: t.textSec, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            {task.description || 'No descriptive context parameters.'}
          </p>
          {isMobile && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={() => onEdit(task)} style={{ flex: 1, padding: '4px 0', borderRadius: 4, border: '1px solid ' + t.border, background: 'transparent', color: t.textSec, fontSize: 11, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => onDelete(task.id)} style={{ flex: 1, padding: '4px 0', borderRadius: 4, border: '1px solid ' + t.border, background: 'transparent', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
