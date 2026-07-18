// app/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES, CLIENTS, RECURRING_PRESETS, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr, formatIndianDate } from '../utils/dateUtils';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import FormPanel from '../components/FormPanel';
import AuthScreen from '../components/AuthScreen';
import { authService } from '../services/authService';

export default function ModernTaskPlannerOS() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Advanced Matrix State View Engine
  const [currentView, setCurrentView] = useState('today'); // Options: today, upcoming, calendar, all_tasks, ai_planner, recurring, client_workspace, categories_matrix, notifications
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  
  // Overlays & Focus Inspector Sheet states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);
  const [subtasks, setSubtasks] = useState([
    { id: 1, title: 'Crawl the website', completed: true, date: '14 Jul' },
    { id: 2, title: 'Check technical issues', completed: true, date: '14 Jul' },
    { id: 3, title: 'Analyze on-page SEO', completed: false, date: '16 Jul' },
    { id: 4, title: 'Prepare report & recommendations', completed: false, date: '18 Jul' }
  ]);

  // Mock Active Mock Database System Context
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'ek SEO ki resource hire karni hai', category: 'personal', subcategory: 'Personal', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '09:00 AM' },
    { id: 't2', title: 'Data compilation', category: 'professional', subcategory: 'Lead Gen', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '11:00 AM' },
    { id: 't3', title: 'Invoice & Client Tracker', category: 'personal', subcategory: 'Personal', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '02:00 PM' },
    { id: 't4', title: 'Daily Task', category: 'work', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '06:00 PM' },
    { id: 't5', title: 'Australian Data base', category: 'professional', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-18', status: 'pending', time: '07:00 PM' },
    { id: 't6', title: 'Follow Week on Week Tracker for Horizon', category: 'clients', subcategory: 'Horizon Solutions', priority: 'low', deadline: '2026-07-19', status: 'pending', time: '07:30 PM' },
  ]);

  useEffect(() => {
    authService.getSession().then((s) => { setSession(s); setAuthLoading(false); });
    const sub = authService.onAuthStateChange((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px', fontWeight: 500, color: '#64748B' }}>Initializing Business OS Engine...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  const handleToggleStatus = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (inspectedTask?.id === id) setInspectedTask(null);
  };

  const triggerViewTransition = (viewId, catId = null, clientId = null) => {
    setCurrentView(viewId);
    setActiveCategory(catId);
    setActiveClient(clientId);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: VISUAL_THEME.bg, overflow: 'hidden' }}>
      
      {/* Structural Core Layout Left Control Bar Component */}
      <div style={{ width: '260px', height: '100%', flexShrink: 0 }}>
        <Sidebar currentView={currentView} onViewChange={triggerViewTransition} activeCategory={activeCategory} activeClient={activeClient} taskCounts={{}} userName={session.user.email} onLogout={() => authService.signOut().then(() => setSession(null))} />
      </div>

      {/* Main Structural Right Core Canvas Dynamic Panel Viewport */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Dynamic Canvas Universal Header Node component */}
        <div style={{ height: '70px', borderBottom: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search tasks, clients, workspaces..." style={{ width: '280px', padding: '8px 16px 8px 36px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px' }} />
              <span style={{ position: 'absolute', left: '12px', top: '9px', fontSize: '14px', color: '#94A3B8' }}>🔍</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => triggerViewTransition('notifications')}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <span style={{ position: 'absolute', top: '-2px', right: '-4px', background: '#EF4444', color: '#FFFFFF', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold' }}>2</span>
            </div>
            <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>+ New Task</button>
          </div>
        </div>

        {/* Dynamic Canvas Container Target Context Framework */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          
          {/* ========================================================= */}
          {/* SCREEN 1: DASHBOARD VIEW CORE GRAPHIC ELEMENT FLOW MODULE */}
          {/* ========================================================= */}
          {currentView === 'today' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '6px' }}>Good morning, Anukant 👋</h1>
                <p style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>{formatIndianDate()}</p>
              </div>

              {/* Statistical Analytics KPI Metric Board Widgets Elements Row Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Today', count: 6, icon: '📅', bg: '#EEF2FF', color: '#4F46E5' },
                  { label: 'Pending', count: 14, icon: '⏳', bg: '#FFFBEB', color: '#D97706' },
                  { label: 'Upcoming', count: 8, icon: '📆', bg: '#EFF6FF', color: '#2563EB' },
                  { label: 'Completed', count: 3, icon: '✅', bg: '#ECFDF5', color: '#059669' },
                  { label: 'Skipped', count: 2, icon: '❌', bg: '#FEF2F2', color: '#DC2626' }
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: VISUAL_THEME.textSec, display: 'block', marginBottom: '8px' }}>{stat.label}</span>
                      <span style={{ fontSize: '24px', fontWeight: 700, color: VISUAL_THEME.text }}>{stat.count} <span style={{ fontSize: '12px', fontWeight: 400, color: VISUAL_THEME.textSec }}>tasks</span></span>
                    </div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{stat.icon}</div>
                  </div>
                ))}
              </div>

              {/* Section Subtitle Task Registry Area Block Array */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: VISUAL_THEME.text }}>Today's Tasks</h3>
                  <span style={{ color: VISUAL_THEME.accent, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setCurrentView('calendar')}>View Calendar</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.map(t => (
                    <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                  ))}
                </div>
              </div>

              {/* Ambient Tip Banner Context Layer Component Info Block */}
              <div style={{ padding: '16px 20px', background: '#EEF2FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#4F46E5', fontWeight: 500 }}>💡 Tip: Stay consistent! You've completed 3 tasks this month.</span>
                <span style={{ fontSize: '13px', color: '#4F46E5', fontWeight: 600, cursor: 'pointer' }}>Keep going! 💪</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2: CHRONOLOGICAL PLANNER MODULE (UPCOMING TASKS)   */}
          {/* ========================================================= */}
          {currentView === 'upcoming' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '6px' }}>Upcoming Tasks</h1>
                <p style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>All your tasks coming up</p>
              </div>

              {/* Section Interval Segmentation Nodes Matrix Array */}
              {['Tomorrow, 17 July 2026', 'This Week (18 – 24 July 2026)', 'Next Week (25 – 31 July 2026)'].map((segment, sIdx) => (
                <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text }}>{segment}</span>
                    <span style={{ fontSize: '11px', background: '#F1F5F9', color: VISUAL_THEME.textSec, padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{sIdx === 1 ? '4 tasks' : '2 tasks'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tasks.slice(sIdx, sIdx + 2).map(t => (
                      <TaskCard key={t.id + sIdx} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3: UNIFIED GRID SYSTEM CALENDAR LAYER INTERFACE    */}
          {/* ========================================================= */}
          {currentView === 'calendar' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700 }}>July 2026</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Day', 'Week', 'Month', 'Year'].map(m => (
                      <button key={m} style={{ padding: '6px 12px', border: `1px solid ${VISUAL_THEME.border}`, background: m === 'Month' ? '#F1F5F9' : '#FFFFFF', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>{m}</button>
                    ))}
                  </div>
                </div>
                {/* Visual Representation Layout Block Matrix Elements Grid Array */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: VISUAL_THEME.border }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} style={{ background: '#F8FAFC', padding: '10px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, textAlign: 'center' }}>{d}</div>
                  ))}
                  {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} style={{ background: '#FFFFFF', minHeight: '90px', padding: '8px', border: `1px solid ${VISUAL_THEME.borderAlt}` }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: i === 15 ? VISUAL_THEME.accent : VISUAL_THEME.text, background: i === 15 ? 'rgba(99, 102, 241, 0.15)' : 'transparent', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{i + 1}</span>
                      {i === 0 && <div style={{ fontSize: '10px', background: 'rgba(99,102,241,0.08)', color: VISUAL_THEME.accent, padding: '2px 4px', borderRadius: '4px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>💼 Invoice & Tracker</div>}
                      {i === 15 && <div style={{ fontSize: '10px', background: 'rgba(16,185,129,0.08)', color: '#10B981', padding: '2px 4px', borderRadius: '4px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✅ Team presentation</div>}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dynamic Faceted Sidebar Integration Filters Container Block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Mini Calendar</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
                    {Array.from({ length: 31 }).map((_, idx) => (
                      <span key={idx} style={{ padding: '4px', borderRadius: '4px', background: idx === 15 ? VISUAL_THEME.accent : 'transparent', color: idx === 15 ? '#FFFFFF' : VISUAL_THEME.text }}>{idx + 1}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Faceted Navigation</h4>
                  {['Category', 'Client', 'Task Type'].map((filterLabel, idx) => (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', color: VISUAL_THEME.textSec, display: 'block', marginBottom: '4px' }}>{filterLabel}</label>
                      <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px' }}><option>All {filterLabel}s</option></select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 4: MASTER REPOSITORY TABLE (ALL TASKS)             */}
          {/* ========================================================= */}
          {currentView === 'all_tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '4px' }}>All Tasks</h1>
                <p style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>Manage and track all your tasks in one place.</p>
              </div>

              {/* Advanced Controls Filtration Layer Console Tool Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) auto', gap: '12px', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}` }}>
                {['Status', 'Category', 'Client', 'Priority', 'Task Type', 'Due Date'].map((label, idx) => (
                  <select key={idx} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FAFAFA', fontSize: '13px' }}>
                    <option>All {label}s</option>
                  </select>
                ))}
                <button style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Clear</button>
              </div>

              {/* Relational Table Architecture Mapping Segment */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${VISUAL_THEME.border}`, color: VISUAL_THEME.textSec }}>
                      <th style={{ padding: '14px 20px' }}><input type="checkbox" /></th>
                      <th style={{ padding: '14px 20px' }}>Task</th>
                      <th style={{ padding: '14px 20px' }}>Category</th>
                      <th style={{ padding: '14px 20px' }}>Client</th>
                      <th style={{ padding: '14px 20px' }}>Priority</th>
                      <th style={{ padding: '14px 20px' }}>Due Date</th>
                      <th style={{ padding: '14px 20px' }}>Repeat</th>
                      <th style={{ padding: '14px 20px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${VISUAL_THEME.borderAlt}`, cursor: 'pointer' }} onClick={() => setInspectedTask(t)}>
                        <td style={{ padding: '14px 20px' }} onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                        <td style={{ padding: '14px 20px', fontWeight: 500 }}>{t.title}</td>
                        <td style={{ padding: '14px 20px' }}>{t.category}</td>
                        <td style={{ padding: '14px 20px', color: VISUAL_THEME.textSec }}>{t.subcategory || '—'}</td>
                        <td style={{ padding: '14px 20px' }}><span style={{ color: PRIORITY_CONFIG[t.priority].color, fontWeight: 600 }}>{t.priority}</span></td>
                        <td style={{ padding: '14px 20px', color: '#EF4444' }}>{t.deadline}</td>
                        <td style={{ padding: '14px 20px', color: VISUAL_THEME.textSec }}>Daily</td>
                        <td style={{ padding: '14px 20px' }}><span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.08)', color: VISUAL_THEME.accent, fontSize: '11px', fontWeight: 600 }}>Pending</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 6: SYSTEM CATEGORY WORKSPACE / CLIENT PANELS FRAME */}
          {/* ========================================================= */}
          {currentView === 'client_workspace' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Dynamic Header Frame parameters based on Selection context map */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>AB</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h1 style={{ fontSize: '22px', fontWeight: 700 }}>ABC</h1>
                      <span style={{ fontSize: '12px', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Client</span>
                    </div>
                    <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, marginTop: '4px' }}>All tasks and activities related to ABC workspace environment</p>
                  </div>
                </div>
                <button style={{ padding: '10px 20px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Edit Details</button>
              </div>

              {/* Internal Tab Workspace Segment View Options Toggle List */}
              <div style={{ display: 'flex', gap: '24px', borderBottom: `1px solid ${VISUAL_THEME.border}`, paddingBottom: '12px' }}>
                {['Overview', 'Tasks', 'Calendar', 'Files', 'Notes', 'Activity'].map((tab, idx) => (
                  <span key={idx} style={{ fontSize: '14px', fontWeight: idx === 0 ? 600 : 500, color: idx === 0 ? VISUAL_THEME.accent : VISUAL_THEME.textSec, cursor: 'pointer', borderBottom: idx === 0 ? `2px solid ${VISUAL_THEME.accent}` : 'none', paddingBottom: '12px', marginBottom: '-14px' }}>{tab}</span>
                ))}
              </div>

              {/* Nested Board Grid Layout Mapping Framework */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Active Workspace Boards</h3>
                  {tasks.slice(0, 3).map(t => (
                    <TaskCard key={t.id + '_cl'} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Category Progress Wheel</h4>
                    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #F1F5F9', borderRadius: '50%', width: '140px', margin: '0 auto', flexDirection: 'column' }}>
                      <span style={{ fontSize: '24px', fontWeight: 700 }}>29%</span>
                      <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 8: THE INTELLIGENT MODULE ENGINE (AI PLANNER VIEW) */}
          {/* ========================================================= */}
          {currentView === 'ai_planner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '4px' }}>AI Planner <span style={{ fontSize: '12px', background: 'rgba(99,102,241,0.15)', color: VISUAL_THEME.accent, padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>BETA</span></h1>
                <p style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>Your AI-powered planning assistant system context</p>
              </div>

              {/* Metrics Cockpit Panels Section Framework Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Estimated Focus Time', value: '6h 20m', note: '+ 20m vs yesterday' },
                  { label: 'Tasks Planned', value: '12', note: '+ 2 vs yesterday' },
                  { label: 'Meetings Mapped', value: '2', note: 'Same as yesterday' },
                  { label: 'Focus Score Gauge', value: '78%', note: 'Good' }
                ].map((panel, idx) => (
                  <div key={idx} style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}` }}>
                    <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec, display: 'block', marginBottom: '8px' }}>{panel.label}</span>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>{panel.value}</h3>
                    <span style={{ fontSize: '11px', color: '#10B981' }}>{panel.note}</span>
                  </div>
                ))}
              </div>

              {/* Central Scheduling Call-To-Action Primary Automation Control */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Ready to optimize your operational schedule?</h3>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, marginBottom: '20px' }}>Let Claude evaluate your cross-filtration nodes to eliminate negative friction loops.</p>
                <button style={{ width: '100%', padding: '14px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>🤖 Plan My Day (AI Schedule Engine)</button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 9: TASK AUTOMATION DASHBOARD (RECURRING FLOW MODULE)*/}
          {/* ========================================================= */}
          {currentView === 'recurring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '4px' }}>Recurring Tasks</h1>
                  <p style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>Manage all your recurring tasks and habits in one place.</p>
                </div>
                <button style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Recurring Task</button>
              </div>

              {/* Horizontal Filter Navigation Strip Layout */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${VISUAL_THEME.border}`, paddingBottom: '12px' }}>
                {['All', 'Daily', 'Weekly', 'Monthly', 'Custom'].map((tab, idx) => (
                  <button key={idx} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', background: idx === 0 ? 'rgba(99,102,241,0.1)' : 'transparent', color: idx === 0 ? VISUAL_THEME.accent : VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{tab}</button>
                ))}
              </div>

              {/* Automated Interface Engines Data Grid List Table */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${VISUAL_THEME.border}`, color: VISUAL_THEME.textSec }}>
                      <th style={{ padding: '14px 20px' }}>Task</th>
                      <th style={{ padding: '14px 20px' }}>Schedule</th>
                      <th style={{ padding: '14px 20px' }}>Next Run</th>
                      <th style={{ padding: '14px 20px' }}>Last Completed</th>
                      <th style={{ padding: '14px 20px' }}>Status Toggle</th>
                      <th style={{ padding: '14px 20px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECURRING_PRESETS.map(preset => (
                      <tr key={preset.id} style={{ borderBottom: `1px solid ${VISUAL_THEME.borderAlt}` }}>
                        <td style={{ padding: '14px 20px', fontWeight: 500 }}>{preset.title}</td>
                        <td style={{ padding: '14px 20px' }}><span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', fontSize: '11px', color: VISUAL_THEME.textSec }}>🔄 {preset.frequency}</span></td>
                        <td style={{ padding: '14px 20px', color: VISUAL_THEME.textSec }}>{preset.nextRun}</td>
                        <td style={{ padding: '14px 20px', color: '#10B981' }}>{preset.lastCompleted}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <input type="checkbox" checked={preset.active} readOnly style={{ accentColor: VISUAL_THEME.accent, transform: 'scale(1.2)', cursor: 'pointer' }} />
                        </td>
                        <td style={{ padding: '14px 20px' }}>✏️ &nbsp; 🗑️</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 10: CRM HUB (CLIENTS MANAGEMENT MATRIX VIEWPORT)   */}
          {/* ========================================================= */}
          {currentView === 'clients_hub' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '4px' }}>Clients Portfolio</h1>
                  <p style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>Manage your corporate pipelines and projects in one integrated workspace dashboard.</p>
                </div>
                <button style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ Add Client Portfolio</button>
              </div>

              {/* Profiles Array Blocks Layout Container */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {CLIENTS.map(client => (
                  <div key={client.id} style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', position: 'relative', cursor: 'pointer' }} onClick={() => triggerViewTransition('client_workspace', null, client.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', color: VISUAL_THEME.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>{client.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{client.name}</h3>
                        <span style={{ fontSize: '11px', color: client.status === 'Active' ? '#10B981' : '#F59E0B' }}>● {client.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${VISUAL_THEME.borderAlt}`, paddingTop: '14px', fontSize: '12px', color: VISUAL_THEME.textSec }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Client Health Status:</span><span style={{ fontWeight: 600, color: '#10B981' }}>{client.health}%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Operations:</span><span style={{ fontWeight: 600, color: VISUAL_THEME.text }}>{client.metrics.total} Tasks</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 11: TAXONOMY SYSTEM (CATEGORIES ARCHITECTURE FRAME)*/}
          {/* ========================================================= */}
          {currentView === 'categories_matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '4px' }}>Categories Control Frame</h1>
                  <p style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>Organize operational workflows with relational subcategory architecture mappings.</p>
                </div>
                <button style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ Add New Category</button>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${VISUAL_THEME.border}`, color: VISUAL_THEME.textSec }}>
                      <th style={{ padding: '14px 20px' }}>Category Name</th>
                      <th style={{ padding: '14px 20px' }}>Associated Task Count</th>
                      <th style={{ padding: '14px 20px' }}>Status Lifecycle</th>
                      <th style={{ padding: '14px 20px' }}>Created On Timestamp</th>
                      <th style={{ padding: '14px 20px' }}>Management Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map(cat => (
                      <tr key={cat.id} style={{ borderBottom: `1px solid ${VISUAL_THEME.borderAlt}` }}>
                        <td style={{ padding: '14px 20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>{cat.icon}</span><span>{cat.name}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 500 }}>24 tasks associated</td>
                        <td style={{ padding: '14px 20px' }}><span style={{ color: '#10B981', fontWeight: 500 }}>Active Node</span></td>
                        <td style={{ padding: '14px 20px', color: VISUAL_THEME.textSec }}>Jun 10, 2026</td>
                        <td style={{ padding: '14px 20px' }}>✏️ &nbsp; 🗑️</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 12: NOTIFICATION CONSOLE (ALERTS CONTROL SYSTEM)   */}
          {/* ========================================================= */}
          {currentView === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${VISUAL_THEME.border}`, paddingBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Notifications & Alerts Center</h1>
                  <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec }}>Monitor live performance indexes, dependencies tracking logs, and overdue alerts.</p>
                </div>
                <button style={{ padding: '8px 16px', border: `1px solid ${VISUAL_THEME.border}`, borderRadius: '6px', fontSize: '13px', background: '#FFFFFF', cursor: 'pointer' }}>Mark all as read</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { tag: 'OVERDUE ALERT', msg: 'On-page SEO optimization failed to execute target schedule inside bracket parameters yesterday.', type: 'danger', time: 'Yesterday, 10:00 AM' },
                  { tag: 'AI OPTIMIZATION SUGGESTION', msg: 'Finish Horizon SEO Report is tracked as high friction weight asset. Moving bracket window block allocations to 09:00 AM is advised.', type: 'intelligence', time: '09:15 AM' }
                ].map((notif, idx) => (
                  <div key={idx} style={{ padding: '16px 20px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, borderLeft: `4px solid ${notif.type === 'danger' ? '#EF4444' : VISUAL_THEME.accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: notif.type === 'danger' ? '#EF4444' : VISUAL_THEME.accent, display: 'block', marginBottom: '4px' }}>{notif.tag}</span>
                      <p style={{ fontSize: '13px', margin: 0, fontWeight: 500, color: VISUAL_THEME.text }}>{notif.msg}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec, whiteSpace: 'nowrap', marginLeft: '20px' }}>{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* SCREEN 7: INSPECTION SIDEBAR SLIDE-OUT SHEET PANEL        */}
        {/* ========================================================= */}
        {inspectedTask && (
          <div style={{ position: 'absolute', top: 0, right: 0, width: '420px', height: '100%', background: '#FFFFFF', borderLeft: `1px solid ${VISUAL_THEME.border}`, boxShadow: '-4px 0 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
            <div style={{ padding: '24px', borderBottom: `1px solid ${VISUAL_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.1)', color: VISUAL_THEME.accent, padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>ABC Client Node</span>
              <button onClick={() => setInspectedTask(null)} style={{ border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer', color: VISUAL_THEME.textSec }}>✕</button>
            </div>
            
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{inspectedTask.title}</h2>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, lineHeight: 1.6 }}>Complete premium optimization rules tracking analytics data points inline inside active canvas frames.</p>
              </div>

              {/* Native Checklist Progress Component Meter Container */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.textSec, textTransform: 'uppercase', marginBottom: '12px' }}>Subtasks Timeline Checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {subtasks.map(st => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" checked={st.completed} readOnly style={{ accentColor: VISUAL_THEME.accent }} />
                        <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? VISUAL_THEME.textSec : VISUAL_THEME.text }}>{st.title}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>{st.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Embedded Stopwatch Widget Time Tracker Component Panel */}
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}` }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, display: 'block', marginBottom: '6px' }}>TRACKED TIME ACTIVE LABELS</span>
                <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>02:30 hrs</h3>
                  <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '24px', borderTop: `1px solid ${VISUAL_THEME.border}`, display: 'flex', gap: '12px' }}>
              <button onClick={() => { handleToggleStatus(inspectedTask.id); setInspectedTask(null); }} style={{ flex: 1, padding: '12px', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Mark Complete ✓</button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* SCREEN 5: CREATE CONTEXTUAL ACTION MODAL OVERLAY STATE    */}
      {/* ========================================================= */}
      {showCreateModal && (
        <FormPanel form={{ title: '', description: '', category: 'personal', subcategory: '', priority: 'medium', deadline: todayStr(), type: 'daily' }} setForm={() => {}} editTask={null} onSubmit={() => setShowCreateModal(false)} onClose={() => setShowCreateModal(false)} isMobile={false} />
      )}

    </div>
  );
}
