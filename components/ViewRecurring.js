'use client';
import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function ViewRecurring({ tasks }) {
  const recurringItems = tasks.filter(t => t.type !== 'one-time' || t.time);

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Routine Intervals Automation Grid</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recurringItems.map(t => (
          <div key={t.id + '_rec'} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>🔄</span>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>{t.title}</h4>
                <p style={{ fontSize: '11px', color: VISUAL_THEME.textSec, margin: '2px 0 0 0' }}>Automation Loop Event: Run loop interval daily at {t.time || '09:00 AM'}</p>
              </div>
            </div>
            <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Active Loop</span>
          </div>
        ))}
      </div>
    </div>
  );
}
