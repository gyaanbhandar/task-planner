'use client';
import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function ViewNotifications({ setInspectedTask }) {
  const alertsLog = [
    { id: 'notif_1', tag: 'OVERDUE ALERT', msg: 'Operational pipeline check expired parameters target yesterday.', type: 'danger', time: 'Yesterday', associatedTaskId: 't1' },
    { id: 'notif_2', tag: 'AI OPTIMIZATION', msg: 'System tasks processed cleanly inside active layout intervals.', type: 'intelligence', time: '1 hr ago', associatedTaskId: 't2' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>Alerts Timeline System Monitor</h3>
      {alertsLog.map(n => (
        <div key={n.id} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, borderLeft: `4px solid ${n.type === 'danger' ? '#EF4444' : VISUAL_THEME.accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
          <div>
            <span style={{ fontSize: '10px', color: n.type === 'danger' ? '#EF4444' : VISUAL_THEME.accent, fontWeight: 700, display: 'block', marginBottom: '4px' }}>{n.tag}</span>
            <p style={{ fontSize: '13px', margin: 0, fontWeight: 500, color: VISUAL_THEME.text }}>{n.msg}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>{n.time}</span>
            <span onClick={() => setInspectedTask({ id: n.associatedTaskId, title: n.msg, category: 'work', subcategory: 'Alert Log', priority: 'high', deadline: '' })} style={{ cursor: 'pointer', fontSize: '13px' }}>✏️ Edit Context</span>
          </div>
        </div>
      ))}
    </div>
  );
}
