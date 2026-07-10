'use client';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, PRIORITY_COLORS } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

export default function TaskCard({ task, onToggle, onEdit, onDelete, isMobile }) {
  const { t } = useTheme();
  const [exp, setExp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cat = CATEGORIES.find(c => c.id === task.category);
  const overdue = task.deadline && task.deadline < todayStr() && task.status !== 'done';
  const isDone = task.status === 'done';

  const leftBorderColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        background: '#16161A', 
        borderRadius: 12, 
        padding: isMobile ? '12px' : '14px 16px', 
        border: '1px solid #27272A', 
        borderLeft: `4px solid ${leftBorderColors[task.priority] || '#27272A'}`, 
        opacity: isDone ? 0.4 : 1,
        transition: '0.2s ease',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.4)' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        
        {/* Custom Custom Checkbox */}
        <button 
          onClick={() => onToggle(task.id)} 
          style={{ 
            background: isDone ? '#6C5CE7' : '#09090B', 
            border: isDone ? '1px solid #6C5CE7' : '1px solid #3F3F46', 
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

        {/* Central Core */}
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExp(!exp)}>
          <div style={{ fontSize: 13, color: '#F4F4F5', fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none', letterSpacing: '-0.1px' }}>
            {task.title}
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', background: '#09090B', color: '#A1A1AA', padding: '2px 8px', borderRadius: 6, border: '1px solid #27272A' }}>
              {cat?.icon} {cat?.name}
            </span>
            {task.subcategory && <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#71717A' }}>&bull; {task.subcategory}</span>}
            {task.deadline && (
              <span style={{ fontSize: 10, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 6, background: overdue ? 'rgba(239,68,68,0.1)' : '#09090B', border: overdue ? '1px solid rgba(239,68,68,0.3)' : '1px solid #27272A', color: overdue ? '#EF4444' : '#71717A' }}>
                📅 {task.deadline}
              </span>
            )}
            <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#52525B', textTransform: 'uppercase' }}>{task.type}</span>
          </div>
        </div>

        {/* Desktop Controls */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0, opacity: hovered ? 1 : 0.3, transition: '0.2s' }}>
            <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: '4px' }}>✏️</button>
            <button onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: '4px' }}>🗑️</button>
          </div>
        )}
      </div>

      {/* Expanded Description Area */}
      {exp && (
        <div style={{ marginTop: 12, paddingLeft: 28, paddingTop: 10, borderTop: '1px solid #1F1F23' }}>
          {task.description ? (
            <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{task.description}</p>
          ) : (
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#42424A', margin: 0, italic: 'true' }}>No structural descriptions assigned.</p>
          )}
          {isMobile && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => onEdit(task)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid #27272A', background: 'transparent', color: '#A1A1AA', fontSize: 11, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => onDelete(task.id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
