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
    <div 
      style={{ 
        background: t.surface, 
        borderRadius: 12, 
        padding: isMobile ? '12px' : '14px 16px', 
        border: '1px solid ' + t.border, 
        borderLeft: `4px solid ${PRIORITY_COLORS[task.priority] || t.border}`, 
        opacity: isDone ? 0.45 : 1,
        transition: 'background 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        
        <button 
          onClick={() => onToggle(task.id)} 
          style={{ 
            background: isDone ? '#6C5CE7' : t.inputBg, 
            border: isDone ? '1px solid #6C5CE7' : '1px solid ' + t.borderAlt, 
            borderRadius: 6, 
            width: 16, 
            height: 16, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 0,
            marginTop: 2
          }}
        >
          {isDone && <span style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>✓</span>}
        </button>

        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExp(!exp)}>
          <div style={{ fontSize: 13, color: t.text, fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none', letterSpacing: '-0.1px' }}>
            {task.title}
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', background: t.inputBg, color: cat?.color, padding: '2px 8px', borderRadius: 6, border: '1px solid ' + t.border }}>
              {cat?.icon} {cat?.name}
            </span>
            {task.subcategory && <span style={{ fontSize: 10, fontFamily: 'monospace', color: t.textSec }}>&bull; {task.subcategory}</span>}
            {task.deadline && (
              <span style={{ fontSize: 10, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 6, background: overdue ? 'rgba(239,68,68,0.08)' : t.inputBg, border: overdue ? '1px solid rgba(239,68,68,0.2)' : '1px solid ' + t.border, color: overdue ? '#EF4444' : t.textSec }}>
                📅 {task.deadline}
              </span>
            )}
            <span style={{ fontSize: 9, fontFamily: 'monospace', color: t.textDim, textTransform: 'uppercase' }}>{task.type}</span>
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: 0.6 }}>
            <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>✏️</button>
            <button onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>🗑️</button>
          </div>
        )}
      </div>

      {exp && (
        <div style={{ marginTop: 12, paddingLeft: 28, paddingTop: 10, borderTop: '1px solid ' + t.border }}>
          {task.description ? (
            <p style={{ fontSize: 12, color: t.textSec, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{task.description}</p>
          ) : (
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: t.textDim, margin: 0, fontStyle: 'italic' }}>No contextual parameters attached.</p>
          )}
          {isMobile && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => onEdit(task)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid ' + t.border, background: 'transparent', color: t.textSec, fontSize: 11, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => onDelete(task.id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
