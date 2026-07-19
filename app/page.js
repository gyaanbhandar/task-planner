'use client';

import React, { useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES, CLIENTS, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr, formatIndianDate } from '../utils/dateUtils';
import Sidebar from '../components/Sidebar';
import AuthScreen from '../components/AuthScreen';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { useTasks } from '../hooks/useTasks';

// Import Views
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
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);
  
  // Categories management workflow properties
  const [customCategories, setCustomCategories] = useState(CATEGORIES);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState('');

  // AI Planner Engine Var
  const [aiPlanOutput, setAiPlanOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Re-Engineered Input Fields Configuration Hooks
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalCat, setModalCat] = useState('personal');
  const [modalSub, setModalSub] = useState('abc'); // Default dynamic client mapping select options
  const [modalPriority, setModalPriority] = useState('medium');
  const [modalDate, setModalDate] = useState(todayStr());
  const [modalHour, setModalHour] = useState('02');
  const [modalMin, setModalMin] = useState('00');
  const [modalPeriod, setModalPeriod] = useState('PM');
  const [modalFrequency, setModalFrequency] = useState('one-time');

  const dummyToast = (msg) => console.log(`[Notification]: ${msg}`);
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

  if (authLoading || (session && tasksLoading)) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px', color: '#64748B' }}>Connecting secure frameworks sync...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  const handleCreateTaskSubmit = async () => {
    if (!modalTitle.trim()) return;
    const constructedTime = `${modalHour}:${modalMin} ${modalPeriod}`;
    const selectedClientObj = CLIENTS.find(c => c.id === modalSub);
    const clientLabel = selectedClientObj ? selectedClientObj.name : 'General';

    const formObj = {
      title: modalTitle,
      description: modalDesc ? modalDesc + ` (Time Marker: ${constructedTime})` : `Time Set: ${constructedTime}`,
      category: modalCat,
      subcategory: clientLabel,
      priority: modalPriority,
      type: modalFrequency, // Dynamic frequency options connected directly
      deadline: modalDate
    };

    try {
      await taskService.createTask(formObj, session.user.id);
      await loadTasks();
      setShowCreateModal(false);
      setModalTitle(''); setModalDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const executeCategoryOperation = () => {
    if(!newCatName.trim()) return;
    if(editingCategory) {
      setCustomCategories(prev => prev.map(c => c.id === editingCategory ? { ...c, name: newCatName } : c));
      setEditingCategory(null);
    } else {
      const uniqueId = 'cat_' + Date.now();
      setCustomCategories(prev => [...prev, { id: uniqueId, name: newCatName, icon: '📂', color: '#6366F1', bg: 'rgba(99,102,241,0.04)' }]);
    }
    setNewCatName('');
  };

  const triggerAiPlanCall = async () => {
    setAiLoading(true);
    try {
      const logSum = tasks.map(t => `- ${t.title} [${t.priority}]`).join('\n');
      const res = await taskService.fetchAiPlan(logSum);
      setAiPlanOutput(res);
    } catch(e) {
      setAiPlanOutput('AI engine execution failure fallback constraints triggers.');
    } finally {
      setAiLoading(false);
    }
  };

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
            <h1 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'capitalize', margin: 0 }}>{currentView.replace('_', ' ')} Panel</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '32px' }}>
          
          {['today', 'upcoming', 'category', 'client_workspace'].includes(currentView) && (
            <ViewToday tasks={tasks} countToday={countToday} countPending={countPending} countCompleted={countCompleted} dashboardFilter={dashboardFilter} setDashboardFilter={setDashboardFilter} viewableTasksList={getFilteredTasksList()} handleToggleStatus={handleToggleStatus} setInspectedTask={setInspectedTask} handleDeleteTask={handleDeleteTask} isMobile={isMobile} formatIndianDate={formatIndianDate} userName={session.user.email} />
          )}

          {currentView === 'calendar' && <ViewCalendar tasks={tasks} setInspectedTask={setInspectedTask} />}
          {currentView === 'all_tasks' && <ViewAllTasks tasks={tasks} setInspectedTask={setInspectedTask} handleDeleteTask={handleDeleteTask} />}
          {currentView === 'recurring' && <ViewRecurring tasks={tasks} setInspectedTask={setInspectedTask} handleDeleteTask={handleDeleteTask} />}
          {currentView === 'notifications' && <ViewNotifications setInspectedTask={setInspectedTask} />}
          
          {currentView === 'manage_categories' && (
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0 }}>Workspaces Category Management Settings Hub</h3>
              <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
                <input type="text" placeholder={editingCategory ? "Update context name" : "Insert new category tag"} value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px' }} />
                <button onClick={executeCategoryOperation} style={{ padding: '10px 16px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{editingCategory ? 'Update' : 'Add Node'}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {customCategories.map(c => (
                  <div key={c.id} style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{c.icon} &nbsp; {c.name}</span>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: VISUAL_THEME.accent, cursor: 'pointer' }}>
                      <span onClick={() => { setEditingCategory(c.id); setNewCatName(c.name); }}>✏️</span>
                      <span onClick={() => setCustomCategories(prev => prev.filter(item => item.id !== c.id))} style={{ color: '#EF4444' }}>🗑️</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'ai_planner' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧠</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>AI Schedule Core Engine Calibration</h3>
              <button onClick={triggerAiPlanCall} disabled={aiLoading} style={{ padding: '12px 24px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                {aiLoading ? 'Calibrating Vector Nodes Matrix...' : '🤖 Run AI Generation'}
              </button>
              {aiPlanOutput && <div style={{ marginTop: '24px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, textAlign: 'left', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{aiPlanOutput}</div>}
            </div>
          )}

        </div>
      </div>

      {/* DETAILED ACTION METADATA PANEL SHEET */}
      {inspectedTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.2)' }} onClick={() => setInspectedTask(null)} />
          <div style={{ width: isMobile ? '100vw' : '420px', height: '100%', background: '#FFFFFF', position: 'relative', zIndex: 100000, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '-4px 0 25px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${VISUAL_THEME.border}`, paddingBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: VISUAL_THEME.accent }}>Modify Operation Parameters Sheet</span>
              <button onClick={() => setInspectedTask(null)} style={{ border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Update Title</label>
              <input type="text" value={inspectedTask.title} onChange={e => setInspectedTask({ ...inspectedTask, title: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC' }} />
              
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Update Description Details</label>
              <textarea value={inspectedTask.description || ''} onChange={e => setInspectedTask({ ...inspectedTask, description: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', height: '80px', resize: 'none' }} />
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
              <button onClick={async () => {
                await taskService.updateTask(inspectedTask.id, inspectedTask);
                await loadTasks();
                setInspectedTask(null);
              }} style={{ flex: 1, padding: '14px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Save Changes Node</button>
              <button onClick={async () => {
                await handleDeleteTask(inspectedTask.id);
                setInspectedTask(null);
              }} style={{ padding: '14px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* FULLY SYNCHRONIZED INTERACTIVE TASK MODAL POPUP */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', padding: isMobile ? '0' : '24px', boxSizing: 'border-box' }} onClick={(e) => { if(e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div style={{ background: '#FFFFFF', borderRadius: isMobile ? '24px 24px 0 0' : '20px', padding: '28px 20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Create Task</h2><button onClick={() => setShowCreateModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button></div>
            
            <input type="text" placeholder="Task Title *" value={modalTitle} onChange={e => setModalTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
            <textarea placeholder="Description notes details..." value={modalDesc} onChange={e => setModalDesc(e.target.value)} style={{ width: '100%', height: '60px', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', resize: 'none', boxSizing: 'border-box' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Category Context</label>
                <select value={modalCat} onChange={e => setModalCat(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}>
                  {customCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Assign Client</label>
                <select value={modalSub} onChange={e => setModalSub(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}>
                  <option value="none">General / No Client</option>
                  {CLIENTS.map(cl => <option key={cl.id} value={cl.id}>🏢 {cl.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Interval Frequency</label>
                <select value={modalFrequency} onChange={e => setModalFrequency(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}>
                  <option value="one-time">One-Time Task</option>
                  <option value="daily">Daily (Recurring)</option>
                  <option value="weekly">Weekly Routine</option>
                  <option value="monthly">Monthly Audit</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Priority Index</label>
                <select value={modalPriority} onChange={e => setModalPriority(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}>
                  <option value="low">🔹 Low Priority</option>
                  <option value="medium">🔸 Medium Priority</option>
                  <option value="high">🔺 High Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Milestone Target Reminder</label>
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

            <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '16px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 600 }}>Cancel</button>
              <button type="button" onClick={handleCreateTaskSubmit} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>Save Task</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
