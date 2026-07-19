'use client';
import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

export default function ViewCalendar({ tasks }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>July 2026 Scheduling Matrix</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: VISUAL_THEME.border }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ background: '#F8FAFC', padding: '10px', fontSize: '11px', fontWeight: 600, textAlign: 'center', color: VISUAL_THEME.textSec }}>{d}</div>
        ))}
        {Array.from({ length: 31 }).map((_, i) => {
          const paddedDay = String(i + 1).padStart(2, '0');
          const dayStrVal = `2026-07-${paddedDay}`;
          const dayTasks = tasks.filter(t => t.deadline === dayStrVal);
          return (
            <div key={i} style={{ background: '#FFFFFF', minHeight: '85px', padding: '8px', border: `1px solid ${VISUAL_THEME.borderAlt}` }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: dayStrVal === todayStr() ? VISUAL_THEME.accent : VISUAL_THEME.text }}>{i + 1}</span>
              {dayTasks.map(dt => (
                <div key={dt.id} style={{ fontSize: '9px', background: 'rgba(99,102,241,0.06)', color: VISUAL_THEME.accent, padding: '2px 4px', borderRadius: '4px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ⏰ {dt.time || '09:00 AM'} - {dt.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
