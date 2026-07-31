'use client';
import React, { useState } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import DraggableTaskList from './DraggableTaskList';
import { exportTasksAsCSV, exportTasksAsJSON } from '../utils/exportUtils';

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
  handleReorderTasks,
  isMobile,
  formatIndianDate,
  userName,
  userFullName,
  viewTitle
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    if (hr < 22) return 'Good evening';
    return 'Hey, Night owl';
  };

  const cleanName = userFullName || (userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'User');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            {getGreeting()}, {cleanName} 👋
          </h1>
          <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>{formatIndianDate()}</p>
        </div>

        {/* Export Tasks Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              padding: '8px 16px',
              background: '#F1F5F9',
              border: `1px solid ${VISUAL_THEME.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: VISUAL_THEME.textSec,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📥 Export Tasks
          </button>
          {showExportMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: '#FFFFFF',
              borderRadius: '10px',
              border: `1px solid ${VISUAL_THEME.border}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              zIndex: 1000,
              overflow: 'hidden',
              minWidth: '160px'
            }}>
              <button
                onClick={() => { exportTasksAsCSV(tasks); setShowExportMenu(false); }}
                style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: 500, color: VISUAL_THEME.text, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.target.style.background = '#F8FAFC'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                📄 Export as CSV
              </button>
              <button
                onClick={() => { exportTasksAsJSON(tasks); setShowExportMenu(false); }}
                style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: 500, color: VISUAL_THEME.text, cursor: 'pointer', textAlign: 'left', borderTop: `1px solid ${VISUAL_THEME.borderAlt}` }}
                onMouseEnter={e => e.target.style.background = '#F8FAFC'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                📋 Export as JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phase 1: Reordered Summary Cards — Today → Pending → Completed → All */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { id: 'today', label: 'Today Tasks', count: countToday, icon: '📅', bg: '#EEF2FF' },
          { id: 'pending', label: 'Pending Tasks', count: countPending, icon: '⏳', bg: '#FFFBEB' },
          { id: 'completed', label: 'Completed Tasks', count: countCompleted, icon: '✅', bg: '#ECFDF5' },
          { id: 'all', label: 'All Tasks', count: countAll, icon: '📋', bg: '#F1F5F9' }
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

      {/* Dynamic Draggable Task List */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: VISUAL_THEME.text, margin: 0 }}>
            {viewTitle ? `${viewTitle} List` : 'Tasks List'}
          </h3>
          <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>⋮⋮ Drag to reorder</span>
        </div>
        
        <DraggableTaskList
          tasks={viewableTasksList}
          onReorder={handleReorderTasks}
          onToggle={handleToggleStatus}
          onSelectDetail={setInspectedTask}
          onDelete={handleDeleteTask}
          isMobile={isMobile}
          emptyMessage={`No tasks found in ${viewTitle || 'this view'}. Click "+ New Task" to add one!`}
        />
      </div>
    </div>
  );
}
