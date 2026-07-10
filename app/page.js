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

  if (authLoading) return <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSec, fontFamily: 'system-ui' }}>Loading...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;
  if (loading) return <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSec, fontFamily: 'system-ui' }}>Loading tasks...</div>;

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';

  const sidebarProps = { view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd };

  return (
    <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {toast && <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#00b894', color: '#fff', padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 200 }}>{toast}</div>}
      {showAdd && <FormPanel form={form} setForm={setForm} editTask={editTask} onSubmit={editTask ? updateTask : addTask} onClose={handleFormClose} isMobile={isMobile} />}

      {!isMobile && <div style={{ width: 240, background: t.sidebar, borderRight: '1px solid ' + t.border, position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}><Sidebar mobile={false} {...sidebarProps} /></div>}

      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 260, background: t.sidebar, height: '100%', overflowY: 'auto', borderRight: '1px solid ' + t.border }}><Sidebar mobile={true} {...sidebarProps} /></div>
          <div style={{ flex: 1, background: '#00000066' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', height: isMobile ? 'auto' : '100vh', minHeight: '100vh', paddingBottom: isMobile ? 80 : 24 }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: t.sidebar, position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid ' + t.border }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: t.textSec, fontSize: 22, cursor: 'pointer', padding: 0 }}>☰</button>
            <h2 style={{ margin: 0, fontSize: 15, color: t.text, fontWeight: 600 }}>{view === 'today' ? '📋 Today' : view === 'ai' ? '🤖 AI Plan' : view === 'all' ? '📁 All' : selectedCat ? (CATEGORIES.find(c => c.id === selectedCat)?.icon + ' ' + CATEGORIES.find(c => c.id === selectedCat)?.name) : 'Tasks'}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
              <button onClick={() => setShowAdd(true)} style={{ background: '#6C5CE7', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: 8, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>
        )}

        <div style={{ padding: isMobile ? '12px 14px' : '24px 32px', maxWidth: 860, margin: '0 auto' }}>
          {!isMobile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, color: t.text, fontWeight: 700 }}>{view === 'today' ? "Today's Focus" : view === 'ai' ? 'AI Daily Plan' : view === 'all' ? 'All Tasks' : selectedCat ? (CATEGORIES.find(c => c.id === selectedCat)?.icon + ' ' + CATEGORIES.find(c => c.id === selectedCat)?.name) : 'Tasks'}</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: t.textSec }}>{stats.pending} pending · {stats.done} completed</p>
              </div>
              <button onClick={() => setShowAdd(true)} style={{ ...S.primaryBtn, width: 'auto', padding: '10px 24px', fontSize: 13 }}>+ New Task</button>
            </div>
          )}

          {view === 'today' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: isMobile ? 8 : 12, marginBottom: 16 }}>
                {[{ l: 'Total', v: stats.total, c: t.text }, { l: 'Done', v: stats.done, c: '#00b894' }, { l: 'Pending', v: stats.pending, c: '#ffa502' }, { l: 'Urgent', v: stats.highPri, c: '#ff6b6b' }].map(s => (
                  <div key={s.l} style={{ background: t.surface, borderRadius: 10, padding: isMobile ? '10px 6px' : '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setView('ai')} style={{ display: 'block', width: '100%', padding: isMobile ? '12px 14px' : '14px 18px', marginBottom: 16, background: 'linear-gradient(135deg, #6C5CE714, #a29bfe14)', border: '1px solid #6C5CE733', borderRadius: 10, color: '#a29bfe', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>🤖 AI se aaj ka plan banwao →</button>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: isMobile ? 8 : 10, marginBottom: isMobile ? 14 : 20 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setView('category'); setSelectedCat(c.id); }} style={{ background: t.surface, border: '1px solid ' + c.color + '33', borderRadius: 10, padding: isMobile ? '10px 8px' : '14px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', gap: isMobile ? 3 : 4 }}>
                    <span style={{ fontSize: isMobile ? 18 : 22 }}>{c.icon}</span>
                    <span style={{ fontSize: isMobile ? 11 : 13, color: t.text, fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontSize: isMobile ? 10 : 11, color: c.color }}>{catCounts[c.id]} pending</span>
                  </button>
                ))}
              </div>
              <h3 style={{ fontSize: 13, color: t.textSec, margin: '0 0 8px', fontWeight: 600, letterSpacing: 0.5 }}>{"TODAY'S TASKS"}</h3>
              {getTodayTasks().length === 0 && <Empty text="Aaj ke liye koi task nahi. Naya task add karo!" />}
              {getTodayTasks().map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
            </>
          )}

          {view === 'ai' && (
            <div style={{ maxWidth: 600 }}>
              {!aiPlan && !aiLoading && (
                <div style={{ textAlign: 'center', padding: isMobile ? '30px 12px' : '50px 20px' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>🧠</div>
                  <p style={{ color: t.textSec, marginBottom: 20, lineHeight: 1.7, fontSize: 14 }}>AI tumhare pending tasks analyze karke batayega ki aaj kya karna chahiye.</p>
                  <button onClick={getAiPlan} style={{ ...S.primaryBtn, width: 'auto', padding: '12px 32px' }}>{"Generate Today's Plan"}</button>
                </div>
              )}
              {aiLoading && <div style={{ textAlign: 'center', padding: 50, color: t.textSec }}>🤖 Analyzing...</div>}
              {aiPlan && (
                <div style={{ background: t.surface, borderRadius: 12, padding: isMobile ? 16 : 24, border: '1px solid #6C5CE733' }}>
                  <div style={{ color: '#6C5CE7', fontSize: 12, marginBottom: 10, fontWeight: 700 }}>AI RECOMMENDATION</div>
                  <div style={{ color: t.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 14 }}>{aiPlan}</div>
                  <button onClick={getAiPlan} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid #6C5CE744', background: 'transparent', color: '#6C5CE7', fontSize: 13, cursor: 'pointer' }}>🔄 Regenerate</button>
                </div>
              )}
            </div>
          )}

          {view === 'category' && selectedCat && (
            <>
              {(selectedCat === 'clients' || selectedCat === 'websites') && (
                <input 
                  style={{ ...S.input, marginBottom: 10 }} 
                  placeholder={'Search by ' + (selectedCat === 'clients' ? 'client' : 'site') + '...'} 
                  value={subFilter} 
                  onChange={e => setSubFilter(e.target.value)} 
                />
              )}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid ' + (filter === f ? '#6C5CE7' : t.borderAlt), background: filter === f ? '#6C5CE718' : 'transparent', color: filter === f ? '#6C5CE7' : t.textSec }}>{f[0].toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              {getFiltered().length === 0 && <Empty text="No tasks here." />}
              {getFiltered().map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
            </>
          )}

          {view === 'all' && (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid ' + (filter === f ? '#6C5CE7' : t.borderAlt), background: filter === f ? '#6C5CE718' : 'transparent', color: filter === f ? '#6C5CE7' : t.textSec }}>{f[0].toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              {CATEGORIES.map(cat => { 
                const ct = getFiltered().filter(tk => tk.category === cat.id); 
                if (!ct.length) return null; 
                return (
                  <div key={cat.id} style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 13, color: cat.color, margin: '0 0 8px', fontWeight: 600 }}>{cat.icon} {cat.name} ({ct.length})</h3>
                    {ct.map(tk => <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />)}
                  </div>
                ); 
              })}
              {getFiltered().length === 0 && <Empty text="No tasks found." />}
            </>
          )}
        </div>
      </div>

      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: t.sidebar, borderTop: '1px solid ' + t.border, display: 'flex', justifyContent: 'space-around', padding: '6px 0 8px', zIndex: 20 }}>
          {[{ id: 'today', icon: '📋', l: 'Today' }, { id: 'all', icon: '📁', l: 'All' }, { id: 'ai', icon: '🤖', l: 'AI Plan' }].map(i => (
            <button key={i.id} onClick={() => { setView(i.id); setSelectedCat(null); setSidebarOpen(false); }} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '4px 20px', color: view === i.id ? '#6C5CE7' : t.textSec }}>
              <span style={{ fontSize: 18 }}>{i.icon}</span>
              <span style={{ fontSize: 10, fontWeight: view === i.id ? 600 : 400 }}>{i.l}</span>
            </button>
          ))}
        </div>
      )}
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
