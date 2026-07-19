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
  
  // Dashboard Metrics Filtering State ('all', 'today', 'pending', 'upcoming', 'completed', 'skipped')
  const [dashboardFilter, setDashboardFilter] = useState('all');
  
  // Sidebar routing configurations
  const [currentView, setCurrentView] = useState('today'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);

  const [subtasks, setSubtasks] = useState([
    { id: 1, title: 'Crawl the website', completed: true, date: '14 Jul' },
    { id: 2, title: 'Check technical issues', completed: true, date: '14 Jul' },
    { id: 3, title: 'Analyze on-page SEO', completed: false, date: '16 Jul' },
    { id: 4, title: 'Prepare report & recommendations', completed: false, date: '18 Jul' }
  ]);

  // Unified Centralized Tasks Database Registry Matrix
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'ek SEO ki resource hire karni hai', category: 'personal', subcategory: 'Personal', priority: 'high', deadline: '2026-07-19T09:00', status: 'pending', time: '09:00 AM' },
    { id: 't2', title: 'Data compilation', category: 'professional', subcategory: 'Lead Gen', priority: 'high', deadline: '2026-07-19T11:00', status: 'pending', time: '11:00 AM' },
    { id: 't3', title: 'Invoice & Client Tracker', category: 'personal', subcategory: 'Personal', priority: 'medium', deadline: '2026-07-19T14:00', status: 'pending', time: '02:00 PM' },
    { id: 't4', title: 'Daily Task', category: 'work', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-19T18:00', status: 'pending', time: '06:00 PM' },
    { id: 't5', title: 'Australian Data base', category: 'professional', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-18T19:00', status: 'pending', time: '07:00 PM' },
    { id: 't6', title: 'Follow Week on Week Tracker for Horizon', category: 'clients', subcategory: 'Horizon Solutions', priority: 'low', deadline: '2026-07-19T19:30', status: 'pending', time: '07:30 PM' },
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

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px', fontWeight: 500, color: '#64748B' }}>Initializing Business OS Engine...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  const handleToggleStatus = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (inspectedTask?.id === id) setInspectedTask(null);
  };

  // Triggered when task created inside popup
  const handleCreateTask = (newTaskData) => {
    let extractedTime = '09:00 AM';
    if (newTaskData.deadline) {
      const d = new Date(newTaskData.deadline);
      if (!isNaN(d.getTime())) {
        extractedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    }
    const finalTask = {
      id: 'task_' + Date.now(),
      title: newTaskData.title,
      category: newTaskData.category,
      subcategory: newTaskData.subcategory || 'General',
      priority: newTaskData.priority,
      deadline: newTaskData.deadline.split('T')[0],
      status: 'pending',
      time: extractedTime
    };
    setTasks(prev => [finalTask, ...prev]);
    setShowCreateModal(false);
  };

  const triggerViewTransition = (viewId, catId = null, clientId = null) => {
    setCurrentView(viewId);
    setActiveCategory(catId);
    setActiveClient(clientId);
    setDashboardFilter('all'); // Reset dashboard card filter on view transition
    setMobileSidebarOpen(false);
  };

  // Global Engine Metric Counts Calc
  const countToday = tasks.filter(t => t.deadline && t.deadline.includes(todayStr())).length;
  const countPending = tasks.filter(t => t.status === 'pending').length;
  const countCompleted = tasks.filter(t => t.status === 'done').length;

  // Primary Workspace Context Master Filter Strategy
  const getFilteredTasks = () => {
    let dataset = [...tasks];

    // 1. Sidebar views filtering
    if (currentView === 'category' && activeCategory) {
      return dataset.filter(t => t.category === activeCategory);
    }
    if (currentView === 'client_workspace' && activeClient) {
      const clientObj = CLIENTS.find(c => c.id === activeClient);
      const nameMatch = clientObj ? clientObj.name.toLowerCase() : '';
      return dataset.filter(t => t.subcategory.toLowerCase().includes(nameMatch) || t.category === 'clients');
    }
    if (currentView === 'today') {
      dataset = dataset.filter(t => t.deadline && t.deadline.includes(todayStr()));
    }

    // 2. Clickable Top Metric Dashboard Widget Layer Filters
    if (dashboardFilter === 'today') dataset = dataset.filter(t => t.deadline && t.deadline.includes(todayStr()));
    if (dashboardFilter === 'pending') dataset = dataset.filter(t => t.status === 'pending');
    if (dashboardFilter === 'completed') dataset = dataset.filter(t => t.status === 'done');
    
    return dataset;
  };

  const activeTaskList = getFilteredTasks();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: VISUAL_THEME.bg, overflow: 'hidden', position: 'relative' }}>
      
      {!isMobile && (
        <div style={{ width: '260px', height: '100%', flexShrink: 0 }}>
          <Sidebar currentView={currentView} onViewChange={triggerViewTransition} activeCategory={activeCategory} activeClient={activeClient} taskCounts={{}} userName={session.user.email} onLogout={() => authService.signOut().then(() => setSession(null))} />
        </div>
      )}

      {isMobile && mobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileSidebarOpen(false)} />
          <div style={{ width: '280px', height: '100%', position: 'relative', zIndex: 1000 }}>
            <Sidebar currentView={currentView} onViewChange={triggerViewTransition} activeCategory={activeCategory} activeClient={activeClient} taskCounts={{}} userName={session.user.email} onLogout={() => authService.signOut().then(() => setSession(null))} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ height: '70px', borderBottom: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyBaskets: 'space-between', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 40px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '70%' : 'auto' }}>
            {isMobile && <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer' }}>☰</button>}
            <div style={{ position: 'relative', width: '100%' }}>
              <input type="text" placeholder="Search tasks..." style={{ width: isMobile ? '100%' : '280px', padding: '8px 16px 8px 36px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px' }} />
              <span style={{ position: 'absolute', left: '12px', top: '9px', fontSize: '14px', color: '#94A3B8' }}>🔍</span>
            </div>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
        </div>

        {/* Dynamic Canvas Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '40px' }}>
          
          {/* Universal view shell logic renders canvas content */}
          {['today', 'category', 'client_workspace'].includes(currentView) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '4px' }}>
                  {currentView === 'category' ? `${activeCategory.toUpperCase()} Workspace` : currentView === 'client_workspace' ? 'Client Workspace Board' : 'Good morning, Anukant 👋'}
                </h1>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec }}>{formatIndianDate()}</p>
              </div>

              {/* Dynamic Clickable Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '12px' }}>
                {[
                  { id: 'today', label: 'Today', count: countToday, icon: '📅', bg: '#EEF2FF' },
                  { id: 'pending', label: 'Pending', count: countPending, icon: '⏳', bg: '#FFFBEB' },
                  { id: 'upcoming', label: 'Upcoming', count: 8, icon: '📆', bg: '#EFF6FF' },
                  { id: 'completed', label: 'Completed', count: countCompleted, icon: '✅', bg: '#ECFDF5' },
                  { id: 'all', label: 'Clear Filters', count: tasks.length, icon: '🔄', bg: '#F1F5F9' }
                ].map((stat) => {
                  const isActiveFilter = dashboardFilter === stat.id;
                  return (
                    <div 
                      key={stat.id} 
                      onClick={() => setDashboardFilter(stat.id)}
                      style={{ 
                        padding: '14px', 
                        background: '#FFFFFF', 
                        borderRadius: '12px', 
                        border: isActiveFilter ? `2px solid ${VISUAL_THEME.accent}` : `1px solid ${VISUAL_THEME.border}`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transform: isActiveFilter ? 'scale(1.02)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, display: 'block', marginBottom: '4px' }}>{stat.label}</span>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: VISUAL_THEME.text }}>{stat.count}</span>
                      </div>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{stat.icon}</div>
                    </div>
                  );
                })}
              </div>

              {/* Central Dynamic Context Tasks Array Renderer */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: isMobile ? '16px' : '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '16px' }}>Active Workspace Registry Block</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeTaskList.length > 0 ? (
                    activeTaskList.map(t => (
                      <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                    ))
                  ) : (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: VISUAL_THEME.textSec, fontSize: '13px' }}>No active operational tasks mapped inside this filter viewport template. Click "+ New Task" to inject one.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK VIEWS PLACEHOLDERS */}
          {currentView === 'upcoming' && <div style={{ fontSize: '14px' }}>Upcoming View Matrix Active</div>}
          {currentView === 'calendar' && <div style={{ fontSize: '14px' }}>Calendar Grid Canvas Active</div>}
          {currentView === 'all_tasks' && <div style={{ fontSize: '14px' }}>All Tasks Master Framework Active</div>}
          {currentView === 'ai_planner' && <div style={{ fontSize: '14px' }}>AI Optimizer Schedule Engine Active</div>}
          {currentView === 'recurring' && <div style={{ fontSize: '14px' }}>Recurring Context Rules Active</div>}

        </div>

      </div>

      {showCreateModal && (
        <FormPanel form={{ title: '', description: '', category: 'personal', subcategory: '', priority: 'medium', deadline: '', type: 'one-time' }} onSubmit={handleCreateTask} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
