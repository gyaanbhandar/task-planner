'use client';
import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import TaskCard from './TaskCard';

export default function ViewToday({ tasks, countToday, countPending, countCompleted, dashboardFilter, setDashboardFilter, viewableTasksList, handleToggleStatus, setInspectedTask, handleDeleteTask, isMobile, formatIndianDate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '4px' }}>Good morning, Anukant 👋</h1>
        <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec }}>{formatIndianDate()}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { id: 'all', label: 'All Active Nodes', count: tasks.length, icon: '📋', bg: '#F1F5F9' },
          { id: 'today', label: 'Today Window', count: countToday, icon: '📅', bg: '#EEF2FF' },
          { id: 'pending', label: 'Incomplete Stack', count: countPending, icon: '⏳', bg: '#FFFBEB' },
          { id: 'completed', label: 'Verified Complete', count: countCompleted, icon: '✅', bg: '#ECFDF5' }
        ].map(stat => (
          <div key={stat.id} onClick={() => setDashboardFilter(stat.id)} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: dashboardFilter === stat.id ? `2px solid ${VISUAL_THEME.accent}` : `1px solid ${VISUAL_THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, display: 'block', marginBottom: '4px' }}>{stat.label}</span>
              <span style={{ fontSize: '20px', fontWeight: 700 }}>{stat.count}</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '16px' }}>Active Workspace Registry</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {viewableTasksList.length > 0 ? (
            viewableTasksList.map(t => (
              <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
            ))
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: VISUAL_THEME.textSec, fontSize: '13px' }}>No metrics map inside current viewport.</div>
          )}
        </div>
      </div>
    </div>
  );
}
