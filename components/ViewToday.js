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
  // Pending vs Completed sub-tab. Defaults to pending so completed tasks don't clutter the list.
  const [statusTab, setStatusTab] = useState('pending');
  // Pagination: how many tasks per page, and which page we're on.
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
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
  const categoryFiltered = (isAllTasks && categoryFilter !== 'all')
    ? viewableTasksList.filter(t => t.category === categoryFilter)
    : viewableTasksList;

  // Split into pending vs completed for the status tab.
  const pendingTasks = categoryFiltered.filter(t => t.status !== 'done');
  const completedTasks = categoryFiltered.filter(t => t.status === 'done');

  // The list shown is driven by the active status tab.
  const statusFilteredTasks = statusTab === 'completed' ? completedTasks : pendingTasks;

  // Reset to page 1 whenever the effective filter/view/tab/pageSize changes,
  // so the user never lands on an out-of-range page.
  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, categoryFilter, dashboardFilter, currentView, activeCategory, pageSize, statusFilteredTasks.length]);

  // Pagination math.
  const totalItems = statusFilteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const displayedTasks = statusFilteredTasks.slice(startIdx, startIdx + pageSize);

  // Count line reflects the active tab.
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

  // Pending / Completed status tabs — shown on every list view so completed
  // tasks live in their own tab instead of cluttering the pending list.
  const statusTabs = (
    <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '10px', padding: '3px', gap: '3px' }}>
      {[
        { id: 'pending', label: 'Pending', count: pendingTasks.length },
        { id: 'completed', label: 'Completed', count: completedTasks.length }
      ].map(tab => {
        const active = statusTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            style={{
              padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
              background: active ? '#FFFFFF' : 'transparent',
              color: active ? VISUAL_THEME.text : VISUAL_THEME.textSec,
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            {tab.label}
            <span style={{
              fontSize: '11px', fontWeight: 700, minWidth: '18px', textAlign: 'center',
              padding: '1px 6px', borderRadius: '999px',
              background: active ? (tab.id === 'completed' ? '#ECFDF5' : '#EEF2FF') : '#E2E8F0',
              color: active ? (tab.id === 'completed' ? '#059669' : VISUAL_THEME.accent) : VISUAL_THEME.textSec
            }}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );

  // Numbered page controls — only appear once there are more tasks than one page holds.
  const buildPageNumbers = () => {
    const pages = [];
    const windowSize = 5; // how many numbered buttons to show at once
    let start = Math.max(1, safePage - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, Math.min(start, end - windowSize + 1));
    for (let p = start; p <= end; p++) pages.push(p);
    return { pages, showFirst: start > 1, showLast: end < totalPages };
  };

  const pagination = totalItems > pageSize ? (() => {
    const { pages, showFirst, showLast } = buildPageNumbers();
    const btn = (content, onClick, opts = {}) => (
      <button
        key={opts.key || content}
        onClick={onClick}
        disabled={opts.disabled}
        aria-current={opts.active ? 'page' : undefined}
        style={{
          minWidth: '34px', height: '34px', padding: '0 10px', borderRadius: '8px',
          border: `1px solid ${opts.active ? VISUAL_THEME.accent : VISUAL_THEME.border}`,
          background: opts.active ? VISUAL_THEME.accent : '#FFFFFF',
          color: opts.active ? '#FFFFFF' : (opts.disabled ? '#CBD5E1' : VISUAL_THEME.text),
          fontSize: '13px', fontWeight: 600,
          cursor: opts.disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s'
        }}
      >{content}</button>
    );
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '4px 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, whiteSpace: 'nowrap' }}>Show:</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            style={{
              padding: '7px 28px 7px 10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`,
              fontSize: '12px', fontWeight: 500, color: VISUAL_THEME.text, background: '#FFFFFF', cursor: 'pointer', appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2.5\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', boxSizing: 'border-box'
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec, whiteSpace: 'nowrap', marginLeft: '4px' }}>
            {startIdx + 1}–{Math.min(startIdx + pageSize, totalItems)} of {totalItems}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {btn('‹', () => setCurrentPage(p => Math.max(1, p - 1)), { key: 'prev', disabled: safePage === 1 })}
          {showFirst && btn('1', () => setCurrentPage(1), { key: 'first' })}
          {showFirst && <span key="e1" style={{ color: VISUAL_THEME.textSec, padding: '0 2px' }}>…</span>}
          {pages.map(p => btn(String(p), () => setCurrentPage(p), { key: `p${p}`, active: p === safePage }))}
          {showLast && <span key="e2" style={{ color: VISUAL_THEME.textSec, padding: '0 2px' }}>…</span>}
          {showLast && btn(String(totalPages), () => setCurrentPage(totalPages), { key: 'last' })}
          {btn('›', () => setCurrentPage(p => Math.min(totalPages, p + 1)), { key: 'next', disabled: safePage === totalPages })}
        </div>
      </div>
    );
  })() : null;

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
            {formatIndianDate()} • {statusFilteredTasks.length} {statusTab === 'completed' ? 'completed' : 'pending'} • {completedTasks.length} completed in total
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {sortSelect}
          {moreMenu}
        </div>
      </div>

      {/* All Tasks: date-range quick filters + category dropdown.
          (Pending/Completed is handled by the shared status tabs below for every view.) */}
      {isAllTasks && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' }
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

      {/* Shared Pending / Completed status tabs for all list views */}
      <div>
        {statusTabs}
      </div>

      {/* Task list card */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {displayedTasks.length === 0 ? (
          <EmptyState isUpcoming={isUpcoming} heading={heading} onNewTask={onNewTask} statusTab={statusTab} />
        ) : (
          <>
            <DraggableTaskList
              tasks={displayedTasks}
              onReorder={handleReorderTasks}
              onToggle={handleToggleStatus}
              onSelectDetail={setInspectedTask}
              onEdit={onEdit}
              onDelete={handleDeleteTask}
              isMobile={isMobile}
              dragEnabled={false}
              showCategory={isAllTasks}
            />
            {pagination}
          </>
        )}
      </div>

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

function EmptyState({ isUpcoming, heading, onNewTask, statusTab }) {
  if (statusTab === 'completed') {
    return (
      <div style={{ padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>✅</div>
        <p style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 6px 0' }}>No completed tasks yet</p>
        <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0, maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          Tick a task off and it will move here automatically.
        </p>
      </div>
    );
  }
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>{isUpcoming ? '🗓️' : '📝'}</div>
      <p style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 6px 0' }}>
        {isUpcoming ? 'No upcoming tasks yet' : `No pending tasks in ${heading}`}
      </p>
      <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: '0 0 18px 0', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
        {isUpcoming
          ? 'Tasks with future dates will appear here. Create a task and set a date to see it in this list.'
          : 'All caught up — create a task or check the Completed tab.'}
      </p>
      {onNewTask && (
        <button onClick={onNewTask} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
      )}
    </div>
  );
}
