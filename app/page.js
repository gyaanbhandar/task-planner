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
  
  const [currentView, setCurrentView] = useState('today'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);

  const [tasks, setTasks] = useState([
    { id: 't1', title: 'ek SEO ki resource hire karni hai', category: 'personal', subcategory: 'Personal', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '09:00 AM' },
    { id: 't2', title: 'Data compilation', category: 'professional', subcategory: 'Lead Gen', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '11:00 AM' },
    { id: 't3', title: 'Invoice & Client Tracker', category: 'personal', subcategory: 'Personal', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '02:00 PM' },
    { id: 't4', title: 'Daily Task', category: 'work', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '06:00 PM' },
    { id: 't5', title: 'Australian Data base', category: 'professional', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-18', status: 'pending', time: '07:00 PM' },
    { id: 't6', title: 'Follow Week on Week Tracker for Horizon', category: 'clients', subcategory: 'Horizon Solutions', priority: 'low', deadline: '2026-07-19', status: 'pending', time: '07:30 PM' },
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

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>Initializing Business OS...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  const handleToggleStatus = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (inspectedTask?.id === id) setInspectedTask(null);
  };

  const handleAddTask = (newTaskData) => {
    const createdTask = {
      id: 't_' + Date.now(),
      title: newTaskData.title,
      description: newTaskData.description || '',
      category: newTaskData.category,
      subcategory: newTaskData.subcategory || 'General',
      priority: newTaskData.priority,
      deadline: newTaskData.deadline || todayStr(),
      time: newTaskData.time || '12:00 PM',
      status: 'pending'
    };
    setTasks(prev => [createdTask, ...prev]);
    setShowCreateModal(false);
  };

  const triggerViewTransition = (viewId, catId = null, clientId = null) => {
    setCurrentView(viewId);
    setActiveCategory(catId);
    setActiveClient(clientId);
    setMobileSidebarOpen(false);
  };

  // Filter conditions mapping matrix
  const todayTasks = tasks.filter(t => t.status === 'pending');
  const upcomingTasks = tasks.filter(t => t.deadline && t.deadline > todayStr());
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  // Dynamic category screen mapping filter
  const displayedCategoryTasks = currentView === 'category' ? tasks.filter(t => t.category === activeCategory) : [];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: VISUAL_THEME.bg, overflow: 'hidden' }}>
      
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
        
        <div style={{ height: '70px', borderBottom: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 40px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '70%' : 'auto' }}>
            {isMobile && <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer' }}>☰</button>}
            <input type="text" placeholder="Search workspaces..." style={{ width: '100%', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px' }} />
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '40px' }}>
          
          {currentView === 'today' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Workspace Canvas Dashboard</h1>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec }}>{formatIndianDate()}</p>
              </div>

              {/* Dynamic Interactive Counter Strip Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
                <div onClick={() => triggerViewTransition('today')} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>Today</span>
                  <h3 style={{ fontSize: '20px', margin: '4px 0 0 0' }}>{todayTasks.length} tasks</h3>
                </div>
                <div onClick={() => triggerViewTransition('all_tasks')} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>Pending</span>
                  <h3 style={{ fontSize: '20px', margin: '4px 0 0 0' }}>{tasks.filter(t => t.status !== 'done').length} tasks</h3>
                </div>
                <div onClick={() => triggerViewTransition('upcoming')} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>Upcoming</span>
                  <h3 style={{ fontSize: '20px', margin: '4px 0 0 0' }}>{upcomingTasks.length} tasks</h3>
                </div>
                <div onClick={() => triggerViewTransition('calendar')} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>Completed</span>
                  <h3 style={{ fontSize: '20px', margin: '4px 0 0 0' }}>{completedTasks.length} tasks</h3>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tasks.map(t => (
                    <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN: LIVE CATEGORIES MATRIX DISPLAY ROUTER SECTION     */}
          {/* ========================================================= */}
          {currentView === 'category' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: `1px solid ${VISUAL_THEME.border}`, paddingBottom: '16px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, textTransform: 'capitalize' }}>
                  📂 {CATEGORIES.find(c => c.id === activeCategory)?.name || 'Custom'} Category Workspace
                </h1>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, marginTop: '4px' }}>
                  Viewing all active and localized roadmap items assigned to this bracket.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayedCategoryTasks.length > 0 ? (
                  displayedCategoryTasks.map(t => (
                    <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                  ))
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, color: VISUAL_THEME.textSec, fontSize: '13px' }}>
                    📭 Is category mein koi tasks nahi hain. "+ New Task" par click karke add karein!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback route handles for other secondary tabs */}
          {currentView === 'upcoming' && <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{upcomingTasks.map(t => <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />)}</div>}
          {currentView === 'all_tasks' && <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{tasks.map(t => <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />)}</div>}

        </div>
      </div>

      {showCreateModal && (
        <FormPanel form={{ title: '', description: '', category: 'personal', subcategory: '', priority: 'medium', deadline: todayStr(), time: '02:00 PM', type: 'one-time' }} onSubmit={handleAddTask} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
