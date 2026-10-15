'use client';
import React, { useState, useRef, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import DraggableTaskList from './DraggableTaskList';
import { exportTasksAsCSV, exportTasksAsJSON } from '../utils/exportUtils';
import ImportTasks from './ImportTasks';
import { canExportFormat } from '../services/entitlements';

export default function ViewToday({
  tasks,
  countAll,
  countCompleted,
  countPending,
  dashboardFilter,
  setDashboardFilter,
  viewableTasksList,
  handleToggleStatus,
  setInspectedTask,
  onEdit,
  handleDeleteTask,
  handleReorderTasks,
  isMobile,
  formatIndianDate,
  userName,
  userFullName,
  viewTitle,
  userProfile,
  onImportTasks,
  onClearCompleted,
  sortBy,
  setSortBy,
  currentView,
  activeCategory,
  customCategories,
  onNewTask
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const moreRef = useRef(null);

  const isAllTasks = currentView === 'all_tasks';
  const isUpcoming = currentView === 'upcoming';

  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) { setShowMoreMenu(false); setShowExportMenu(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreMenu]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    if (hr < 22) return 'Good evening';
    return 'Hey, Night owl';
  };

  const cleanName = userFullName || (userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'User');
  const canExportJSON = canExportFormat(userProfile, 'json');

  // Heading per view
  const heading = viewTitle || 'Tasks';

  // Apply the All-Tasks category dropdown filter on top of the list the dashboard provides.
  const displayedTasks = (isAllTasks && categoryFilter !== 'all')
    ? viewableTasksList.filter(t => t.category === categoryFilter)
    : viewableTasksList;

  // Count line
  const doneInList = displayedTasks.filter(t => t.status === 'done').length;

  const sortSelect = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, whiteSpace: 'nowrap' }}>Sort:</span>
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
        style={{
          padding: '7px 28px 7px 10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`,
          fontSize: '12px', fontWeight: 500, color: VISUAL_THEME.text,
          background: sortBy !== 'manual' ? '#EEF2FF' : '#FFFFFF', cursor: 'pointer', appearance: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2.5\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', minWidth: '130px', boxSizing: 'border-box'
        }}
      >
        <option value="manual">Manual order</option>
        <option value="date_asc">Date (Nearest)</option>
        <option value="date_desc">Date (Farthest)</option>
        <option value="priority">Priority (High→Low)</option>
        <option value="time">Time (Earliest)</option>
        <option value="created_newest">Newest first</option>
        <option value="created_oldest">Oldest first</option>
        <option value="category">Category (A–Z)</option>
      </select>
    </div>
  );

  // Compact "More" menu holding Import / Export / Clear Completed so they don't compete with New Task.
  const moreMenu = (
    <div ref={moreRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMoreMenu(o => !o)}
        aria-label="More actions"
        style={{ padding: '7px 12px', background: '#FFFFFF', border: `1px solid ${VISUAL_THEME.border}`, borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: VISUAL_THEME.textSec, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        ⋯ More
      </button>
      {showMoreMenu && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#FFFFFF', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 1000, overflow: 'hidden', minWidth: '180px' }}>
          <button
            onClick={() => { setShowImportModal(true); setShowMoreMenu(false); }}
            style={moreItemStyle}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >📤 Import tasks</button>
          <button
            onClick={() => { exportTasksAsCSV(tasks); setShowMoreMenu(false); }}
            style={moreItemStyle}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >📄 Export as CSV</button>
          {canExportJSON ? (
            <button
              onClick={() => { exportTasksAsJSON(tasks); setShowMoreMenu(false); }}
              style={moreItemStyle}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >📋 Export as JSON</button>
          ) : (
            <div style={{ padding: '10px 14px', fontSize: '12px', color: '#94A3B8' }}>🔒 JSON export — Pro plan</div>
          )}
          {countCompleted > 0 && onClearCompleted && (
            <button
              onClick={() => { onClearCompleted(); setShowMoreMenu(false); }}
              title="Moves completed tasks to Trash (restorable for 15 days)."
              style={{ ...moreItemStyle, color: '#DC2626', borderTop: `1px solid ${VISUAL_THEME.borderAlt}` }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >🧹 Clear completed</button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>

      {/* Greeting + heading + compact toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>
            {getGreeting()}, {cleanName} 👋
          </h1>
          <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 700, color: VISUAL_THEME.text, margin: '8px 0 2px 0' }}>{heading}</h2>
          <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
            {formatIndianDate()} • {displayedTasks.length} task{displayedTasks.length !== 1 ? 's' : ''} • {doneInList} completed
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {sortSelect}
          {moreMenu}
        </div>
      </div>

      {/* All Tasks: quick-filter tabs + category dropdown */}
      {isAllTasks && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' }
            ].map(tab => {
              const active = dashboardFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDashboardFilter(tab.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600,
                    background: active ? VISUAL_THEME.accent : '#F1F5F9',
                    color: active ? '#FFFFFF' : VISUAL_THEME.textSec,
                    transition: 'all 0.15s'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {(customCategories || []).length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '7px 28px 7px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`,
                fontSize: '12px', fontWeight: 500, color: VISUAL_THEME.text,
                background: categoryFilter !== 'all' ? '#EEF2FF' : '#FFFFFF', cursor: 'pointer', appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2.5\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', boxSizing: 'border-box'
              }}
            >
              <option value="all">All categories</option>
              {(customCategories || []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Task list card */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '16px', boxSizing: 'border-box' }}>
        {displayedTasks.length === 0 ? (
          <EmptyState isUpcoming={isUpcoming} heading={heading} onNewTask={onNewTask} />
        ) : (
          <DraggableTaskList
            tasks={displayedTasks}
            onReorder={handleReorderTasks}
            onToggle={handleToggleStatus}
            onSelectDetail={setInspectedTask}
            onEdit={onEdit}
            onDelete={handleDeleteTask}
            isMobile={isMobile}
            dragEnabled={sortBy === 'manual' && !isAllTasks}
            showCategory={isAllTasks}
          />
        )}
      </div>

      {/* All Tasks footer summary */}
      {isAllTasks && displayedTasks.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: VISUAL_THEME.textSec, padding: '0 4px' }}>
          <span>{countAll} task{countAll !== 1 ? 's' : ''} in total • {countCompleted} completed</span>
          {countCompleted > 0 && onClearCompleted && (
            <button onClick={onClearCompleted} style={{ background: 'transparent', border: 'none', color: VISUAL_THEME.accent, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Clear completed</button>
          )}
        </div>
      )}

      {showImportModal && (
        <ImportTasks
          onImport={async (parsedTasks) => await onImportTasks(parsedTasks)}
          onClose={() => setShowImportModal(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

const moreItemStyle = { display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: 500, color: '#0F172A', cursor: 'pointer', textAlign: 'left' };

function EmptyState({ isUpcoming, heading, onNewTask }) {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>{isUpcoming ? '🗓️' : '📝'}</div>
      <p style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 6px 0' }}>
        {isUpcoming ? 'No upcoming tasks yet' : `No tasks in ${heading} yet`}
      </p>
      <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: '0 0 18px 0', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
        {isUpcoming
          ? 'Tasks with future dates will appear here. Create a task and set a date to see it in this list.'
          : 'Create a task to get started.'}
      </p>
      {onNewTask && (
        <button onClick={onNewTask} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
      )}
    </div>
  );
}
