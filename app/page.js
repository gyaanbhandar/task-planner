'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VISUAL_THEME, CATEGORIES, CLIENTS, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr, formatIndianDate } from '../utils/dateUtils';
import Sidebar from '../components/Sidebar';
import AuthScreen from '../components/AuthScreen';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { notificationService } from '../services/notificationService';
import { useTasks } from '../hooks/useTasks';

// Import View Components
import ViewToday from '../components/ViewToday';
import ViewCalendar from '../components/ViewCalendar';
import ViewAllTasks from '../components/ViewAllTasks';
import ViewRecurring from '../components/ViewRecurring';
import ViewNotifications from '../components/ViewNotifications';

// Helper: Convert 12h "02:30 PM" to 24h "14:30" for HTML <input type="time">
const convert12to24 = (time12) => {
  if (!time12) return '09:00';
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '09:00';
  let [_, h, m, p] = match;
  let hour = parseInt(h, 10);
  if (p.toUpperCase() === 'PM' && hour < 12) hour += 12;
  if (p.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${m}`;
};

// Helper: Convert 24h "14:30" to 12h "02:30 PM" for DB & Task Cards
const convert24to12 = (time24) => {
  if (!time24) return '09:00 AM';
  const parts = time24.split(':');
  let hour = parseInt(parts[0], 10);
  const min = parts[1] || '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${min} ${period}`;
};

export default function ModernTaskPlannerOS() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Navigation & View Routing States
  const [currentView, setCurrentView] = useState('today'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [dashboardFilter, setDashboardFilter] = useState('all');
  
  // UI Layout States
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);

  // Time Picker State for Edit Drawer
  const [editTime, setEditTime] = useState('09:00');
  
  // Dynamic Workspace Categories & Clients Management States
  const [customCategories, setCustomCategories] = useState(CATEGORIES);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  
  const [clientsList, setClientsList] = useState(CLIENTS);
  const [newClientName, setNewClientName] = useState('');
  const [editingClient, setEditingClient] = useState(null);

  // AI Engine State
  const [aiPlanOutput, setAiPlanOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Form Input States (Create Modal)
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalCat, setModalCat] = useState('personal');
  const [modalSub, setModalSub] = useState('none'); 
  const [modalPriority, setModalPriority] = useState('medium');
  const [modalDate, setModalDate] = useState(todayStr());
  const [modalTime, setModalTime] = useState('09:00'); // 24h internal state for native clock picker
  const [modalFrequency, setModalFrequency] = useState('one-time');

  const notifiedTasksRef = useRef(new Set());

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

  // Sync Edit Drawer Time when a task is inspected
  const handleSelectInspectedTask = (task) => {
    setInspectedTask(task);
    if (!task) return;
    const initial24h = convert12to24(task.time || '09:00 AM');
    setEditTime(initial24h);
  };

  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  // Clock Loop for Real-time alerts
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const interval = setInterval(() => {
      const isEnabled = localStorage.getItem('app_notifications_enabled') !== 'false';
      if (!isEnabled) return;

      const now = new Date();
      let currentHour = now.getHours();
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const period = currentHour >= 12 ? 'PM' : 'AM';

      currentHour = currentHour % 12;
      currentHour = currentHour ? currentHour : 12;
      const formattedHour = String(currentHour).padStart(2, '0');
      const currentTimeString = `${formattedHour}:${currentMinute} ${period}`;

      tasks.forEach(t => {
        const taskTime = t.time || '';
        if (
          t.status === 'pending' &&
          (t.deadline === todayStr() || t.type === 'daily') &&
          taskTime.toLowerCase() === currentTimeString.toLowerCase()
        ) {
          if (!notifiedTasksRef.current.has(t.id)) {
            notifiedTasksRef.current.add(t.id);
            playChimeSound();
            notificationService.send(`⏰ Task Reminder: ${t.title}`, `${t.time} • ${t.subcategory || 'General'}`);
          }
        }
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [tasks]);

  if (authLoading || (session && tasksLoading)) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px', color: '#64748B' }}>Loading Task Planner...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  const getViewTitle = () => {
    if (currentView === 'today') return "Today's Tasks";
    if (currentView === 'upcoming') return "Upcoming Tasks";
    if (currentView === 'calendar') return "Calendar View";
    if (currentView === 'all_tasks') return "All Tasks";
    if (currentView === 'ai_planner') return "AI Planner";
    if (currentView === 'recurring') return "Recurring Tasks";
    if (currentView === 'manage_categories') return "Manage Categories";
    if (currentView === 'notifications') return "Notifications Center";
    if (currentView === 'category' && activeCategory) {
      const catObj = customCategories.find(c => c.id === activeCategory);
      return catObj ? catObj.name : "Category";
    }
    if (currentView === 'client_workspace' && activeClient) {
      const clientObj = clientsList.find(c => c.id === activeClient);
      return clientObj ? clientObj.name : "Client Workspace";
    }
    return "Task Planner";
  };

  const handleCreateTaskSubmit = async () => {
    if (!modalTitle.trim()) return;
    const formatted12hTime = convert24to12(modalTime);
    let subValue = 'General';
    
    if (modalCat === 'clients' && modalSub !== 'none') {
      const selectedClientObj = clientsList.find(c => c.id === modalSub);
      subValue = selectedClientObj ? selectedClientObj.name : 'General';
    } else if (modalSub !== 'none') {
      subValue = modalSub;
    }

    const formObj = {
      title: modalTitle,
      description: modalDesc.trim(),
      time: formatted12hTime, // Saved explicitly as "02:30 PM"
      category: modalCat,
      subcategory: subValue,
      priority: modalPriority,
      type: modalFrequency,
      deadline: modalDate
    };

    try {
      await taskService.createTask(formObj, session.user.id);
      await loadTasks();
      setShowCreateModal(false);
      setModalTitle(''); setModalDesc(''); setModalSub('none');
    } catch (err) {
      console.error(err);
      alert('Task save nahi hua! Error: ' + (err.message || err));
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

  const executeClientOperation = () => {
    if(!newClientName.trim()) return;
    if(editingClient) {
      setClientsList(prev => prev.map(c => c.id === editingClient ? { ...c, name: newClientName } : c));
      setEditingClient(null);
    } else {
      const uniqueId = 'client_' + Date.now();
      setClientsList(prev => [...prev, { id: uniqueId, name: newClientName }]);
    }
    setNewClientName('');
  };

  const triggerAiPlanCall = async () => {
    setAiLoading(true);
    try {
      const summaryText = tasks.map(t => `- ${t.title} [${t.priority}]`).join('\n');
      const res = await taskService.fetchAiPlan(summaryText);
      setAiPlanOutput(res);
    } catch(e) {
      setAiPlanOutput('AI planner execution completed.');
    } finally {
      setAiLoading(false);
    }
  };

  const getBaseViewTasks = () => {
    let dataset = [...tasks];
    if (currentView === 'today') {
      dataset = dataset.filter(t => 
        t.deadline === todayStr() || 
        t.type === 'daily' || 
        (t.type === 'weekly' && new Date(t.deadline).getDay() === new Date().getDay())
      );
    } else if (currentView === 'upcoming') {
      dataset = dataset.filter(t => 
        t.deadline > todayStr() || 
        t.type === 'weekly' || 
        t.type === 'monthly'
      );
    } else if (currentView === 'category' && activeCategory) {
      if (activeCategory === 'clients') {
        const allClientNames = clientsList.map(c => c.name.toLowerCase());
        dataset = dataset.filter(t => t.category === 'clients' || allClientNames.some(name => t.subcategory.toLowerCase().includes(name)));
      } else {
        dataset = dataset.filter(t => t.category === activeCategory);
      }
    } else if (currentView === 'client_workspace' && activeClient) {
      const targetClientObj = clientsList.find(c => c.id === activeClient);
      const clientName = targetClientObj ? targetClientObj.name.toLowerCase() : '';
      dataset = dataset.filter(t => t.subcategory.toLowerCase().includes(clientName));
    }
    return dataset;
  };

  const baseViewTasks = getBaseViewTasks();

  const countAll = baseViewTasks.length;
  const countToday = baseViewTasks.filter(t => t.deadline === todayStr() || t.type === 'daily').length;
  const countPending = baseViewTasks.filter(t => t.status === 'pending').length;
  const countCompleted = baseViewTasks.filter(t => t.status === 'done').length;

  const getFilteredTasksList = () => {
    let dataset = [...baseViewTasks];
    if (dashboardFilter === 'today') {
      dataset = dataset.filter(t => t.deadline === todayStr() || t.type === 'daily');
    } else if (dashboardFilter === 'pending') {
      dataset = dataset.filter(t => t.status === 'pending');
    } else if (dashboardFilter === 'completed') {
      dataset = dataset.filter(t => t.status === 'done');
    }
    return dataset;
  };

  const activeViewTitle = getViewTitle();

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
            {isMobile && <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>☰</button>}
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>{activeViewTitle}</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {['today', 'upcoming', 'category', 'client_workspace', 'all_tasks'].includes(currentView) && (
            <ViewToday
              tasks={tasks}
              countAll={countAll}
              countToday={countToday}
              countPending={countPending}
              countCompleted={countCompleted}
              dashboardFilter={dashboardFilter}
              setDashboardFilter={setDashboardFilter}
              viewableTasksList={getFilteredTasksList()}
              handleToggleStatus={handleToggleStatus}
              setInspectedTask={handleSelectInspectedTask}
              handleDeleteTask={handleDeleteTask}
              isMobile={isMobile}
              formatIndianDate={formatIndianDate}
              userName={session.user.email}
              viewTitle={activeViewTitle}
            />
          )}

          {currentView === 'calendar' && <ViewCalendar tasks={tasks} setInspectedTask={handleSelectInspectedTask} />}
          {currentView === 'recurring' && <ViewRecurring tasks={tasks} setInspectedTask={handleSelectInspectedTask} handleDeleteTask={handleDeleteTask} />}
          {currentView === 'notifications' && <ViewNotifications setInspectedTask={handleSelectInspectedTask} />}
          
          {currentView === 'manage_categories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box' }}>
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0 }}>Categories Hub</h3>
                <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
                  <input type="text" placeholder={editingCategory ? "Update category name" : "Insert new category"} value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px' }} />
                  <button onClick={executeCategoryOperation} style={{ padding: '10px 16px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{editingCategory ? 'Update' : '+ Add Category'}</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {customCategories.map(c => (
                    <div key={c.id} style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{c.icon} {c.name}</span>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <span onClick={() => { setEditingCategory(c.id); setNewCatName(c.name); }}>✏️</span>
                        <span onClick={() => setCustomCategories(prev => prev.filter(item => item.id !== c.id))} style={{ color: '#EF4444' }}>🗑️</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0 }}>Client List Hub (Sub-categories of Clients)</h3>
                <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
                  <input type="text" placeholder={editingClient ? "Update client name" : "Insert new corporate client"} value={newClientName} onChange={e => setNewClientName(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px' }} />
                  <button onClick={executeClientOperation} style={{ padding: '10px 16px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{editingClient ? 'Update' : '+ Add Client'}</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {clientsList.map(cl => (
                    <div key={cl.id} style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>🏢 {cl.name}</span>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <span onClick={() => { setEditingClient(cl.id); setNewClientName(cl.name); }}>✏️</span>
                        <span onClick={() => setClientsList(prev => prev.filter(item => item.id !== cl.id))} style={{ color: '#EF4444' }}>🗑️</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'ai_planner' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧠</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>AI Schedule Core Engine Calibration</h3>
              <button onClick={triggerAiPlanCall} disabled={aiLoading} style={{ padding: '12px 24px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                {aiLoading ? 'Calibrating...' : '🤖 Run AI Generation'}
              </button>
              {aiPlanOutput && <div style={{ marginTop: '24px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, textAlign: 'left', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{aiPlanOutput}</div>}
            </div>
          )}

        </div>
      </div>

      {/* EDIT TASK DRAWER PANEL */}
      {inspectedTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.2)' }} onClick={() => setInspectedTask(null)} />
          <div style={{ width: isMobile ? '100vw' : '440px', height: '100%', background: '#FFFFFF', position: 'relative', zIndex: 100000, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '-4px 0 25px rgba(0,0,0,0.05)', boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${VISUAL_THEME.border}`, paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: VISUAL_THEME.text }}>Edit Task</h3>
              <button onClick={() => setInspectedTask(null)} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Task Title</label>
                <input type="text" value={inspectedTask.title || ''} onChange={e => setInspectedTask({ ...inspectedTask, title: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Description Notes</label>
                <textarea 
                  placeholder="Add notes..."
                  value={(inspectedTask.description || '').replace(/^(?:Time:\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s*|\s*\(Time:\s*\d{1,2}:\d{2}\s*(?:AM|PM)\)\s*)/gi, '').trim()} 
                  onChange={e => setInspectedTask({ ...inspectedTask, description: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', height: '70px', resize: 'none', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Category</label>
                  <select value={inspectedTask.category || 'personal'} onChange={e => setInspectedTask({ ...inspectedTask, category: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}>
                    {customCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Client / Subcategory</label>
                  <select value={inspectedTask.subcategory || 'General'} onChange={e => setInspectedTask({ ...inspectedTask, subcategory: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="General">General / None</option>
                    {clientsList.map(cl => <option key={cl.id} value={cl.name}>🏢 {cl.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Priority</label>
                  <select value={inspectedTask.priority || 'medium'} onChange={e => setInspectedTask({ ...inspectedTask, priority: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="low">🔹 Low Priority</option>
                    <option value="medium">🔸 Medium Priority</option>
                    <option value="high">🔺 High Priority</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Frequency</label>
                  <select value={inspectedTask.type || 'one-time'} onChange={e => setInspectedTask({ ...inspectedTask, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="one-time">One-Time Task</option>
                    <option value="daily">Daily (Recurring)</option>
                    <option value="weekly">Weekly Routine</option>
                    <option value="monthly">Monthly Audit</option>
                  </select>
                </div>
              </div>

              {/* DATE & TIME (NATIVE TIME PICKER WITH AM/PM IN BROWSER) */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Target Date & Time (12h AM/PM)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="date" value={inspectedTask.deadline || todayStr()} onChange={e => setInspectedTask({ ...inspectedTask, deadline: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }} />
                  <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', paddingTop: '16px', borderTop: `1px solid ${VISUAL_THEME.border}` }}>
              <button onClick={async () => {
                const formattedTime = convert24to12(editTime);
                const updatedObj = {
                  ...inspectedTask,
                  time: formattedTime // Explicit 12h AM/PM string saved
                };
                await taskService.updateTask(inspectedTask.id, updatedObj);
                await loadTasks();
                setInspectedTask(null);
              }} style={{ flex: 1, padding: '12px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
              <button onClick={async () => {
                await handleDeleteTask(inspectedTask.id);
                setInspectedTask(null);
              }} style={{ padding: '12px 18px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', boxSizing: 'border-box' }} onClick={(e) => { if(e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '28px 20px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Create Task</h2><button onClick={() => setShowCreateModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button></div>
            
            <input type="text" placeholder="Task Title *" value={modalTitle} onChange={e => setModalTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
            <textarea placeholder="Description notes details..." value={modalDesc} onChange={e => setModalDesc(e.target.value)} style={{ width: '100%', height: '60px', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', resize: 'none', boxSizing: 'border-box' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Categories</label>
                <select value={modalCat} onChange={e => { setModalCat(e.target.value); if(e.target.value !== 'clients') setModalSub('none'); }} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}>
                  {customCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Assign Client</label>
                <select value={modalSub} onChange={e => setModalSub(e.target.value)} disabled={modalCat !== 'clients'} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: modalCat === 'clients' ? '#F8FAFC' : '#E2E8F0', width: '100%', boxSizing: 'border-box', cursor: modalCat === 'clients' ? 'pointer' : 'not-allowed' }}>
                  <option value="none">General / No Client</option>
                  {clientsList.map(cl => <option key={cl.id} value={cl.id}>🏢 {cl.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Interval Frequency</label>
                <select value={modalFrequency} onChange={e => setModalFrequency(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}>
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

            {/* DATE & TIME (NATIVE TIME PICKER WITH AM/PM IN BROWSER) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Milestone Target Reminder</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box' }} />
                <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '16px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleCreateTaskSubmit} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Task</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
