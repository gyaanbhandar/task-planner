'use client';

import React, { useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES, CLIENTS, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr, formatIndianDate } from '../utils/dateUtils';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import FormPanel from '../components/FormPanel';
import AuthScreen from '../components/AuthScreen';
import { authService } from '../services/authService';

export default function ModernTaskPlannerOS() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Navigation & Faceted Control Variables
  const [currentView, setCurrentView] = useState('today'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [dashboardFilter, setDashboardFilter] = useState('all');
  const [clientsExpanded, setClientsExpanded] = useState(true);
  
  // Viewports Context States
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);

  // Time-picker explicit configurations inside local state structures
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalCat, setModalCat] = useState('personal');
  const [modalSub, setModalSub] = useState('');
  const [modalPriority, setModalPriority] = useState('medium');
  const [modalDate, setModalDate] = useState(todayStr());
  const [modalHour, setModalHour] = useState('02');
  const [modalMin, setModalMin] = useState('00');
  const [modalPeriod, setModalPeriod] = useState('PM');
  const [modalType, setModalType] = useState('one-time');

  // Relational Database Registry
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'ek SEO ki resource hire karni hai', category: 'personal', subcategory: 'Personal', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '09:00 AM', description: 'Resource alignment pipeline allocation' },
    { id: 't2', title: 'Data compilation for corporate leads', category: 'professional', subcategory: 'Lead Gen', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '11:00 AM', description: 'Target segments database structuring' },
    { id: 't3', title: 'Invoice & Client Tracker updates', category: 'finance', subcategory: 'ABC', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '02:00 PM', description: 'Sync all audit ledgers tracking milestones' },
    { id: 't4', title: 'Daily Lead generation operations review', category: 'work', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '06:00 PM', description: 'Sync calls analysis data pipelines loops' },
    { id: 't5', title: 'Australian Data base scraping protocols', category: 'learning', subcategory: 'YUN', priority: 'medium', deadline: '2026-07-20', status: 'pending', time: '07:00 PM', description: 'Scrape targets index parameters check' },
    { id: 't6', title: 'Follow Week on Week Tracker for Horizon', category: 'clients', subcategory: 'Horizon Solutions', priority: 'low', deadline: '2026-07-22', status: 'pending', time: '07:30 PM', description: 'Milestone tracker validation review rules' },
  ]);

  // Notifications List Mock
  const [notifications, setNotifications] = useState([
    { id: 1, tag: 'OVERDUE ALERT', msg: 'Scraping protocol setup execution delayed past targeted schedule limits.', type: 'danger', time: 'Yesterday' },
    { id: 2, tag: 'AI OPTIMIZATION', msg: 'Shift resource management window blocks to morning intervals for performance gains.', type: 'intelligence', time: '10 mins ago' }
  ]);

  useEffect(() => {
    const handleResize = () => { setIsMobile(window.innerWidth < 1024); };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    authService.getSession().then((s) => { setSession(s); setAuthLoading(false); });
    const sub = authService.onAuthStateChange((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px', color: '#64748B' }}>Initializing Business OS Engine...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  const handleToggleStatus = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (inspectedTask?.id === id) setInspectedTask(null);
  };

  const handleCreateTaskSubmit = () => {
    if (!modalTitle.trim()) return;
    const constructedTime = `${modalHour}:${modalMin} ${modalPeriod}`;
    const newTask = {
      id: 'task_' + Date.now(),
      title: modalTitle,
      description: modalDesc,
      category: modalCat,
      subcategory: modalSub || 'General Workspace',
      priority: modalPriority,
      deadline: modalDate || todayStr(),
      status: 'pending',
      time: constructedTime
    };
    setTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
    // Reset inputs
    setModalTitle(''); setModalDesc(''); setModalSub('');
  };

  // Live Metrics calculations based on context state arrays
  const countToday = tasks.filter(t => t.deadline === todayStr()).length;
  const countPending = tasks.filter(t => t.status === 'pending').length;
  const countCompleted = tasks.filter(t => t.status === 'done').length;

  // Pipeline Filter Controller Engine Matrix
  const getFacetedDataset = () => {
    let output = [...tasks];
    
    if (currentView === 'today') {
      output = output.filter(t => t.deadline === todayStr());
    } else if (currentView === 'upcoming') {
      output = output.filter(t => t.deadline > todayStr());
    } else if (currentView === 'category' && activeCategory) {
      output = output.filter(t => t.category === activeCategory);
    } else if (currentView === 'client_workspace' && activeClient) {
      const selectedClient = CLIENTS.find(c => c.id === activeClient);
      const targetName = selectedClient ? selectedClient.name.toLowerCase() : '';
      output = output.filter(t => t.subcategory.toLowerCase().includes(targetName));
    } else if (currentView === 'recurring') {
      output = output.filter(t => t.time !== ''); // Display scheduling automation rows
    }

    if (dashboardFilter === 'today') output = output.filter(t => t.deadline === todayStr());
    if (dashboardFilter === 'pending') output = output.filter(t => t.status === 'pending');
    if (dashboardFilter === 'completed') output = output.filter(t => t.status === 'done');

    return output;
  };

  const viewableTasksList = getFacetedDataset();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: VISUAL_THEME.bg, overflow: 'hidden', position: 'relative' }}>
      
      {/* SIDEBAR NAVIGATION GRIDS CONTROLLER */}
      {(!isMobile || mobileSidebarOpen) && (
        <div style={{ 
          width: '280px', 
          height: '100%', 
          flexShrink: 0, 
          position: isMobile ? 'fixed' : 'relative', 
          zIndex: 9999,
          background: '#FFFFFF',
          borderRight: `1px solid ${VISUAL_THEME.border}`,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {isMobile && <button onClick={() => setMobileSidebarOpen(false)} style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: 'transparent', fontSize: '18px' }}>✕</button>}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '32px', background: VISUAL_THEME.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold' }}>✓</div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Business OS</h2>
              <p style={{ fontSize: '11px', color: VISUAL_THEME.textSec, margin: 0 }}>by Anukant</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
            {[
              { id: 'today', label: 'Today', icon: '☀️' },
              { id: 'upcoming', label: 'Upcoming Matrix', icon: '📅' },
              { id: 'calendar', label: 'Calendar Grid', icon: '🗓️' },
              { id: 'all_tasks', label: 'Master Repository', icon: '📋' },
              { id: 'ai_planner', label: 'AI Optimizer', icon: '🧠' },
              { id: 'recurring', label: 'Recurring Rules', icon: '🔄' }
            ].map(v => (
              <button key={v.id} onClick={() => { setCurrentView(v.id); setActiveCategory(null); setActiveClient(null); setMobileSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: currentView === v.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent', color: currentView === v.id ? VISUAL_THEME.accent : VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                <span>{v.icon}</span><span>{v.label}</span>
              </button>
            ))}

            <div style={{ marginTop: '20px', marginBottom: '6px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '12px' }}>Categories Matrix</div>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setCurrentView('category'); setActiveCategory(c.id); setActiveClient(null); setMobileSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: currentView === 'category' && activeCategory === c.id ? 'rgba(99, 102, 241, 0.04)' : 'transparent', color: VISUAL_THEME.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
                <span>{c.icon}</span><span>{c.name}</span>
              </button>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', justifyBaskets: 'space-between', justifyContent: 'space-between', marginTop: '20px', paddingLeft: '12px', paddingRight: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Faceted Clients</span>
              <button onClick={() => setClientsExpanded(!clientsExpanded)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: VISUAL_THEME.textSec, fontSize: '12px' }}>{clientsExpanded ? '▲' : '▼'}</button>
            </div>
            
            {clientsExpanded && CLIENTS.map(cl => (
              <button key={cl.id} onClick={() => { setCurrentView('client_workspace'); setActiveClient(cl.id); setActiveCategory(null); setMobileSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 20px', borderRadius: '6px', border: 'none', background: currentView === 'client_workspace' && activeClient === cl.id ? '#F4F4F5' : 'transparent', color: VISUAL_THEME.textSec, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>{cl.name} Workspace</span>
              </button>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${VISUAL_THEME.border}` }}>
              <button onClick={() => { setCurrentView('manage_categories'); setMobileSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', fontSize: '13px', color: VISUAL_THEME.textSec, cursor: 'pointer', textAlign: 'left' }}>📂 Manage Categories</button>
              <button onClick={() => { setCurrentView('notifications'); setMobileSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', fontSize: '13px', color: VISUAL_THEME.textSec, cursor: 'pointer', textAlign: 'left' }}>🔔 Notifications Alerts</button>
            </div>
          </div>

          <div style={{ marginTop: '16px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '12px', display: 'flex', alignItems: 'center', justifyBasket: 'space-between', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.1)', color: VISUAL_THEME.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>A</div>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{session.user.email.split('@')[0]}</span>
            </div>
            <button onClick={() => authService.signOut()} style={{ background: '#FEE2E2', border: 'none', borderRadius: '6px', width: '28px', height: '28px', color: '#EF4444', cursor: 'pointer' }}>⏻</button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT FRAME LAYER COMPONENTS */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Global Toolbar Header Component */}
        <div style={{ height: '70px', borderBottom: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyBaskets: 'space-between', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '20px' }}>☰</button>}
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: VISUAL_THEME.text, textTransform: 'capitalize' }}>{currentView.replace('_', ' ')} Pane</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
        </div>

        {/* Dynamic Inner Component Matrix Containers Template Canvas Content Layout Viewport Router */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '32px' }}>
          
          {/* TODAY OR FILTERED MATRIX WORKSPACE PANELS CONTAINER VIEW */}
          {['today', 'upcoming', 'category', 'client_workspace'].includes(currentView) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Dynamic Metric Widget Controls Component Row Grid */}
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

              {/* Task Cards Matrix Engine Element Array */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {viewableTasksList.length > 0 ? (
                    viewableTasksList.map(t => (
                      <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                    ))
                  ) : (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: VISUAL_THEME.textSec, fontSize: '13px' }}>No metrics map inside current operational viewport template constraints.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SCREEN: CALENDAR VIEW COMPONENT GRID LAYOUT TEMPLATE ENGINE */}
          {currentView === 'calendar' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
              <div style={{ display: 'flex', justifyBaskets: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>July 2026 Grid Matrix</h3>
                <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>Faceted Calendar Viewport Engine</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: VISUAL_THEME.border }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} style={{ background: '#F8FAFC', padding: '10px', fontSize: '11px', fontWeight: 600, textAlign: 'center', color: VISUAL_THEME.textSec }}>{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const dayStrVal = `2026-07-${String(i + 1).padStart(2, '0')}`;
                  const dayTasks = tasks.filter(t => t.deadline === dayStrVal);
                  return (
                    <div key={i} style={{ background: '#FFFFFF', minHeight: '85px', padding: '8px', border: `1px solid ${VISUAL_THEME.borderAlt}` }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: dayStrVal === todayStr() ? VISUAL_THEME.accent : VISUAL_THEME.text }}>{i + 1}</span>
                      {dayTasks.map(dt => (
                        <div key={dt.id} style={{ fontSize: '9px', background: 'rgba(99,102,241,0.06)', color: VISUAL_THEME.accent, padding: '2px 4px', borderRadius: '4px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          ⏰ {dt.time} - {dt.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN: MASTER ALL TASKS REPOSITORY LIST ARCHITECTURE */}
          {currentView === 'all_tasks' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${VISUAL_THEME.border}`, color: VISUAL_THEME.textSec }}>
                    <th style={{ padding: '14px 20px' }}>Task Workspace Node</th>
                    <th style={{ padding: '14px 20px' }}>Category Context</th>
                    <th style={{ padding: '14px 20px' }}>Client Node Tag</th>
                    <th style={{ padding: '14px 20px' }}>Target Milestone Schedule</th>
                    <th style={{ padding: '14px 20px' }}>Priority Index</th>
                    <th style={{ padding: '14px 20px' }}>Lifecycle Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${VISUAL_THEME.borderAlt}` }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600 }}>{t.title}</td>
                      <td style={{ padding: '14px 20px' }}><span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.accent }}>{t.category}</span></td>
                      <td style={{ padding: '14px 20px', color: VISUAL_THEME.textSec }}>{t.subcategory}</td>
                      <td style={{ padding: '14px 20px' }}>📅 {t.deadline} @ {t.time}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: PRIORITY_CONFIG[t.priority]?.color }}>{t.priority.toUpperCase()}</td>
                      <td style={{ padding: '14px 20px' }}><span style={{ padding: '4px 8px', borderRadius: '6px', background: t.status === 'done' ? '#ECFDF5' : '#FFFBEB', color: t.status === 'done' ? '#059669' : '#D97706', fontSize: '11px', fontWeight: 600 }}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SCREEN: AI PLANNER INTELLIGENT SCHEDULING INTERFACE NODES */}
          {currentView === 'ai_planner' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧠</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>AI Schedule Core Optimization Calibration</h3>
              <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>Let Claude parse operational parameters across workspaces nodes to safely eliminate scheduling friction overlaps inside active frames maps.</p>
              <button style={{ padding: '12px 24px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>🤖 Run Schedule Calibration Engine</button>
            </div>
          )}

          {/* SCREEN: RECURRING HABITS ROUTINES MONITOR CONTROL HUB */}
          {currentView === 'recurring' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Automated Routine Schedules Nodes Matrix</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map(t => (
                  <div key={t.id + '_rec'} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}`, display: 'flex', alignItems: 'center', justifyBaskets: 'space-between', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px' }}>🔄</span>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>{t.title}</h4>
                        <p style={{ fontSize: '11px', color: VISUAL_THEME.textSec, margin: '2px 0 0 0' }}>Faceted Pattern: Run daily routine iteration cycle loops at {t.time}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Active Loop</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN: CATEGORIES TAXONOMY MANAGEMENT GRID SYSTEM FRAME */}
          {currentView === 'manage_categories' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Faceted Workspaces Taxonomy Schema</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                {CATEGORIES.map(cat => (
                  <div key={cat.id} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}`, display: 'flex', alignItems: 'center', justifyBaskets: 'space-between', justifyContent: 'space-between', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{cat.name} Context Node</span>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: cat.bg, color: cat.color, fontWeight: 700 }}>SYSTEM BLOCK</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN: SYSTEM ALERTS LOG CONSOLE AND NOTIFICATIONS ENGINE */}
          {currentView === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Alerts Performance Logging Console</h3>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, borderLeft: `4px solid ${n.type === 'danger' ? '#EF4444' : VISUAL_THEME.accent}`, display: 'flex', justifyBaskets: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: n.type === 'danger' ? '#EF4444' : VISUAL_THEME.accent, fontWeight: 700, display: 'block', marginBottom: '4px' }}>{n.tag}</span>
                    <p style={{ fontSize: '13px', margin: 0, fontWeight: 500 }}>{n.msg}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>{n.time}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* OVERLAY DRILL-IN INSPECTION SLIDE SHEET DETAIL ELEMENT PANEL */}
      {inspectedTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', justifyBaskets: 'flex-end', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.2)' }} onClick={() => setInspectedTask(null)} />
          <div style={{ width: isMobile ? '100vw' : '420px', height: '100%', background: '#FFFFFF', position: 'relative', zIndex: 100000, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '-4px 0 25px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyBaskets: 'space-between', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${VISUAL_THEME.border}`, paddingBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: VISUAL_THEME.accent }}>Inspection Meta Log Sheet</span>
              <button onClick={() => setInspectedTask(null)} style={{ border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>{inspectedTask.title}</h3>
              <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, lineHeight: 1.5 }}>{inspectedTask.description || 'No contextual operational descriptors mapped.'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${VISUAL_THEME.borderAlt}`, paddingTop: '16px', fontSize: '12px' }}>
              <div><strong>Faceted Category ID:</strong> {inspectedTask.category.toUpperCase()}</div>
              <div><strong>Workspace Label Segment:</strong> {inspectedTask.subcategory}</div>
              <div><strong>Target Pipeline Schedule:</strong> {inspectedTask.deadline} @ {inspectedTask.time}</div>
            </div>
            <button onClick={() => { handleToggleStatus(inspectedTask.id); setInspectedTask(null); }} style={{ marginTop: 'auto', width: '100%', padding: '14px', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Toggle Complete State ✓</button>
          </div>
        </div>
      )}

      {/* REDESIGNED POPUP NEW TASK ACTION MODAL (AM/PM OPTIMIZED STRUCTURE) */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyBaskets: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', padding: isMobile ? '0' : '24px', boxSizing: 'border-box' }} onClick={(e) => { if(e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div style={{ background: '#FFFFFF', borderRadius: isMobile ? '24px 24px 0 0' : '20px', padding: '28px 20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', justifyBaskets: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Create Task Pipeline Node</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Task Title *</label>
                <input type="text" placeholder="e.g., Ansh se baat karni hai" value={modalTitle} onChange={e => setModalTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Description Details</label>
                <textarea placeholder="Context block items descriptors..." value={modalDesc} onChange={e => setModalDesc(e.target.value)} style={{ width: '100%', height: '60px', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', resize: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Category</label>
                  <select value={modalCat} onChange={e => setModalCat(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Client Node / Subcategory</label>
                  <input type="text" placeholder="e.g., ABC, YUN, Lead Gen" value={modalSub} onChange={e => setModalSub(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* RE-ENGINEERED DATE FIELD & EXPLICIT DYNAMIC AM/PM TIME INPUT COMPONENT CONTROL SELECTION GRIDS */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Target Milestone Schedule</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} style={{ flex: 2, minWidth: '130px', padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box' }} />
                  
                  {/* Hours select dropdown array node */}
                  <select value={modalHour} onChange={e => setModalHour(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box' }}>
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  
                  {/* Minutes select dropdown array node */}
                  <select value={modalMin} onChange={e => setModalMin(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box' }}>
                    {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>

                  {/* AM/PM toggle structure element block */}
                  <select value={modalPeriod} onChange={e => setModalPeriod(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', color: '#FFFFFF', background: VISUAL_THEME.accent, fontWeight: 'bold', boxSizing: 'border-box', cursor: 'pointer' }}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Priority Index Level</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Object.keys(PRIORITY_CONFIG).map(k => (
                    <button key={k} type="button" onClick={() => setModalPriority(k)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: modalPriority === k ? `2px solid ${PRIORITY_CONFIG[k].color}` : `1px solid ${VISUAL_THEME.border}`, background: modalPriority === k ? PRIORITY_CONFIG[k].bg : '#FFFFFF', color: PRIORITY_CONFIG[k].color, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {PRIORITY_CONFIG[k].icon} {PRIORITY_CONFIG[k].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '16px', marginTop: '8px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateTaskSubmit} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Task Block</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
