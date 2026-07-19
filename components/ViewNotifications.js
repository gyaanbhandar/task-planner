'use client';
import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function ViewNotifications({ notifications }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Alerts Performance Logging Console</h3>
      {notifications.map(n => (
        <div key={n.id} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, borderLeft: `4px solid ${n.type === 'danger' ? '#EF4444' : VISUAL_THEME.accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '10px', color: n.type === 'danger' ? '#EF4444' : VISUAL_THEME.accent, fontWeight: 700, display: 'block', marginBottom: '4px' }}>{n.tag}</span>
            <p style={{ fontSize: '13px', margin: 0, fontWeight: 500 }}>{n.msg}</p>
          </div>
          <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>{n.time}</span>
        </div>
      ))}
    </div>
  );
}
