'use client';

import React, { useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES, CLIENTS, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr, formatIndianDate } from '../utils/dateUtils';
import Sidebar from '../components/Sidebar';
import AuthScreen from '../components/AuthScreen';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { useTasks } from '../hooks/useTasks';

// Sub-views component matrix imports
import ViewToday from '../components/ViewToday';
import ViewCalendar from '../components/ViewCalendar';
import ViewAllTasks from '../components/ViewAllTasks';
import ViewRecurring from '../components/ViewRecurring';
import ViewNotifications from '../components/ViewNotifications';

export default function ModernTaskPlannerOS() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Navigation variables
  const [currentView, setCurrentView] = useState('today'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [dashboardFilter, setDashboardFilter] = useState('all');
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);
  
  // Claude AI Pipeline variables
  const [aiPlanOutput, setAiPlanOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Form AM/PM inputs states
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalCat, setModalCat] = useState('personal');
  const [modalSub, setModalSub] = useState('');
  const [modalPriority, setModalPriority] = useState('medium');
  const [modalDate, setModalDate] = useState(todayStr());
  const [modalHour, setModalHour] = useState('02');
  const [modalMin, setModalMin] = useState('00');
  const [modalPeriod, setModalPeriod] = useState('PM');

  // Real Database integration hook call
  const dummyToast = (msg) => console.log(`[Notification Alert]: ${msg}`);
  const {
    tasks,
    loading: tasksLoading,
    loadTasks,
    handleToggleStatus,
    handleDeleteTask
  } = useTasks(session, dummyToast);

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

  useEffect(() => {
    if (session) { loadTasks(); }
  }, [session, loadTasks]);

  if (authLoading || (session && tasksLoading)) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px', color: '#64748B' }}>Syncing operational data grids...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  // Form submit handler with custom metadata mapping properties
  const handleCreateTaskSubmit = async () => {
    if (!modalTitle.trim()) return;
    const constructedTime = `${modalHour}:${modalMin} ${modalPeriod}`;
    const syntheticFormObj = {
      title: modalTitle,
      description: modalDesc,
      category: modalCat,
      subcategory: modalSub || 'General',
      priority: modalPriority,
      type: 'one-time',
      deadline: modalDate
    };

    try {
      // Direct push to Supabase via taskService layers
      await taskService.createTask(syntheticFormObj, session.user.id);
      // Injected custom time indicator inside description string to save timeline configurations safely
      await supabase.from('tasks').update({ description: modalDesc ? modalDesc + ` (Time: ${constructedTime})` : `Time: ${constructedTime}` }).eq('title', modalTitle);
      await loadTasks();
      setShowCreateModal(false);
      setModalTitle(''); setModalDesc(''); setModalSub('');
    } catch (err) {
      // Direct local state push fallback on local client environments testing rules
      const fallbackTask = { id: 't_local_' + Date.now(), ...syntheticFormObj, status: 'pending', time: constructedTime };
      setTasks(prev => [fallbackTask, ...prev]);
      setShowCreateModal(false);
    }
  };

  const triggerAiPlanCall = async () => {
    setAiLoading(true);
    try {
      const summary = tasks.map(t => `- [${t.priority.toUpperCase()}] ${t.title} (Context: ${t.subcategory})`).join('\n');
      const resPlan = await taskService.fetchAiPlan(summary);
      setAiPlanOutput(resPlan);
    } catch(e) {
      setAiPlanOutput('AI Calibration completed with fallback instructions limits preset parameters.');
    } finally {
      setAiLoading(false);
    }
  };

  // Logic metric indicators tracking calculations
  const countToday = tasks.filter(t => t.deadline === todayStr()).length;
  const countPending = tasks.filter(t => t.status === 'pending').length;
  const countCompleted = tasks.filter(t => t.status === 'done').length;

  const getFilteredTasksList = () => {
    let dataset = [...tasks];
    if (currentView === 'today') dataset = dataset.filter(t => t.deadline === todayStr());
    if (currentView === 'upcoming') dataset = dataset.filter(t => t.deadline > todayStr());
    if (currentView === 'category' && activeCategory) dataset = dataset.filter(t => t.category === activeCategory);
    if (currentView === 'client_workspace' && activeClient) {
      const clientName = CLIENTS.find(c => c.id === activeClient)?.name.toLowerCase() || '';
      dataset = dataset.filter(t => t.subcategory.toLowerCase().includes(clientName));
    }
    if (dashboardFilter === 'today') dataset = dataset.filter(t => t.deadline === todayStr());
    if (dashboardFilter === 'pending') dataset = dataset.filter(t => t.status === 'pending');
    if (dashboardFilter === 'completed') dataset = dataset.filter(t => t.status === 'done');
    return dataset;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: VISUAL_THEME.bg, overflow: 'hidden', position: 'relative' }}>
      
      {(!isMobile || mobileSidebarOpen) && (
        <div style={{ width: '280px', height: '100%', flexShrink: 0, position: isMobile ? 'fixed' : 'relative', zIndex: 9999 }}>
          <Sidebar currentView={currentView} onViewChange={(v, c, cl) => { setCurrentView(v); setActiveCategory(c); setActiveClient(cl); setDashboardFilter('all'); setMobileSidebarOpen(false); }} activeCategory={activeCategory} activeClient={activeClient} userName={session.user.email} onLogout={() => authService.signOut().then(() => setSession(null))} />
        </div>
      )}

      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '70px', borderBottom: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '20px' }}>☰</button>}
            <h1 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'capitalize' }}>{currentView.replace('_', ' ')} Panel</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '32px' }}>
          
          {['today', 'upcoming', 'category', 'client_workspace'].includes(currentView) && (
            <ViewToday tasks={tasks} countToday={countToday} countPending={countPending} countCompleted={countCompleted} dashboardFilter={dashboardFilter} setDashboardFilter={setDashboardFilter} viewableTasksList={getFilteredTasksList()} handleToggleStatus={handleToggleStatus} setInspectedTask={setInspectedTask} handleDeleteTask={handleDeleteTask} isMobile={isMobile} formatIndianDate={formatIndianDate} />
          )}

          {currentView === 'calendar' && <ViewCalendar tasks={tasks} />}
          {currentView === 'all_tasks' && <ViewAllTasks tasks={tasks} />}
          {currentView === 'recurring' && <ViewRecurring tasks={tasks} />}
          {currentView === 'notifications' && <ViewNotifications />}
          
          {currentView === 'manage_categories' && (
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}` }}>
              <h3 style={{ marginBottom: '16px' }}>Workspaces Taxonomy Context System Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {CATEGORIES.map(c => <div key={c.id} style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}` }}>{c.icon} &nbsp; {c.name}</div>)}
              </div>
            </div>
          )}

          {currentView === 'ai_planner' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧠</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Claude AI Plan Optimization Calibration</h3>
              <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>Parse dynamic data layers straight to cloud models to execute routines mapping logs safely.</p>
              <button onClick={triggerAiPlanCall} disabled={aiLoading} style={{ padding: '12px 24px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                {aiLoading ? 'Calibrating Vector Maps...' : '🤖 Run AI Schedule Engine'}
              </button>
              {aiPlanOutput && (
                <div style={{ marginTop: '24px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, textAlign: 'left', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                  {aiPlanOutput}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* FORM MODAL POPUP (AM/PM OPTIMIZED SELECTION ELEMENTS) */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', padding: isMobile ? '0' : '24px', boxSizing: 'border-box' }} onClick={(e) => { if(e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div style={{ background: '#FFFFFF', borderRadius: isMobile ? '24px 24px 0 0' : '20px', padding: '28px 20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Create Task Node</h2><button onClick={() => setShowCreateModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button></div>
            
            <input type="text" placeholder="Task Title *" value={modalTitle} onChange={e => setModalTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
            <textarea placeholder="Description notes details..." value={modalDesc} onChange={e => setModalDesc(e.target.value)} style={{ width: '100%', height: '60px', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', resize: 'none', boxSizing: 'border-box' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select value={modalCat} onChange={e => setModalCat(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <input type="text" placeholder="Client Name / Workspace" value={modalSub} onChange={e => setModalSub(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Milestone Target Reminder (Date & Time)</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} style={{ flex: 2, minWidth: '120px', padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box' }} />
                <select value={modalHour} onChange={e => setModalHour(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', boxSizing: 'border-box' }}>
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select value={modalMin} onChange={e => setModalMin(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', boxSizing: 'border-box' }}>
                  {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={modalPeriod} onChange={e => setModalPeriod(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Priority Flag</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.keys(PRIORITY_CONFIG).map(k => (
                  <button key={k} type="button" onClick={() => setModalPriority(k)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: modalPriority === k ? `2px solid ${PRIORITY_CONFIG[k].color}` : `1px solid ${VISUAL_THEME.border}`, background: modalPriority === k ? PRIORITY_CONFIG[k].bg : '#FFFFFF', color: PRIORITY_CONFIG[k].color, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {PRIORITY_CONFIG[k].icon} {PRIORITY_CONFIG[k].label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '16px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 600 }}>Cancel</button>
              <button type="button" onClick={handleCreateTaskSubmit} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>Save Task Block</button>
            </div>
          </div>
        </div>
      )}

      {inspectedTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.2)' }} onClick={() => setInspectedTask(null)} />
          <div style={{ width: isMobile ? '100vw' : '420px', height: '100%', background: '#FFFFFF', position: 'relative', zIndex: 100000, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '-4px 0 25px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${VISUAL_THEME.border}`, paddingBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: VISUAL_THEME.accent }}>Inspection Meta Log Sheet</span>
              <button onClick={() => setInspectedTask(null)} style={{ border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>{inspectedTask.title}</h3>
              <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, lineHeight: 1.5 }}>{inspectedTask.description || 'No contextual operational descriptors mapped.'}</p>
            </div>
            <button onClick={() => { handleToggleStatus(inspectedTask.id); setInspectedTask(null); }} style={{ marginTop: 'auto', width: '100%', padding: '14px', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Toggle Complete State ✓</button>
          </div>
        </div>
      )}

    </div>
  );
}
