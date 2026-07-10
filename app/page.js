'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme, ThemeProvider } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { notificationService } from '../services/notificationService';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { useTasks } from '../hooks/useTasks';
import { CATEGORIES, getS } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

import AuthScreen from '../components/AuthScreen';
import FormPanel from '../components/FormPanel';
import TaskCard from '../components/TaskCard';
import Sidebar from '../components/Sidebar';
import Empty from '../components/Empty';

function DashboardContent() {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const { theme, t, toggleTheme } = useTheme();
  const S = getS(t);

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState('today');
  const [selectedCat, setSelectedCat] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const notifInterval = useRef(null);

  const emptyForm = { title: '', description: '', category: 'personal', subcategory: '', priority: 'medium', deadline: '', type: 'daily' };
  const [form, setForm] = useState(emptyForm);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const {
    tasks,
    loading,
    loadTasks,
    handleAddTask,
    handleUpdateTask,
    handleToggleStatus,
    handleDeleteTask
  } = useTasks(session, showToast);

  useEffect(() => {
    authService.getSession().then((s) => { 
      setSession(s); 
      setAuthLoading(false); 
    });
    const subscription = authService.onAuthStateChange((s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadTasks();
    }
  }, [session, loadTasks]);

  const handleLogout = async () => { 
    await authService.signOut(); 
    setSession(null); 
  };

  useEffect(() => {
    setNotifEnabled(notificationService.getPermission() === 'granted');
  }, []);

  const enableNotifications = async () => {
    const perm = await notificationService.requestPermission();
    setNotifEnabled(perm === 'granted');
    if (perm === 'granted') {
      notificationService.send('⚡ Task Planner', 'Notifications enabled! Ab tumne task reminders milenge.');
      showToast('Notifications ON ✓');
    }
  };

  useEffect(() => {
    if (!notifEnabled || tasks.length === 0) return;
    const check = () => {
      const today = todayStr();
      const dueTasks = tasks.filter(tk => tk.status !== 'done' && tk.deadline === today);
      if (dueTasks.length > 0) {
        notificationService.send('⚡ Tasks Due Today!', dueTasks.map(tk => '• ' + tk.title).join('\n'));
      }
      const overdue = tasks.filter(tk => tk.status !== 'done' && tk.deadline && tk.deadline < today);
      if (overdue.length > 0) {
        notificationService.send('⚠️ Overdue Tasks!', overdue.length + ' tasks overdue hain. Check karo!');
      }
    };
    check();
    notifInterval.current = setInterval(check, 30 * 60 * 1000);
    return () => clearInterval(notifInterval.current);
  }, [notifEnabled, tasks]);

  const addTask = () => handleAddTask(form, emptyForm, setForm, setShowAdd);
  const updateTask = () => handleUpdateTask(editTask.id, form, emptyForm, setForm, setEditTask, setShowAdd);
  
  const startEdit = (task) => { 
    setEditTask(task); 
    setForm({ 
      title: task.title, 
      description: task.description || '', 
      category: task.category, 
      subcategory: task.subcategory || '', 
      priority: task.priority, 
      deadline: task.deadline || '', 
      type: task.type || 'daily' 
    }); 
    setShowAdd(true); 
  };

  const handleFormClose = () => { 
    setShowAdd(false); 
    setEditTask(null); 
    setForm(emptyForm); 
  };

  const getAiPlan = async () => {
    setAiLoading(true);
    const pending = tasks.filter(tk => tk.status !== 'done');
    const summary = pending.map(tk => `[${tk.category}] ${tk.title} (Pri: ${tk.priority}${tk.deadline ? ', DL: ' + tk.deadline : ''}${tk.subcategory ? ', ' + tk.subcategory : ''})`).join('\n');
    try { 
      const planText = await taskService.fetchAiPlan(summary);
      setAiPlan(planText); 
    } catch (e) { 
      setAiPlan('AI connect nahi hua.'); 
    }
    setAiLoading(false);
  };

  const getFiltered = () => {
    let f = tasks;
    if (selectedCat) f = f.filter(tk => tk.category === selectedCat);
    if (filter === 'pending') f = f.filter(tk => tk.status !== 'done');
    if (filter === 'done') f = f.filter(tk => tk.status === 'done');
    if (subFilter) f = f.filter(tk => tk.subcategory?.toLowerCase().includes(subFilter.toLowerCase()));
    return f.sort((a, b) => { 
      if ((a.status === 'done') !== (b.status === 'done')) return a.status === 'done' ? 1 : -1; 
      return ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority]; 
    });
  };

  const getTodayTasks = () => tasks.filter(tk => tk.status !== 'done' && (tk.deadline === todayStr() || tk.type === 'daily' || (!tk.deadline && tk.priority === 'high'))).sort((a, b) => ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority]);

  const stats = { total: tasks.length, done: tasks.filter(tk => tk.status === 'done').length, pending: tasks.filter(tk => tk.status !== 'done').length, highPri: tasks.filter(tk => tk.priority === 'high' && tk.status !== 'done').length };
  const catCounts = CATEGORIES.reduce((a, c) => { a[c.id] = tasks.filter(tk => tk.category === c.id && tk.status !== 'done').length; return a; }, {});

  const completionPercentage = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  // Premium Custom Inline Theme Object override for true dark styling
  const dTheme = {
    bg: '#09090B',
    sidebar: '#121215',
    surface: '#16161A',
    border: '1px solid #27272A',
    borderLight: '1px solid #1F1F23',
    textMuted: '#A1A1AA',
    accent: '#6C5CE7'
  };

  if (authLoading) return <div style={{ background: dTheme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dTheme.textMuted, fontFamily: 'system-ui' }}>Loading Workspace Architecture...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;
  if (loading) return <div style={{ background: dTheme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dTheme.textMuted, fontFamily: 'system-ui' }}>Syncing Tasks Grid...</div>;

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
  const sidebarProps = { view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd };

  return (
    <div style={{ background: dTheme.bg, minHeight: '100vh', display: 'flex', flexDirection: 'row', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#F4F4F5' }}>
      
      {/* Toast Alert Frame */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#18181B', border: '1px solid #10B981', color: '#10B981', padding: '10px 24px', borderRadius: 30, fontSize: 12, fontWeight: 600, zIndex: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      {showAdd && <FormPanel form={form} setForm={setForm} editTask={editTask} onSubmit={editTask ? updateTask : addTask} onClose={handleFormClose} isMobile={isMobile} />}

      {/* Desktop Sidebar Panel */}
      {!isMobile && (
        <div style={{ width: 250, background: dTheme.sidebar, borderRight: dTheme.border, position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
          <Sidebar mobile={false} {...sidebarProps} />
        </div>
      )}

      {/* Mobile Sidebar Frame */}
      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 270, background: dTheme.sidebar, height: '100%', overflowY: 'auto', borderRight: dTheme.border }}><Sidebar mobile={true} {...sidebarProps} /></div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Workspace Frame */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'col', height: isMobile ? 'auto' : '100vh', overflowY: 'auto', paddingBottom: isMobile ? 80 : 40 }}>
        
        {/* Mobile Header Navigation strip */}
        {isMobile && (
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: dTheme.sidebar, position: 'sticky', top: 0, zIndex: 40, borderBottom: dTheme.border }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: dTheme.textMuted, fontSize: 20, cursor: 'pointer' }}>☰</button>
            <h2 style={{ margin: 0, fontSize: 14, color: '#FFFFFF', fontWeight: 600, letterSpacing: '0.5px' }}>
              {view === 'today' ? '📋 TODAY\'S FOCUS' : view === 'ai' ? '🤖 AI PLANNER' : '📁 DIRECTORY'}
            </h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
              <button onClick={() => setShowAdd(true)} style={{ background: dTheme.accent, border: 'none', color: '#fff', width: 28, height: 28, borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        )}

        {/* Interior Container Layer */}
        <div style={{ width: '100%', padding: isMobile ? '16px 16px' : '40px 50px', maxWidth: 900, margin: '0 auto' }}>
          
          {/* Desktop Upper Dashboard Bar */}
          {!isMobile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, borderBottom: '1px solid #1F1F23', paddingBottom: 24 }}>
              <div>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: dTheme.accent, letterSpacing: 2, textTransform: 'uppercase' }}>Workspace Engine / Live</span>
                <h2 style={{ margin: '4px 0 0', fontSize: 28, color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.5px' }}>
                  {view === 'today' ? "Today's Architecture" : view === 'ai' ? 'AI Daily Plan' : view === 'all' ? 'All System Tasks' : 'Filtered Stack'}
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: dTheme.textMuted }}>{stats.pending} standing operations &bull; {stats.done} parameters complete</p>
              </div>
              <button onClick={() => setShowAdd(true)} style={{ background: '#FFFFFF', border: 'none', color: '#09090B', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(255,255,255,0.1)' }}>+ New Task</button>
            </div>
          )}

          {/* BLOCKVIEW: TODAY */}
          {view === 'today' && (
            <>
              {/* Premium Analytics Stats Deck */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { l: 'Total Nodes', v: stats.total, c: '#F4F4F5' },
                  { l: 'Synchronized', v: stats.done, c: '#10B981' },
                  { l: 'Backlog Threads', v: stats.pending, c: '#F59E0B' },
                  { l: 'Critical Priority', v: stats.highPri, c: '#EF4444' }
                ].map((s, idx) => (
                  <div key={idx} style={{ background: dTheme.surface, borderRadius: 12, padding: '16px', border: dTheme.borderLight, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, color: dTheme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>{s.l}</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: s.c, marginTop: 8 }}>{s.v}</span>
                  </div>
                ))}
              </div>

              {/* Progress Bar (Instead of broken raw SVG) */}
              <div style={{ background: dTheme.surface, border: dTheme.borderLight, padding: 16, borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: dTheme.textMuted, fontWeight: 500 }}>Global Progress Vector</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{completionPercentage}%</span>
                  </div>
                  <div style={{ height: 6, background: '#27272A', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #6C5CE7, #A29BFE)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>

              {/* AI Quick Banner Deck */}
              <button onClick={() => setView('ai')} style={{ display: 'block', width: '100%', padding: '16px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(108,92,231,0.07), rgba(162,155,254,0.03))', border: '1px solid rgba(108,92,231,0.2)', borderRadius: 12, color: '#A29BFE', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', outline: 'none' }}>
                🤖 Ask AI to organize today's deployment roadmap &rarr;
              </button>

              {/* Category Pill Hub */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: 10, marginBottom: 28 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setView('category'); setSelectedCat(c.id); }} style={{ background: dTheme.surface, border: dTheme.borderLight, borderRadius: 12, padding: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, textAlign: 'left' }}>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: c.color || dTheme.textMuted }}>{catCounts[c.id]} pending</span>
                  </button>
                ))}
              </div>

              {/* Execution Stream Header */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 11, fontFamily: 'monospace', color: dTheme.textMuted, margin: 0, letterSpacing: '1px' }}>CORE PROTOCOLS EXECUTION</h3>
                <div style={{ flex: 1, height: 1, background: '#1F1F23', marginLeft: 16 }} />
              </div>

              {getTodayTasks().length === 0 && <Empty text="All clear. No operational targets mapped for this timestamp." />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getTodayTasks().map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
              </div>
            </>
          )}

          {/* BLOCKVIEW: AI STRIP */}
          {view === 'ai' && (
            <div style={{ maxWidth: 650, margin: '0 auto' }}>
              {!aiPlan && !aiLoading && (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: dTheme.surface, border: dTheme.border, borderRadius: 16 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
                  <h4 style={{ color: '#F4F4F5', fontSize: 16, margin: '0 0 6px' }}>Heuristic AI Analysis</h4>
                  <p style={{ color: dTheme.textMuted, margin: '0 0 20px', fontSize: 13, lineHeight: 1.6 }}>System will compute details from active backlogs to render an optimized strategy.</p>
                  <button onClick={getAiPlan} style={{ background: '#FFFFFF', border: 'none', color: '#09090B', padding: '12px 28px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Compute Daily Map</button>
                </div>
              )}
              {aiLoading && <div style={{ textAlign: 'center', padding: 40, color: dTheme.textMuted, fontSize: 13 }}>🤖 Running tactical engine models...</div>}
              {aiPlan && (
                <div style={{ background: dTheme.surface, borderRadius: 16, padding: 24, border: '1px solid rgba(108,92,231,0.2)' }}>
                  <div style={{ color: '#A29BFE', fontSize: 11, fontFamily: 'monospace', marginBottom: 12, fontWeight: 700, letterSpacing: 1 }}>SYSTEM ARCHITECTURE INPUTS</div>
                  <div style={{ color: '#E4E4E7', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 13, background: '#09090B', padding: 16, borderRadius: 8, border: dTheme.borderLight, fontFamily: 'monospace' }}>{aiPlan}</div>
                  <button onClick={getAiPlan} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid #27272A', background: 'transparent', color: dTheme.textMuted, fontSize: 12, cursor: 'pointer' }}>🔄 Recalibrate</button>
                </div>
              )}
            </div>
          )}

          {/* BLOCKVIEW: INDIVIDUAL SPECIFIC CATEGORY */}
          {view === 'category' && selectedCat && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, background: dTheme.surface, padding: 8, borderRadius: 12, width: 'fit-content', border: dTheme.borderLight }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: 'none', background: filter === f ? '#27272A' : 'transparent', color: filter === f ? '#FFFFFF' : dTheme.textMuted, fontWeight: 500 }}>{f.toUpperCase()}</button>
                ))}
              </div>
              {(selectedCat === 'clients' || selectedCat === 'websites') && (
                <input 
                  style={{ background: '#09090B', border: dTheme.border, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#FFF', outline: 'none' }} 
                  placeholder={'Search filter nodes...'} 
                  value={subFilter} 
                  onChange={e => setSubFilter(e.target.value)} 
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getFiltered().length === 0 && <Empty text="No data streams allocated inside this target sequence." />}
                {getFiltered().map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
              </div>
            </div>
          )}

          {/* BLOCKVIEW: SYSTEM MASS INDEX DIAL */}
          {view === 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 8, background: dTheme.surface, padding: 8, borderRadius: 12, width: 'fit-content', border: dTheme.borderLight }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: 'none', background: filter === f ? '#27272A' : 'transparent', color: filter === f ? '#FFFFFF' : dTheme.textMuted, fontWeight: 500 }}>{f.toUpperCase()}</button>
                ))}
              </div>
              {CATEGORIES.map(cat => { 
                const ct = getFiltered().filter(tk => tk.category === cat.id); 
                if (!ct.length) return null; 
                return (
                  <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3 style={{ fontSize: 12, color: cat.color || '#FFF', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{cat.icon}</span><span>{cat.name}</span>
                      <span style={{ fontSize: 10, background: '#27272A', color: dTheme.textMuted, padding: '2px 6px', borderRadius: 6 }}>{ct.length}</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {ct.map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
                    </div>
                  </div>
                ); 
              })}
              {getFiltered().length === 0 && <Empty text="Global directory registry empty." />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
