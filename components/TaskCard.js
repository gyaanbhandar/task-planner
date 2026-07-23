'use client';
import React from 'react';
import { VISUAL_THEME, PRIORITY_CONFIG } from '../constants/taskConstants';

export default function TaskCard({ task, onToggle, onSelectDetail, onDelete, isMobile }) {
  const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  
  // Clean Time Display Logic (Extracts time property or parses cleanly)
  const displayTime = task.time || (task.description && task.description.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/i)?.[0]) || '';
  
  // Clean Description (Strips out raw 'Time: 12:00 AM' markers from note body)
  const cleanDesc = (task.description || '')
    .replace(/^(?:Time:\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s*|\s*\(Time:\s*\d{1,2}:\d{2}\s*(?:AM|PM)\)\s*)/gi, '')
    .trim();

  return (
    <div 
      style={{ 
        padding: '14px 16px', 
        background: '#FFFFFF', 
        borderRadius: '12px', 
        border: `1px solid ${VISUAL_THEME.border}`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '12px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
        <input 
          type="checkbox" 
          checked={task.status === 'done'} 
          onChange={() => onToggle(task.id, task.status)}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: VISUAL_THEME.accent }}
        />
        <div style={{ cursor: 'pointer', flex: 1, overflow: 'hidden' }} onClick={() => onSelectDetail(task)}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: task.status === 'done' ? '#94A3B8' : VISUAL_THEME.text, textDecoration: task.status === 'done' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {task.title}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            {task.category && (
              <span style={{ fontSize: '11px', background: '#EEF2FF', color: VISUAL_THEME.accent, padding: '2px 8px', borderRadius: '4px', fontWeight: 500, textTransform: 'capitalize' }}>
                {task.category}
              </span>
            )}
            {task.subcategory && task.subcategory !== 'General' && (
              <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                🏢 {task.subcategory}
              </span>
            )}
            {task.deadline && (
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                📅 {task.deadline}
              </span>
            )}
            {cleanDesc && (
              <span style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                • {cleanDesc}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {displayTime && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${VISUAL_THEME.border}` }}>
            🕒 {displayTime}
          </span>
        )}
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: priorityStyle.bg, color: priorityStyle.color, textTransform: 'uppercase' }}>
          {task.priority || 'medium'}
        </span>
        <button onClick={() => onDelete(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}>
          🗑️
        </button>
      </div>
    </div>
  );
}
