'use client';
import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import TaskCard from './TaskCard';

export default function ViewToday({
  tasks,
  countAll,
  countToday,
  countPending,
  countCompleted,
  dashboardFilter,
  setDashboardFilter,
  viewableTasksList,
  handleToggleStatus,
  setInspectedTask,
  handleDeleteTask,
  isMobile,
  formatIndianDate,
  userName,
  viewTitle
}) {
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    if (hr < 22) return 'Good evening';
    return 'Hey, Night owl';
  };

  const cleanName = userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'Anukant';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
      <div>
        <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
          {getGreeting()}, {cleanName} 👋
        </h1>
        <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>{formatIndianDate()}</p>
      </div>

      {/* Dynamic Counter Cards for Current View Context */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { id: 'all', label: 'All Tasks', count: countAll, icon: '📋', bg: '#F1F5F9' },
          { id: 'today', label: 'Today Tasks', count: countToday, icon: '📅', bg: '#EEF2FF' },
          { id: 'pending', label: 'Pending Tasks', count: countPending, icon: '⏳', bg: '#FFFBEB' },
          { id: 'completed', label: 'Completed Tasks', count: countCompleted, icon: '✅', bg: '#ECFDF5' }
        ].map(stat => (
          <div
            key={stat.id}
            onClick={() => setDashboardFilter(stat.id)}
            style={{
              padding: '16px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: dashboardFilter === stat.id ? `2px solid ${VISUAL_THEME.accent}` : `1px solid ${VISUAL_THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, display: 'block', marginBottom: '4px' }}>{stat.label}</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: VISUAL_THEME.text }}>{stat.count}</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Dynamic List Section */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: VISUAL_THEME.text, margin: '0 0 16px 0' }}>
          {viewTitle ? `${viewTitle} List` : 'Tasks List'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {viewableTasksList.length > 0 ? (
            viewableTasksList.map(t => (
              <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} isMobile={isMobile} />
            ))
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: VISUAL_THEME.textSec, fontSize: '13px' }}>
              No tasks found in <strong>{viewTitle || 'this view'}</strong>. Click <strong>"+ New Task"</strong> to add one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
