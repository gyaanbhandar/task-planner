'use client';
import React from 'react';
import { VISUAL_THEME, PRIORITY_CONFIG } from '../constants/taskConstants';

export default function ViewAllTasks({ tasks }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${VISUAL_THEME.border}`, color: VISUAL_THEME.textSec }}>
            <th style={{ padding: '14px 20px' }}>Task Target</th>
            <th style={{ padding: '14px 20px' }}>Category Node</th>
            <th style={{ padding: '14px 20px' }}>Workspace Context</th>
            <th style={{ padding: '14px 20px' }}>Milestone Schedule</th>
            <th style={{ padding: '14px 20px' }}>Priority Level</th>
            <th style={{ padding: '14px 20px' }}>Status Log</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} style={{ borderBottom: `1px solid ${VISUAL_THEME.borderAlt}` }}>
              <td style={{ padding: '14px 20px', fontWeight: 600 }}>{t.title}</td>
              <td style={{ padding: '14px 20px' }}><span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.accent }}>{t.category}</span></td>
              <td style={{ padding: '14px 20px', color: VISUAL_THEME.textSec }}>{t.subcategory || 'General'}</td>
              <td style={{ padding: '14px 20px' }}>📅 {t.deadline || 'No date'} {t.time ? `@ ${t.time}` : ''}</td>
              <td style={{ padding: '14px 20px', fontWeight: 700, color: PRIORITY_CONFIG[t.priority]?.color }}>{t.priority.toUpperCase()}</td>
              <td style={{ padding: '14px 20px' }}><span style={{ padding: '4px 8px', borderRadius: '6px', background: t.status === 'done' ? '#ECFDF5' : '#FFFBEB', color: t.status === 'done' ? '#059669' : '#D97706', fontSize: '11px', fontWeight: 600 }}>{t.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
