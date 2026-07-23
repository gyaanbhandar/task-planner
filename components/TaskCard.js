'use client';
import React from 'react';
import { VISUAL_THEME, PRIORITY_CONFIG } from '../constants/taskConstants';

export default function TaskCard({ task, onToggle, onSelectDetail, onDelete, isMobile }) {
  const priorityStyle = PRIORITY_CONFIG[task?.priority?.toLowerCase()] || 
                        PRIORITY_CONFIG[task?.priority] || 
                        PRIORITY_CONFIG.medium || 
                        { bg: '#FEF3C7', color: '#D97706' };
  
  // Format or extract clean 12-hour AM/PM time
  const getFormattedTime = () => {
    if (task.time) return task.time;
    if (task.description) {
      const match = task.description.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/i);
      if (match) return match[0];
    }
    return '09:00 AM'; // Default AM fallback
  };

  const displayTime = getFormattedTime();
  
  // Clean Description text
  const cleanDesc = (task.description || '')
    .replace(/^(?:Time:\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s*|\s*\(Time:\s*\d{1,2}:\d{2}\s*(?:AM|PM)\)\s*)/gi, '')
    .trim();

  return (
    <div 
      style={{ 
        padding: isMobile ? '12px' : '14px 16px', 
        background: '#FFFFFF', 
        borderRadius: '12px', 
        border: `1px solid ${VISUAL_THEME.border}`, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center', 
        justifyContent: 'space-between', 
        gap: isMobile ? '10px' : '12px',
        boxSizing: 'border-box',
        marginBottom: '10px'
      }}
    >
      {/* Top / Main Section (Checkbox, Title, Badges) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
        <input 
          type="checkbox" 
          checked={task.status === 'done'} 
          onChange={() => onToggle(task.id, task.status)}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: VISUAL_THEME.accent, marginTop: '2px', flexShrink: 0 }}
        />
        
        <div style={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => onSelectDetail(task)}>
          {/* Title */}
          <div 
            style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: task.status === 'done' ? '#94A3B8' : VISUAL_THEME.text, 
              textDecoration: task.status === 'done' ? 'line-through' : 'none', 
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              wordBreak: 'break-word',
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}
          >
            {task.title}
          </div>
          
          {/* Badges Container */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
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
              <span style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', maxWidth: isMobile ? '100%' : '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                • {cleanDesc}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Delete Button */}
        {isMobile && (
          <button 
            onClick={() => onDelete(task.id)} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.6, padding: '0 4px', flexShrink: 0 }}
          >
            🗑️
          </button>
        )}
      </div>

      {/* Right / Bottom Section (Time, Priority, Desktop Delete) */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isMobile ? 'space-between' : 'flex-end', 
          gap: '10px', 
          flexShrink: 0,
          paddingTop: isMobile ? '8px' : '0',
          borderTop: isMobile ? '1px solid #F1F5F9' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {displayTime && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: VISUAL_THEME.accent, background: '#EEF2FF', padding: '4px 10px', borderRadius: '6px', border: `1px solid rgba(99,102,241,0.2)` }}>
              🕒 {displayTime}
            </span>
          )}
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: priorityStyle.bg, color: priorityStyle.color, textTransform: 'uppercase' }}>
            {task.priority || 'medium'}
          </span>
        </div>

        {/* Desktop Delete Button */}
        {!isMobile && (
          <button 
            onClick={() => onDelete(task.id)} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
