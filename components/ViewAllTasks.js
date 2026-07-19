'use client';
import React from 'react';
import { VISUAL_THEME, PRIORITY_CONFIG } from '../constants/taskConstants';

export default function ViewAllTasks({ tasks, setInspectedTask, handleDeleteTask }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, overflowX: 'auto', boxSizing: 'border-box' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${VISUAL_THEME.border}`, color: VISUAL_THEME.textSec }}>
            <th style={{ padding: '14px 20px' }}>Task Title</th>
            <th style={{ padding: '14px 20px' }}>Category</th>
            <th style={{ padding: '14px 20px' }}>Client Node</th>
            <th style={{ padding: '14px 20px' }}>Milestone Target</th>
            <th style={{ padding: '14px 20px' }}>Priority</th>
            <th style={{ padding: '14px 20px' }}>Status</th>
            <th style={{ padding: '14px 20px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} style={{ borderBottom: `1px solid ${VISUAL_THEME.borderAlt}` }}>
              <td style={{ padding: '14px 20px', fontWeight: 600, color: VISUAL_THEME.text }}>{t.title}</td>
              <td style={{ padding: '14px 20px' }}><span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.accent }}>{t.category}</span></td>
              <td style={{ padding: '14px 20px', color: VISUAL_THEME.textSec }}>{t.subcategory || 'General'}</td>
              <td style={{ padding: '14px 20px' }}>📅 {t.deadline || 'No Date'} {t.time ? `@ ${t.time}` : ''}</td>
              <td style={{ padding: '14px 20px', fontWeight: 700, color: PRIORITY_CONFIG[t.priority]?.color }}><span style={{ padding: '2px 6px', borderRadius: '4px', background: PRIORITY_CONFIG[t.priority]?.bg }}>{t.priority.toUpperCase()}</span></td>
              <td style={{ padding: '14px 20px' }}><span style={{ padding: '4px 8px', borderRadius: '6px', background: t.status === 'done' ? '#ECFDF5' : '#FFFBEB', color: t.status === 'done' ? '#059669' : '#D97706', fontSize: '11px', fontWeight: 600 }}>{t.status}</span></td>
              <td style={{ padding: '14px 20px', color: VISUAL_THEME.textSec }}>
                <span onClick={() => setInspectedTask(t)} style={{ cursor: 'pointer', marginRight: '12px' }}>✏️ Edit</span>
                <span onClick={() => handleDeleteTask(t.id)} style={{ cursor: 'pointer', color: '#EF4444' }}>🗑️ Delete</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
