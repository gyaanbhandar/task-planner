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
  
  return (
    <div style={{ background: t.surface, borderRadius: 10, padding: isMobile ? '10px 12px' : '12px 16px', marginBottom: 6, borderLeft: '3px solid ' + PRIORITY_COLORS[task.priority], opacity: task.status === 'done' ? 0.5 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button onClick={() => onToggle(task.id)} style={{ background: 'none', border: 'none', fontSize: 17, cursor: 'pointer', padding: 0, marginTop: 1 }}>{task.status === 'done' ? '✅' : '⬜'}</button>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExp(!exp)}>
          <div style={{ fontSize: 14, color: t.text, textDecoration: task.status === 'done' ? 'line-through' : 'none', fontWeight: 500 }}>{task.title}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, background: (cat?.color || '#888') + '22', color: cat?.color || '#888', padding: '1px 6px', borderRadius: 4 }}>{cat?.name}</span>
            {task.subcategory && <span style={{ fontSize: 10, color: t.textSec }}>· {task.subcategory}</span>}
            {task.deadline && <span style={{ fontSize: 10, color: overdue ? '#ff6b6b' : t.textSec }}>{overdue ? '⚠️ ' : '📅 '}{task.deadline}</span>}
            <span style={{ fontSize: 10, color: t.textDim }}>{task.type}</span>
          </div>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '4px 6px', opacity: 0.6 }}>✏️</button>
            <button onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '4px 6px', opacity: 0.6 }}>🗑</button>
          </div>
        )}
      </div>
      {exp && (
        <div style={{ marginTop: 8, paddingLeft: 36 }}>
          {task.description && <p style={{ fontSize: 13, color: t.textSec, margin: '0 0 8px', lineHeight: 1.5 }}>{task.description}</p>}
          {isMobile && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(task)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid ' + t.borderAlt, background: 'transparent', color: t.textSec, fontSize: 12, cursor: 'pointer' }}>✏️ Edit</button>
              <button onClick={() => onDelete(task.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ff6b6b33', background: 'transparent', color: '#ff6b6b', fontSize: 12, cursor: 'pointer' }}>🗑 Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
