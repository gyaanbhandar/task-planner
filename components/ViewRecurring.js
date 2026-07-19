'use client';
import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function ViewRecurring({ tasks, setInspectedTask, handleDeleteTask }) {
  const recurringItems = tasks.filter(t => t.type !== 'one-time' || t.time);

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', boxSizing: 'border-box' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>Recurring Routines Operations</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recurringItems.map(t => (
          <div key={t.id + '_rec'} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>🔄</span>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: VISUAL_THEME.text }}>{t.title}</h4>
                <p style={{ fontSize: '11px', color: VISUAL_THEME.textSec, margin: '4px 0 0 0' }}>Routine Type: Custom cycle mapped target to execution window at {t.time || '09:00 AM'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Active Loop</span>
              <span onClick={() => setInspectedTask(t)} style={{ cursor: 'pointer', fontSize: '13px' }}>✏️</span>
              <span onClick={() => handleDeleteTask(t.id)} style={{ cursor: 'pointer', fontSize: '13px', color: '#EF4444' }}>🗑️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
