'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VISUAL_THEME, CATEGORIES, PRIORITY_CONFIG } from '../../constants/taskConstants';
import { todayStr, formatIndianDate } from '../../utils/dateUtils';
import Sidebar from '../../components/Sidebar';
import AuthScreen from '../../components/AuthScreen';
import IconPicker from '../../components/IconPicker';
import { authService } from '../../services/authService';
import { taskService } from '../../services/taskService';
import { notificationService } from '../../services/notificationService';
import { subscriptionService, PLAN_LIMITS } from '../../services/subscriptionService';
import { useTasks } from '../../hooks/useTasks';

import ViewToday from '../../components/ViewToday';
import ViewCalendar from '../../components/ViewCalendar';
import ViewAllTasks from '../../components/ViewAllTasks';
import ViewRecurring from '../../components/ViewRecurring';
import ViewSettings from '../../components/ViewSettings';
import ViewTrash from '../../components/ViewTrash';
import RichTextEditor from '../../components/RichTextEditor';

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

// Generate 15-min interval time options for desktop dropdown
const TIME_OPTIONS_15 = (() => {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      let dh = h % 12; if (dh === 0) dh = 12;
      const period = h >= 12 ? 'PM' : 'AM';
      const label = `${dh}:${String(m).padStart(2, '0')} ${period}`;
      opts.push({ value: val, label });
    }
  }
  return opts;
})();

export default function AnuTaskOS() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState('today'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [dashboardFilter, setDashboardFilter] = useState('today');
  const [sortBy, setSortBy] = useState('manual');
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);
  const [editTime, setEditTime] = useState('09:00');
  const [viewDetailTask, setViewDetailTask] = useState(null);
  
  const [customCategories, setCustomCategories] = useState(CATEGORIES);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📂');
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const [clientsList, setClientsList] = useState([]);
  const [newClientName, setNewClientName] = useState('');
  const [editingClient, setEditingClient] = useState(null);

  const [aiPlanOutput, setAiPlanOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [notifPopupTask, setNotifPopupTask] = useState(null);

  // Subscription & Profile state
  const [userProfile, setUserProfile] = useState(null);
  const [aiUsageInfo, setAiUsageInfo] = useState({ used: 0, limit: 10 });
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);

  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalCat, setModalCat] = useState('personal');
  const [modalSub, setModalSub] = useState('none'); 
  const [modalPriority, setModalPriority] = useState('medium');
  const [modalDate, setModalDate] = useState(todayStr());
  const [modalTime, setModalTime] = useState('09:00');
  const [modalFrequency, setModalFrequency] = useState('one-time');

  const notifiedTasksRef = useRef(new Set());

  // Toast notification state
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const {
    tasks, trashedTasks, loading: tasksLoading, loadTasks, loadTrashedTasks,
    handleToggleStatus, handleDeleteTask, handleRestoreTask, handlePermanentDelete,
    handleEmptyTrash, handleAutoCleanTrash, handleReorderTasks, handleImportTasks
  } = useTasks(session, showToast);

  // Get user's actual full name
  const userFullName = session?.user?.user_metadata?.full_name || '';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    authService.getSession().then(s => { setSession(s); setAuthLoading(false); });
    const sub = authService.onAuthStateChange(s => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadTasks();
  }, [session, loadTasks]);

  // Load trashed tasks on login, then auto-clean only tasks trashed 15+ days ago
  useEffect(() => {
    if (!session) return;
    const initTrash = async () => {
      try {
        await loadTrashedTasks();
        // Auto-clean runs AFTER loading — only removes tasks trashed > 15 days ago
        await handleAutoCleanTrash();
      } catch (err) {
        console.error('Trash init failed:', err);
      }
    };
    initTrash();
  }, [session, loadTrashedTasks]);

  // Setup profile + load subscription data on login
  useEffect(() => {
    if (!session?.user) return;
    const setupProfile = async () => {
      try {
        // Call setup-profile API to ensure profile + default client exist
        const res = await fetch('/api/setup-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || ''
          })
        });
        await res.json();

        // Load profile from DB
        const profile = await subscriptionService.getUserProfile(session.user.id);
        setUserProfile(profile);

        // Load AI usage
        const usage = await subscriptionService.checkAiUsage(session.user.id, profile);
        setAiUsageInfo({ used: usage.used, limit: usage.limit });

        // Load user's clients from DB
        const dbClients = await subscriptionService.getUserClients(session.user.id);
        if (dbClients && dbClients.length > 0) {
          setClientsList(dbClients.map(c => ({ id: c.id, name: c.name, db_id: c.id })));
        } else {
          // No clients in DB — keep empty, user will see Demo Client 01 after setup-profile creates it
          // Retry load once after a short delay (setup-profile might still be running)
          setTimeout(async () => {
            try {
              const retry = await subscriptionService.getUserClients(session.user.id);
              if (retry && retry.length > 0) {
                setClientsList(retry.map(c => ({ id: c.id, name: c.name, db_id: c.id })));
              }
            } catch(e) {}
          }, 2000);
        }
      } catch (e) {
        console.error('Profile setup error:', e);
      }
    };
    setupProfile();
  }, [session]);

  // Request notification permission on app load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleSelectInspectedTask = (task) => {
    setInspectedTask(task);
    if (!task) return;
    setEditTime(convert12to24(task.time || '09:00 AM'));
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
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    const interval = setInterval(() => {
      const isEnabled = localStorage.getItem('notifications_enabled') !== 'false';
      if (!isEnabled) return;
      const now = new Date();
      let currentHour = now.getHours();
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const period = currentHour >= 12 ? 'PM' : 'AM';
      currentHour = currentHour % 12 || 12;
      const currentTimeString = `${String(currentHour).padStart(2, '0')}:${currentMinute} ${period}`;
      tasks.forEach(t => {
        if (t.status === 'pending' && (t.deadline === todayStr() || t.type === 'daily')) {
          const taskTime = (t.time || '').trim().toUpperCase();
          const nowTime = currentTimeString.toUpperCase();
          if (taskTime === nowTime && !notifiedTasksRef.current.has(t.id)) {
            notifiedTasksRef.current.add(t.id);
            playChimeSound();
            // Send Windows/Mac notification — request permission if needed
            if ('Notification' in window) {
              const sendNotif = () => {
                if (Notification.permission === 'granted') {
                  try {
                    new Notification('⏰ AnuTask Reminder', {
                      body: `${t.title}\n${t.time} • ${t.subcategory || 'General'}`,
                      tag: `task-${t.id}`,
                      requireInteraction: true,
                      silent: false
                    });
                  } catch(e) { console.log('Notification error:', e); }
                }
              };
              if (Notification.permission === 'granted') {
                sendNotif();
              } else if (Notification.permission === 'default') {
                Notification.requestPermission().then(p => { if (p === 'granted') sendNotif(); });
              }
            }
            notificationService.send(`⏰ Task Reminder: ${t.title}`, `${t.time} • ${t.subcategory || 'General'}`);
            // Show in-app detail popup
            setNotifPopupTask({ ...t });
          }
        }
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [tasks]);

  if (authLoading || (session && tasksLoading)) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px', color: '#64748B' }}>Loading AnuTask...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  const getViewTitle = () => {
    if (currentView === 'today') return "Today's Tasks";
    if (currentView === 'upcoming') return "Upcoming Tasks";
    if (currentView === 'calendar') return "Calendar View";
    if (currentView === 'all_tasks') return "All Tasks";
    if (currentView === 'ai_planner') return "AI Planner";
    if (currentView === 'recurring') return "Recurring Tasks";
    if (currentView === 'manage_categories') return "Manage Categories";
    if (currentView === 'trash') return "Trash Bin";
    if (currentView === 'settings') return "Settings";
    if (currentView === 'category' && activeCategory) {
      const catObj = customCategories.find(c => c.id === activeCategory);
      return catObj ? catObj.name : "Category";
    }
    if (currentView === 'client_workspace' && activeClient) {
      const clientObj = clientsList.find(c => c.id === activeClient);
      return clientObj ? clientObj.name : "Client Workspace";
    }
    return "AnuTask";
  };

  const handleCreateTaskSubmit = async () => {
    if (!modalTitle.trim()) return;
    const formatted12hTime = convert24to12(modalTime);
    let subValue = 'General';
    if (modalCat === 'clients' && modalSub !== 'none') {
      const cl = clientsList.find(c => c.id === modalSub);
      subValue = cl ? cl.name : 'General';
    } else if (modalSub !== 'none') subValue = modalSub;
    try {
      await taskService.createTask({ title: modalTitle, description: modalDesc.trim(), time: formatted12hTime, category: modalCat, subcategory: subValue, priority: modalPriority, type: modalFrequency, deadline: modalDate }, session.user.id);
      await loadTasks();
      setShowCreateModal(false); setModalTitle(''); setModalDesc(''); setModalSub('none');
    } catch (err) { alert('Error: ' + (err.message || err)); }
  };

  const executeCategoryOperation = () => {
    if (!newCatName.trim()) return;
    if (editingCategory) {
      setCustomCategories(prev => prev.map(c => c.id === editingCategory ? { ...c, name: newCatName, icon: newCatIcon } : c));
      setEditingCategory(null);
    } else {
      setCustomCategories(prev => [...prev, { id: 'cat_' + Date.now(), name: newCatName, icon: newCatIcon, color: '#6366F1', bg: 'rgba(99,102,241,0.04)' }]);
    }
    setNewCatName(''); setNewCatIcon('📂');
  };

  const executeClientOperation = async () => {
    if (!newClientName.trim()) return;
    try {
      if (editingClient) {
        // Update in DB
        await subscriptionService.updateClient(editingClient, session.user.id, newClientName);
        setClientsList(prev => prev.map(c => c.id === editingClient ? { ...c, name: newClientName } : c));
        setEditingClient(null);
      } else {
        // Add to DB
        const newClient = await subscriptionService.addClient(session.user.id, newClientName);
        if (newClient) {
          setClientsList(prev => [...prev, { id: newClient.id, name: newClient.name, db_id: newClient.id }]);
        }
      }
    } catch (e) {
      console.error('Client operation error:', e);
      alert('Error: ' + (e.message || 'Client save failed'));
    }
    setNewClientName('');
  };

  const triggerAiPlanCall = async () => {
    setAiLoading(true);
    try {
      const result = await taskService.fetchAiPlan(
        tasks.filter(t => t.status === 'pending').map(t => `- ${t.title} [${t.priority}] (${t.deadline || 'no date'})`).join('\n'),
        session.user.id
      );
      setAiPlanOutput(result.plan);
      // Refresh usage info
      if (userProfile) {
        const usage = await subscriptionService.checkAiUsage(session.user.id, userProfile);
        setAiUsageInfo({ used: usage.used, limit: usage.limit });
      }
    } catch(e) { setAiPlanOutput('AI planner error.'); }
    setAiLoading(false);
  };

  const getBaseViewTasks = () => {
    let d = [...tasks];
    if (currentView === 'today') d = d.filter(t => t.deadline === todayStr() || t.type === 'daily' || (t.type === 'weekly' && new Date(t.deadline).getDay() === new Date().getDay()));
    else if (currentView === 'upcoming') d = d.filter(t => t.deadline > todayStr() || t.type === 'weekly' || t.type === 'monthly');
    else if (currentView === 'category' && activeCategory) {
      if (activeCategory === 'clients') { const cn = clientsList.map(c => c.name.toLowerCase()); d = d.filter(t => t.category === 'clients' || cn.some(n => (t.subcategory||'').toLowerCase().includes(n))); }
      else d = d.filter(t => t.category === activeCategory);
    } else if (currentView === 'client_workspace' && activeClient) {
      const obj = clientsList.find(c => c.id === activeClient);
      const cn = obj ? obj.name.toLowerCase() : '';
      d = d.filter(t => (t.subcategory||'').toLowerCase().includes(cn));
    }
    return d;
  };

  const base = getBaseViewTasks();
  const countAll = base.length;
  const countToday = base.filter(t => t.deadline === todayStr() || t.type === 'daily').length;
  const countPending = base.filter(t => t.status === 'pending').length;
  const countCompleted = base.filter(t => t.status === 'done').length;

  const applySorting = (d) => {
    if (sortBy === 'manual') return d;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...d];
    switch (sortBy) {
      case 'date_asc':
        return sorted.sort((a, b) => (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31'));
      case 'date_desc':
        return sorted.sort((a, b) => (b.deadline || '0000-01-01').localeCompare(a.deadline || '0000-01-01'));
      case 'priority':
        return sorted.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
      case 'created_newest':
        return sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      case 'created_oldest':
        return sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      case 'category':
        return sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      case 'time':
        return sorted.sort((a, b) => {
          const toMin = (t) => { if (!t) return 999; const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return 999; let h = parseInt(m[1]); if (m[3].toUpperCase() === 'PM' && h < 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return h * 60 + parseInt(m[2]); };
          return toMin(a.time) - toMin(b.time);
        });
      default:
        return sorted;
    }
  };

  const getFilteredTasksList = () => {
    let d = [...base];
    if (dashboardFilter === 'today') d = d.filter(t => t.deadline === todayStr() || t.type === 'daily');
    else if (dashboardFilter === 'pending') d = d.filter(t => t.status === 'pending');
    else if (dashboardFilter === 'completed') d = d.filter(t => t.status === 'done');
    return applySorting(d);
  };

  const activeViewTitle = getViewTitle();

  const handleViewChange = (v, c, cl) => {
    setCurrentView(v); setActiveCategory(c); setActiveClient(cl);
    setDashboardFilter('today');
    setSortBy('manual');
    setMobileSidebarOpen(false);
    if (v === 'trash') loadTrashedTasks();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: VISUAL_THEME.bg, overflow: 'hidden', position: 'relative' }}>
      
      {/* Mobile overlay */}
      {isMobile && mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9998 }} />
      )}

      {(!isMobile || mobileSidebarOpen) && (
        <div style={{ width: '280px', height: '100%', flexShrink: 0, position: isMobile ? 'fixed' : 'relative', zIndex: 9999 }}>
          <Sidebar
            currentView={currentView}
            onViewChange={handleViewChange}
            activeCategory={activeCategory}
            activeClient={activeClient}
            userName={session.user.email}
            userFullName={userProfile?.full_name || userFullName}
            onLogout={() => authService.signOut().then(() => setSession(null))}
            customCategories={customCategories}
            clientsList={clientsList}
            userProfile={userProfile}
            trashCount={trashedTasks.length}
          />
        </div>
      )}

      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ height: '70px', borderBottom: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>☰</button>}
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>{activeViewTitle}</h1>
          </div>
          {!['settings', 'trash'].includes(currentView) && (
            <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? '16px' : '32px' }}>
          
          {/* Trial Countdown Banner */}
          {userProfile && userProfile.subscription_plan === 'free_trial' && !trialBannerDismissed && (() => {
            const daysLeft = subscriptionService.getTrialDaysLeft(userProfile);
            const isExpired = subscriptionService.isTrialExpired(userProfile);
            if (isExpired) return (
              <div style={{ background: 'linear-gradient(135deg, #FEE2E2, #FECACA)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>Your Pro Trial has expired — Upgrade now to continue using all features.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => { setCurrentView('settings'); }} style={{ padding: '6px 14px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Upgrade Now</button>
                  <button onClick={() => setTrialBannerDismissed(true)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
              </div>
            );
            if (daysLeft <= 7) return (
              <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #C7D2FE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>⏳</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#4338CA' }}>Your Pro Trial ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''} — Unlock lifetime productivity for just ₹99/mo.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => { setCurrentView('settings'); }} style={{ padding: '6px 14px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Choose Plan</button>
                  <button onClick={() => setTrialBannerDismissed(true)} style={{ background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
              </div>
            );
            return null;
          })()}

          {['today', 'upcoming', 'category', 'client_workspace', 'all_tasks'].includes(currentView) && (
            <ViewToday tasks={tasks} countAll={countAll} countToday={countToday} countPending={countPending} countCompleted={countCompleted} dashboardFilter={dashboardFilter} setDashboardFilter={setDashboardFilter} viewableTasksList={getFilteredTasksList()} handleToggleStatus={handleToggleStatus} setInspectedTask={setViewDetailTask} onEdit={handleSelectInspectedTask} handleDeleteTask={handleDeleteTask} handleReorderTasks={handleReorderTasks} isMobile={isMobile} formatIndianDate={formatIndianDate} userName={session.user.email} userFullName={userProfile?.full_name || userFullName} viewTitle={activeViewTitle} userProfile={userProfile} onImportTasks={handleImportTasks} sortBy={sortBy} setSortBy={setSortBy} />


          )}

          {currentView === 'calendar' && <ViewCalendar tasks={tasks} setInspectedTask={handleSelectInspectedTask} />}
          {currentView === 'recurring' && <ViewRecurring tasks={tasks} setInspectedTask={handleSelectInspectedTask} onViewDetail={setViewDetailTask} handleDeleteTask={handleDeleteTask} isMobile={isMobile} sortBy={sortBy} setSortBy={setSortBy} />}
          {currentView === 'trash' && <ViewTrash trashedTasks={trashedTasks} onRestore={handleRestoreTask} onPermanentDelete={handlePermanentDelete} onEmptyTrash={handleEmptyTrash} isMobile={isMobile} />}
          {currentView === 'settings' && <ViewSettings session={session} userProfile={userProfile} onProfileUpdate={setUserProfile} />}
          
          {currentView === 'manage_categories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0 }}>Categories Hub</h3>
                <div style={{ display: 'flex', gap: '10px', maxWidth: '500px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Icon</label>
                    <button onClick={() => setShowIconPicker(!showIconPicker)} style={{ width: '44px', height: '44px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{newCatIcon}</button>
                    {showIconPicker && <IconPicker selectedIcon={newCatIcon} onSelect={icon => setNewCatIcon(icon)} onClose={() => setShowIconPicker(false)} />}
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Name</label>
                    <input type="text" placeholder={editingCategory ? "Update name" : "New category"} value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={executeCategoryOperation} style={{ padding: '10px 16px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, height: '44px' }}>{editingCategory ? 'Update' : '+ Add'}</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {customCategories.map(c => (
                    <div key={c.id} style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{c.icon} {c.name}</span>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <span onClick={() => { setEditingCategory(c.id); setNewCatName(c.name); setNewCatIcon(c.icon); }}>✏️</span>
                        <span onClick={() => setCustomCategories(prev => prev.filter(item => item.id !== c.id))} style={{ color: '#EF4444' }}>🗑️</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0 }}>Client List Hub</h3>
                <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
                  <input type="text" placeholder={editingClient ? "Update client" : "New client name"} value={newClientName} onChange={e => setNewClientName(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px' }} />
                  <button onClick={executeClientOperation} style={{ padding: '10px 16px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{editingClient ? 'Update' : '+ Add'}</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {clientsList.map(cl => (
                    <div key={cl.id} style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>🏢 {cl.name}</span>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <span onClick={() => { setEditingClient(cl.id); setNewClientName(cl.name); }}>✏️</span>
                        <span onClick={async () => { try { await subscriptionService.deleteClient(cl.id, session.user.id); } catch(e) {} setClientsList(prev => prev.filter(item => item.id !== cl.id)); }} style={{ color: '#EF4444' }}>🗑️</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'ai_planner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧠</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>AI Schedule Engine</h3>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: '0 0 8px 0' }}>Claude AI se aaj ka smart schedule banwao</p>
                
                {/* Usage Counter */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '16px' }}>
                  <span>⚡</span>
                  <span>{aiUsageInfo.used}/{aiUsageInfo.limit} prompts used</span>
                  {userProfile && <span style={{ color: VISUAL_THEME.accent }}>({userProfile.subscription_plan === 'free_trial' ? 'Trial' : userProfile.subscription_plan === 'starter' ? 'Starter' : 'Pro'})</span>}
                </div>

                <div>
                  <button onClick={triggerAiPlanCall} disabled={aiLoading} style={{ padding: '12px 28px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: aiLoading ? 'wait' : 'pointer', fontSize: '14px', opacity: aiLoading ? 0.7 : 1 }}>
                    {aiLoading ? '⏳ Analyzing your tasks...' : '🤖 Run AI Generation'}
                  </button>
                </div>

                {/* Progress Bar */}
                {aiUsageInfo.limit > 0 && (
                  <div style={{ maxWidth: '300px', margin: '16px auto 0' }}>
                    <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (aiUsageInfo.used / aiUsageInfo.limit) * 100)}%`, background: aiUsageInfo.used >= aiUsageInfo.limit ? '#EF4444' : VISUAL_THEME.accent, borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}
              </div>

              {aiPlanOutput && (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: VISUAL_THEME.text }}>📋 AI Generated Plan</h4>
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#334155' }}>{aiPlanOutput}</div>
                </div>
              )}

              {/* How it works info */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0' }}>💡 Kaise kaam karta hai?</h4>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.8 }}>
                  <p style={{ margin: '0 0 8px 0' }}>• AI aapke <strong>pending tasks</strong>, unki <strong>priority</strong> aur <strong>deadlines</strong> analyze karta hai.</p>
                  <p style={{ margin: '0 0 8px 0' }}>• Fir aaj ke liye <strong>top 3-5 tasks</strong> suggest karta hai with reasoning.</p>
                  <p style={{ margin: '0 0 8px 0' }}>• Low priority tasks ko <strong>skip/postpone</strong> karne ka suggestion deta hai.</p>
                  <p style={{ margin: 0 }}>• Monthly prompt limits: Trial = 10, Starter = 15, Pro = 75 prompts.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW TASK DETAILS PANEL (Read-Only) */}
      {viewDetailTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.2)' }} onClick={() => setViewDetailTask(null)} />
          <div style={{ width: isMobile ? '100vw' : '440px', height: '100%', background: '#FFFFFF', position: 'relative', zIndex: 100000, padding: '28px 24px', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 25px rgba(0,0,0,0.05)', boxSizing: 'border-box', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: VISUAL_THEME.text }}>Task Details</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => { handleSelectInspectedTask(viewDetailTask); setViewDetailTask(null); }} style={{ width: '38px', height: '38px', border: `1.5px solid ${VISUAL_THEME.accent}`, background: '#FFFFFF', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: VISUAL_THEME.accent }} title="Edit Task">✏️</button>
                <button onClick={() => setViewDetailTask(null)} style={{ width: '38px', height: '38px', border: 'none', background: '#F1F5F9', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>✕</button>
              </div>
            </div>

            {/* Title */}
            <div style={{ fontSize: '20px', fontWeight: 700, color: VISUAL_THEME.text, lineHeight: 1.4, marginBottom: '8px', wordBreak: 'break-word' }}>{viewDetailTask.title}</div>

            {/* Description - renders HTML with clickable links */}
            <div style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.8, marginBottom: '28px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {(() => {
                const desc = viewDetailTask.description || 'No description';
                // Check if description contains HTML tags
                if (/<[a-z][\s\S]*>/i.test(desc)) {
                  return <div dangerouslySetInnerHTML={{ __html: desc }} style={{ lineHeight: 1.8 }} />;
                }
                // Fallback: plain text with auto-linked URLs
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const parts = desc.split(urlRegex);
                return parts.map((part, i) => urlRegex.test(part) 
                  ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: VISUAL_THEME.accent, textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</a> 
                  : part
                );
              })()}
            </div>
            <style dangerouslySetInnerHTML={{__html: `
              .view-detail-desc a { color: ${VISUAL_THEME.accent}; text-decoration: underline; word-break: break-all; }
              .view-detail-desc ul, .view-detail-desc ol { margin: 4px 0; padding-left: 20px; }
              .view-detail-desc li { margin: 2px 0; }
            `}} />

            {/* Detail Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              {/* Category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{(() => { const c = customCategories.find(cat => cat.id === viewDetailTask.category); return c ? c.icon : '📂'; })()}</span>
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, width: '90px', flexShrink: 0 }}>Category</span>
                <span style={{ fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px', background: (() => { const c = customCategories.find(cat => cat.id === viewDetailTask.category); return c ? c.bg : '#EEF2FF'; })(), color: (() => { const c = customCategories.find(cat => cat.id === viewDetailTask.category); return c ? c.color : VISUAL_THEME.accent; })() }}>{(() => { const c = customCategories.find(cat => cat.id === viewDetailTask.category); return c ? c.name : viewDetailTask.category || '—'; })()}</span>
              </div>

              {/* Client */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>👤</span>
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, width: '90px', flexShrink: 0 }}>Client</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text }}>{viewDetailTask.subcategory || 'General'}</span>
              </div>

              {/* Priority */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{PRIORITY_CONFIG[viewDetailTask.priority]?.icon || '🔸'}</span>
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, width: '90px', flexShrink: 0 }}>Priority</span>
                <span style={{ fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px', background: PRIORITY_CONFIG[viewDetailTask.priority]?.bg || '#FEF3C7', color: PRIORITY_CONFIG[viewDetailTask.priority]?.color || '#F59E0B' }}>{(viewDetailTask.priority || 'medium').charAt(0).toUpperCase() + (viewDetailTask.priority || 'medium').slice(1)}</span>
              </div>

              {/* Frequency */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🔄</span>
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, width: '90px', flexShrink: 0 }}>Frequency</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text }}>{viewDetailTask.type === 'one-time' ? 'One-Time' : viewDetailTask.type === 'daily' ? 'Daily' : viewDetailTask.type === 'weekly' ? 'Weekly' : viewDetailTask.type === 'monthly' ? 'Monthly' : viewDetailTask.type || 'One-Time'}</span>
              </div>

              {/* Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📅</span>
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, width: '90px', flexShrink: 0 }}>Date</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text }}>{(() => { if (!viewDetailTask.deadline) return 'No Date'; try { const d = new Date(viewDetailTask.deadline + 'T00:00:00'); const day = String(d.getDate()).padStart(2,'0'); const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']; return `${day} ${months[d.getMonth()]} ${d.getFullYear()} (${days[d.getDay()]})`; } catch(e) { return viewDetailTask.deadline; } })()}</span>
              </div>

              {/* Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🕐</span>
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, width: '90px', flexShrink: 0 }}>Time</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text }}>{viewDetailTask.time || '09:00 AM'}</span>
              </div>
            </div>

            {/* Footer: Mark Complete + Edit Task */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: `1px solid ${VISUAL_THEME.border}`, marginTop: '24px' }}>
              <button onClick={async () => { await handleToggleStatus(viewDetailTask.id, viewDetailTask.status); await loadTasks(); setViewDetailTask(null); }} style={{ flex: 1, padding: '13px', background: '#FFFFFF', color: viewDetailTask.status === 'done' ? '#D97706' : '#059669', border: `1.5px solid ${viewDetailTask.status === 'done' ? '#D97706' : '#059669'}`, borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{viewDetailTask.status === 'done' ? '↩️ Mark Incomplete' : '✓ Mark Complete'}</button>
              <button onClick={() => { handleSelectInspectedTask(viewDetailTask); setViewDetailTask(null); }} style={{ flex: 1, padding: '13px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>✏️ Edit Task</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL — Full-screen premium */}
      {inspectedTask && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', padding: isMobile ? 0 : '24px', boxSizing: 'border-box' }}
          onClick={(e) => { if (e.target === e.currentTarget) setInspectedTask(null); }}
        >
          <div style={{
            background: '#FFFFFF', borderRadius: isMobile ? '24px 24px 0 0' : '20px',
            padding: isMobile ? '24px 20px 32px' : '32px 36px',
            width: '100%', maxWidth: '680px',
            maxHeight: isMobile ? '95vh' : '90vh', overflowY: 'auto',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.15)',
            border: isMobile ? 'none' : `1px solid ${VISUAL_THEME.border}`,
            boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none !important; }`}} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: `1px solid ${VISUAL_THEME.border}` }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0, letterSpacing: '-0.5px' }}>Edit Task</h2>
                <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '4px 0 0', lineHeight: 1.4 }}>Update task details, notes and schedule.</p>
              </div>
              <button onClick={() => setInspectedTask(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: VISUAL_THEME.textSec, fontSize: '16px', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'} onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}>✕</button>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Task Title</label>
              <input type="text" value={inspectedTask.title || ''} onChange={e => setInspectedTask({ ...inspectedTask, title: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
            </div>

            {/* Rich Text Description */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Description</label>
              <RichTextEditor
                value={inspectedTask.description || ''}
                onChange={(html) => setInspectedTask({ ...inspectedTask, description: html })}
                placeholder="Add details, links, notes... Paste from docs to keep formatting!"
              />
            </div>

            {/* Grid: Category + Client */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Category</label>
                <select value={inspectedTask.category || 'personal'} onChange={e => setInspectedTask({ ...inspectedTask, category: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}>
                  {customCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Client</label>
                <select value={inspectedTask.subcategory || 'General'} onChange={e => setInspectedTask({ ...inspectedTask, subcategory: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}>
                  <option value="General">General</option>
                  {clientsList.map(cl => <option key={cl.id} value={cl.name}>🏢 {cl.name}</option>)}
                </select>
              </div>
            </div>

            {/* Grid: Priority + Frequency */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Priority</label>
                <select value={inspectedTask.priority || 'medium'} onChange={e => setInspectedTask({ ...inspectedTask, priority: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}>
                  <option value="low">🔹 Low</option><option value="medium">🔸 Medium</option><option value="high">🔺 High</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Frequency</label>
                <select value={inspectedTask.type || 'one-time'} onChange={e => setInspectedTask({ ...inspectedTask, type: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}>
                  <option value="one-time">One-Time</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Date & Time</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={inspectedTask.deadline || todayStr()} onChange={e => setInspectedTask({ ...inspectedTask, deadline: e.target.value })} style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
                {isMobile ? (
                  <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
                ) : (
                  <select value={editTime} onChange={e => setEditTime(e.target.value)} style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box', cursor: 'pointer' }}>
                    {TIME_OPTIONS_15.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '12px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '20px', marginTop: '8px' }}>
              <button onClick={() => setInspectedTask(null)} style={{ flex: 1, padding: '14px 0', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>Cancel</button>
              <button onClick={async () => { await taskService.updateTask(inspectedTask.id, { ...inspectedTask, time: convert24to12(editTime) }); await loadTasks(); setInspectedTask(null); }} style={{ flex: 2, padding: '14px 0', borderRadius: '12px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'opacity 0.15s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Save Changes</button>
              <button onClick={async () => { await handleDeleteTask(inspectedTask.id); setInspectedTask(null); }} style={{ padding: '14px 20px', borderRadius: '12px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'} onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}>🗑️</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {/* NOTIFICATION DETAIL POPUP */}
      {notifPopupTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }} onClick={e => { if(e.target === e.currentTarget) setNotifPopupTask(null); }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '0', width: '100%', maxWidth: '420px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)', overflow: 'hidden', animation: 'notifSlideIn 0.3s ease-out' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', padding: '24px 24px 20px', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏰</div>
                <button onClick={() => setNotifPopupTask(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#FFF', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>Task Reminder</h3>
              <p style={{ fontSize: '13px', margin: 0, opacity: 0.85 }}>Aapke task ka time aa gaya hai!</p>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Task Title</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>{notifPopupTask.title}</div>
              </div>
              {notifPopupTask.description && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Description</div>
                  <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>{notifPopupTask.description}</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Time</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>🕐 {notifPopupTask.time || '—'}</div>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Priority</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>{notifPopupTask.priority === 'high' ? '🔺 High' : notifPopupTask.priority === 'medium' ? '🔸 Medium' : '🔹 Low'}</div>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Category</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>{(() => { const c = customCategories.find(cat => cat.id === notifPopupTask.category); return c ? `${c.icon} ${c.name}` : notifPopupTask.category || '—'; })()}</div>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Client</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>{notifPopupTask.subcategory || 'General'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button onClick={async () => { await handleToggleStatus(notifPopupTask.id, notifPopupTask.status); await loadTasks(); setNotifPopupTask(null); }} style={{ flex: 1, padding: '12px', background: '#16A34A', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>✅ Mark Done</button>
                <button onClick={() => setNotifPopupTask(null)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Dismiss</button>
              </div>
            </div>
          </div>
          <style>{`@keyframes notifSlideIn { from { transform: scale(0.9) translateY(-20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }`}</style>
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)' }} onClick={e => { if(e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '28px 20px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Create Task</h2><button onClick={() => setShowCreateModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button></div>
            <input type="text" placeholder="Task Title *" value={modalTitle} onChange={e => setModalTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }} />
            <textarea placeholder="Description..." value={modalDesc} onChange={e => setModalDesc(e.target.value)} style={{ width: '100%', height: '60px', padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', resize: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Category</label><select value={modalCat} onChange={e => { setModalCat(e.target.value); if(e.target.value !== 'clients') setModalSub('none'); }} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}>{customCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
              <div><label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Client</label><select value={modalSub} onChange={e => setModalSub(e.target.value)} disabled={modalCat !== 'clients'} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: modalCat === 'clients' ? '#F8FAFC' : '#E2E8F0', width: '100%', boxSizing: 'border-box', cursor: modalCat === 'clients' ? 'pointer' : 'not-allowed' }}><option value="none">General</option>{clientsList.map(cl => <option key={cl.id} value={cl.id}>🏢 {cl.name}</option>)}</select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Frequency</label><select value={modalFrequency} onChange={e => setModalFrequency(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}><option value="one-time">One-Time</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
              <div><label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Priority</label><select value={modalPriority} onChange={e => setModalPriority(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}><option value="low">🔹 Low</option><option value="medium">🔸 Medium</option><option value="high">🔺 High</option></select></div>
            </div>
            <div><label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Date & Time</label><div style={{ display: 'flex', gap: '8px' }}><input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box' }} />{isMobile ? <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box' }} /> : <select value={modalTime} onChange={e => setModalTime(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', background: '#F8FAFC', boxSizing: 'border-box', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}>{TIME_OPTIONS_15.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>}</div></div>
            <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '16px', marginTop: '8px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFF', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateTaskSubmit} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: 'none', background: VISUAL_THEME.accent, color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastVisible && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          background: '#1E293B',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          animation: 'toastSlideUp 0.3s ease-out',
          maxWidth: '90vw',
          textAlign: 'center'
        }}>
          {toastMsg}
        </div>
      )}
      <style>{`@keyframes toastSlideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
