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
      notificationService.send('⚡ Task Planner', 'Notifications enabled!');
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
    const summary = pending.map(tk => `[${tk.category}] ${tk.title} (Pri: ${tk.priority})`).join('\n');
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

  if (authLoading) return <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSec, fontFamily: 'sans-serif' }}>Loading...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;
  if (loading) return <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSec, fontFamily: 'sans-serif' }}>Loading tasks...</div>;

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
  const sidebarProps = { view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd };

  return (
    <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', flexDirection: 'row', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: t.text, boxSizing: 'border-box' }}>
      
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: t.surface, border: '1px solid ' + t.border, color: t.text, padding: '8px 20px', borderRadius: 20, fontSize: 12, fontWeight: 500, zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      {showAdd && <FormPanel form={form} setForm={setForm} editTask={editTask} onSubmit={editTask ? updateTask : addTask} onClose={handleFormClose} isMobile={isMobile} />}

      {!isMobile && (
        <div style={{ width: 240, background: t.sidebar, borderRight: '1px solid ' + t.border, position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
          <Sidebar mobile={false} {...sidebarProps} />
        </div>
      )}

      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ width: 260, background: t.sidebar, height: '100%', borderRight: '1px solid ' + t.border }}><Sidebar mobile={true} {...sidebarProps} /></div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Stretch area layout fix: Changed maxWidth to 100% and expanded paddings */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        
        {isMobile && (
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: t.sidebar, position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid ' + t.border, boxSizing: 'border-box' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: t.textSec, fontSize: 18, cursor: 'pointer' }}>☰</button>
            <h2 style={{ margin: 0, fontSize: 14, color: t.text, fontWeight: 600 }}>
              {view === 'today' ? "Today's Focus" : view === 'ai' ? 'AI Plan' : 'All Tasks'}
            </h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: 14, color: t.textSec, cursor: 'pointer' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
              <button onClick={() => setShowAdd(true)} style={{ background: '#6C5CE7', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: 6, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        )}

        <div style={{ width: '100%', padding: isMobile ? '20px 16px 80px' : '40px 40px', maxWidth: '100%', margin: '0', boxSizing: 'border-box' }}>
          
          {!isMobile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, borderBottom: '1px solid ' + t.border, paddingBottom: 20 }}>
              <div>
                <h2 style={{ margin: '0', fontSize: 26, color: t.text, fontWeight: 700, letterSpacing: '-0.5px' }}>
                  {view === 'today' ? "Today's Focus" : view === 'ai' ? 'AI Daily Plan' : view === 'all' ? 'All Tasks' : 'Tasks'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: t.textSec }}>{stats.pending} pending &bull; {stats.done} completed</p>
              </div>
              <button onClick={() => setShowAdd(true)} style={{ background: '#6C5CE7', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
            </div>
          )}

          {view === 'today' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24, width: '100%' }}>
                {[
                  { l: 'Total', v: stats.total, c: t.text },
                  { l: 'Done', v: stats.done, c: '#10B981' },
                  { l: 'Pending', v: stats.pending, c: '#F59E0B' },
                  { l: 'Urgent', v: stats.highPri, c: '#EF4444' }
                ].map((s, idx) => (
                  <div key={idx} style={{ background: t.surface, borderRadius: 10, padding: '16px', border: '1px solid ' + t.border }}>
                    <span style={{ fontSize: 11, color: t.textSec, fontWeight: 500 }}>{s.l}</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: s.c, display: 'block', marginTop: 6 }}>{s.v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: t.surface, border: '1px solid ' + t.border, padding: '16px', borderRadius: 10, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: t.textSec, fontWeight: 500 }}>Operational Progress</span>
                  <span style={{ color: t.text, fontWeight: 600 }}>{completionPercentage}%</span>
                </div>
                <div style={{ height: 6, background: theme === 'dark' ? '#1C1C1F' : '#E4E4E7', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${completionPercentage}%`, height: '100%', background: '#6C5CE7', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <button onClick={() => setView('ai')} style={{ display: 'block', width: '100%', padding: '14px 16px', marginBottom: 24, background: theme === 'dark' ? 'rgba(108,92,231,0.06)' : 'rgba(108,92,231,0.04)', border: '1px solid rgba(108,92,231,0.2)', borderRadius: 10, color: '#6C5CE7', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', outline: 'none' }}>
                🤖 AI se aaj ka plan banwao →
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setView('category'); setSelectedCat(c.id); }} style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: 10, padding: '14px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', items: 'flex-start', gap: 4, textAlign: 'left' }}>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <span style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: c.color }}>{catCounts[c.id] || 0} pending</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 12, color: t.textSec, margin: 0, fontWeight: 600 }}>TODAY'S TASKS</h3>
                <div style={{ flex: 1, height: 1, background: t.border, marginLeft: 16 }} />
              </div>

              {getTodayTasks().length === 0 && <Empty text="Aaj ke liye koi task nahi." />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getTodayTasks().map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
              </div>
            </>
          )}

          {view === 'ai' && (
            <div style={{ maxWidth: '100%' }}>
              {!aiPlan && !aiLoading && (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: t.surface, border: '1px solid ' + t.border, borderRadius: 12 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
                  <h4 style={{ color: t.text, fontSize: 16, margin: '0 0 6px', fontWeight: 600 }}>AI Plan Generator</h4>
                  <p style={{ color: t.textSec, margin: '0 0 20px', fontSize: 13 }}>AI pending tasks analyze karke batayega ki aaj kya karna chahiye.</p>
                  <button onClick={getAiPlan} style={{ background: '#6C5CE7', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Generate Today's Plan</button>
                </div>
              )}
              {aiLoading && <div style={{ textAlign: 'center', padding: 40, color: t.textSec, fontSize: 13 }}>AI Analyzing...</div>}
              {aiPlan && (
                <div style={{ background: t.surface, borderRadius: 12, padding: 24, border: '1px solid ' + t.border }}>
                  <div style={{ color: t.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 13, background: t.inputBg, padding: 16, borderRadius: 8, border: '1px solid ' + t.border }}>{aiPlan}</div>
                  <button onClick={getAiPlan} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 6, border: '1px solid ' + t.border, background: 'transparent', color: t.textSec, fontSize: 12, cursor: 'pointer' }}>🔄 Regenerate Plan</button>
                </div>
              )}
            </div>
          )}

          {view === 'category' && selectedCat && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 6, background: t.surface, padding: 4, borderRadius: 8, width: 'fit-content', border: '1px solid ' + t.border }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: 'none', background: filter === f ? (theme === 'dark' ? '#222227' : '#E4E4E7') : 'transparent', color: filter === f ? t.text : t.textSec, fontWeight: 500 }}>{f.toUpperCase()}</button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getFiltered().length === 0 && <Empty text="No tasks found." />}
                {getFiltered().map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
              </div>
            </div>
          )}

          {view === 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', gap: 6, background: t.surface, padding: 4, borderRadius: 8, width: 'fit-content', border: '1px solid ' + t.border }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: 'none', background: filter === f ? (theme === 'dark' ? '#222227' : '#E4E4E7') : 'transparent', color: filter === f ? t.text : t.textSec, fontWeight: 500 }}>{f.toUpperCase()}</button>
                ))}
              </div>
              {CATEGORIES.map(cat => { 
                const ct = getFiltered().filter(tk => tk.category === cat.id); 
                if (!ct.length) return null; 
                return (
                  <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ fontSize: 13, color: cat.color, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{cat.icon}</span><span>{cat.name}</span>
                      <span style={{ fontSize: 11, background: t.inputBg, color: t.textSec, padding: '2px 8px', borderRadius: 6, border: '1px solid ' + t.border }}>{ct.length}</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {ct.map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
                    </div>
                  </div>
                ); 
              })}
              {getFiltered().length === 0 && <Empty text="No tasks found." />}
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
