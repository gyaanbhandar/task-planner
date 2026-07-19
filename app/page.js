'use client';

import React, { useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES, CLIENTS, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr, formatIndianDate } from '../utils/dateUtils';
import Sidebar from '../components/Sidebar';
import FormPanel from '../components/FormPanel';
import AuthScreen from '../components/AuthScreen';
import { authService } from '../services/authService';

// Import New Clean Screen Component Matrix
import ViewToday from '../components/ViewToday';
import ViewCalendar from '../components/ViewCalendar';
import ViewAllTasks from '../components/ViewAllTasks';
import ViewRecurring from '../components/ViewRecurring';
import ViewNotifications from '../components/ViewNotifications';

export default function ModernTaskPlannerOS() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState('today'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [dashboardFilter, setDashboardFilter] = useState('all');
  const [clientsExpanded, setClientsExpanded] = useState(true);
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);

  // Time-picker states
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalCat, setModalCat] = useState('personal');
  const [modalSub, setModalSub] = useState('');
  const [modalPriority, setModalPriority] = useState('medium');
  const [modalDate, setModalDate] = useState(todayStr());
  const [modalHour, setModalHour] = useState('02');
  const [modalMin, setModalMin] = useState('00');
  const [modalPeriod, setModalPeriod] = useState('PM');

  const [tasks, setTasks] = useState([
    { id: 't1', title: 'ek SEO ki resource hire karni hai', category: 'personal', subcategory: 'Personal', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '09:00 AM' },
    { id: 't2', title: 'Data compilation for corporate leads', category: 'professional', subcategory: 'Lead Gen', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '11:00 AM' },
    { id: 't3', title: 'Invoice & Client Tracker updates', category: 'finance', subcategory: 'ABC', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '02:00 PM' },
    { id: 't4', title: 'Daily Lead generation operations review', category: 'work', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '06:00 PM' },
    { id: 't5', title: 'Australian Data base scraping protocols', category: 'learning', subcategory: 'YUN', priority: 'medium', deadline: '2026-07-20', status: 'pending', time: '07:00 PM' },
    { id: 't6', title: 'Follow Week on Week Tracker for Horizon', category: 'clients', subcategory: 'Horizon Solutions', priority: 'low', deadline: '2026-07-22', status: 'pending', time: '07:30 PM' },
  ]);

  const [notifications] = useState([
    { id: 1, tag: 'OVERDUE ALERT', msg: 'Scraping protocol setup execution delayed past targeted schedule limits.', type: 'danger', time: 'Yesterday' },
    { id: 2, tag: 'AI OPTIMIZATION', msg: 'Shift resource management window blocks to morning intervals.', type: 'intelligence', time: '10 mins ago' }
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

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px' }}>Initializing Business OS...</div>;
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
    setModalTitle(''); setModalDesc(''); setModalSub('');
  };

  const countToday = tasks.filter(t => t.deadline === todayStr()).length;
  const countPending = tasks.filter(t => t.status === 'pending').length;
  const countCompleted = tasks.filter(t => t.status === 'done').length;

  const getFilteredTasks = () => {
    let output = [...tasks];
    if (currentView === 'today') output = output.filter(t => t.deadline === todayStr());
    if (currentView === 'upcoming') output = output.filter(t => t.deadline > todayStr());
    if (currentView === 'category' && activeCategory) output = output.filter(t => t.category === activeCategory);
    if (currentView === 'client_workspace' && activeClient) {
      const targetName = CLIENTS.find(c => c.id === activeClient)?.name.toLowerCase() || '';
      output = output.filter(t => t.subcategory.toLowerCase().includes(targetName));
    }
    if (dashboardFilter === 'today') output = output.filter(t => t.deadline === todayStr());
    if (dashboardFilter === 'pending') output = output.filter(t => t.status === 'pending');
    if (dashboardFilter === 'completed') output = output.filter(t => t.status === 'done');
    return output;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: VISUAL_THEME.bg, overflow: 'hidden', position: 'relative' }}>
      
      {(!isMobile || mobileSidebarOpen) && (
        <div style={{ width: '280px', height: '100%', flexShrink: 0, position: isMobile ? 'fixed' : 'relative', zIndex: 9999 }}>
          <Sidebar currentView={currentView} onViewChange={(v, c, cl) => { setCurrentView(v); setActiveCategory(c); setActiveClient(cl); setDashboardFilter('all'); setMobileSidebarOpen(false); }} activeCategory={activeCategory} activeClient={activeClient} taskCounts={{}} userName={session.user.email} onLogout={() => authService.signOut()} />
        </div>
      )}

      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '70px', borderBottom: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '20px' }}>☰</button>}
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: VISUAL_THEME.text, textTransform: 'capitalize' }}>{currentView.replace('_', ' ')} Pane</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '32px' }}>
          
          {/* Render Screens Based on Refactored Routing Engine */}
          {['today', 'upcoming', 'category', 'client_workspace'].includes(currentView) && (
            <ViewToday tasks={tasks} countToday={countToday} countPending={countPending} countCompleted={countCompleted} dashboardFilter={dashboardFilter} setDashboardFilter={setDashboardFilter} viewableTasksList={getFilteredTasks()} handleToggleStatus={handleToggleStatus} setInspectedTask={setInspectedTask} handleDeleteTask={handleDeleteTask} isMobile={isMobile} formatIndianDate={formatIndianDate} />
          )}

          {currentView === 'calendar' && <ViewCalendar tasks={tasks} />}
          {currentView === 'all_tasks' && <ViewAllTasks tasks={tasks} />}
          {currentView === 'recurring' && <ViewRecurring tasks={tasks} />}
          {currentView === 'manage_categories' && <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}` }}><h3>Categories Workspace Config Nodes Active</h3></div>}
          {currentView === 'notifications' && <ViewNotifications notifications={notifications} />}

        </div>
      </div>

      {/* AM/PM Popup Task Creation Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', padding: isMobile ? '0' : '24px', boxSizing: 'border-box' }} onClick={(e) => { if(e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div style={{ background: '#FFFFFF', borderRadius: isMobile ? '24px 24px 0 0' : '20px', padding: '28px 20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontSize: '18px', fontWeight: 700 }}>Create Task Node</h2><button onClick={() => setShowCreateModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px' }}>✕</button></div>
            <input type="text" placeholder="Task Title *" value={modalTitle} onChange={e => setModalTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px' }} />
            <textarea placeholder="Description" value={modalDesc} onChange={e => setModalDesc(e.target.value)} style={{ width: '100%', height: '60px', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, resize: 'none' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select value={modalCat} onChange={e => setModalCat(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}` }}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
              <input type="text" placeholder="Client Name / Subcategory" value={modalSub} onChange={e => setModalSub(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}` }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Target Schedule (Date & Time)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} style={{ flex: 2, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}` }} />
                <select value={modalHour} onChange={e => setModalHour(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}` }}>{['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => <option key={h} value={h}>{h}</option>)}</select>
                <select value={modalMin} onChange={e => setModalMin(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}` }}>{['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}</select>
                <select value={modalPeriod} onChange={e => setModalPeriod(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFF', fontWeight: 'bold' }}><option value="AM">AM</option><option value="PM">PM</option></select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '16px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFF' }}>Cancel</button>
              <button onClick={handleCreateTaskSubmit} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFF', fontWeight: 600 }}>Save Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
