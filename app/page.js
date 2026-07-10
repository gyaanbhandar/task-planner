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

  // Business Logic Variables Kept Intact
  const stats = { total: tasks.length, done: tasks.filter(tk => tk.status === 'done').length, pending: tasks.filter(tk => tk.status !== 'done').length, highPri: tasks.filter(tk => tk.priority === 'high' && tk.status !== 'done').length };
  const catCounts = CATEGORIES.reduce((a, c) => { a[c.id] = tasks.filter(tk => tk.category === c.id && tk.status !== 'done').length; return a; }, {});

  // Progress Calculation for Stripe/Vercel style metrics
  const completionPercentage = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  if (authLoading) return <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-zinc-400 font-sans tracking-tight">Loading premium setup...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;
  if (loading) return <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-zinc-400 font-sans tracking-tight">Syncing architecture...</div>;

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
  const sidebarProps = { view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex font-sans selection:bg-purple-500/30 overflow-x-hidden antialiased">
      {/* Dynamic Glow Accents (Stripe & Motion Vibe) */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Premium Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-full text-xs font-medium tracking-wide shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          {toast}
        </div>
      )}

      {showAdd && <FormPanel form={form} setForm={setForm} editTask={editTask} onSubmit={editTask ? updateTask : addTask} onClose={handleFormClose} isMobile={isMobile} />}

      {/* Desktop Sidebar Shell */}
      {!isMobile && (
        <div className="w-64 bg-[#0D0D11]/60 backdrop-blur-xl border-r border-zinc-800/50 sticky top-0 h-screen flex-shrink-0 z-30">
          <Sidebar mobile={false} {...sidebarProps} />
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-[#0D0D11] h-full border-r border-zinc-800/80 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar mobile={true} {...sidebarProps} />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Mobile Modern Header */}
        {isMobile && (
          <div className="flex items-center justify-between px-5 py-4 bg-[#0D0D11]/70 backdrop-blur-md sticky top-0 z-40 border-b border-zinc-800/40">
            <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-zinc-100 p-1 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 bg-zinc-800/40 px-2.5 py-1 rounded-md border border-zinc-700/30">
              {view === 'today' ? 'Focus' : view === 'ai' ? 'AI Engine' : view === 'all' ? 'Index' : 'Scope'}
            </span>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="text-zinc-400 p-1 text-sm">{theme === 'dark' ? '☀️' : '🌙'}</button>
              <button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-8 h-8 rounded-lg font-medium text-lg flex items-center justify-center shadow-lg shadow-purple-900/20">+</button>
            </div>
          </div>
        )}

        {/* Core Content Area */}
        <div className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8 pb-24 md:pb-12">
          
          {/* Premium Desktop Header (Linear/Vercel style) */}
          {!isMobile && (
            <div className="flex justify-between items-end border-b border-zinc-800/40 pb-6">
              <div>
                <div className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                  Workspace / Intelligence
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400">
                  {view === 'today' ? "Today's Architecture" : view === 'ai' ? 'Autonomous Alignment' : view === 'all' ? 'Global Directory' : 'Filtered Hierarchy'}
                </h1>
                <p className="text-sm text-zinc-500 mt-1 font-medium">
                  {stats.pending} remaining initiatives &bull; {stats.done} parameters synchronized
                </p>
              </div>
              <button onClick={() => setShowAdd(true)} className="relative group overflow-hidden rounded-xl bg-zinc-100 text-zinc-950 text-xs font-medium px-4 py-2.5 transition-all duration-300 hover:bg-zinc-200 shadow-[0_1px_12px_rgba(255,255,255,0.15)] flex items-center gap-2">
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Deploy Task
              </button>
            </div>
          )}

          {/* VIEW: TODAY */}
          {view === 'today' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* Premium Dashboard Grid featuring Glassmorphism, Ring Progress & Animated Numbers counter elements */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Micro Metrics cards */}
                <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Index', value: stats.total, color: 'text-zinc-100', border: 'border-zinc-800/40', glow: '' },
                    { label: 'Completed', value: stats.done, color: 'text-emerald-400', border: 'border-emerald-500/10', glow: 'bg-emerald-500/5' },
                    { label: 'Backlog', value: stats.pending, color: 'text-amber-400', border: 'border-amber-500/10', glow: 'bg-amber-500/5' },
                    { label: 'Critical', value: stats.highPri, color: 'text-rose-400', border: 'border-rose-500/10', glow: 'bg-rose-500/5' }
                  ].map((s, idx) => (
                    <div key={idx} className={`bg-[#0B0B0E]/60 backdrop-blur-md border ${s.border} ${s.glow} p-4 rounded-xl flex flex-col justify-between group transition-all duration-300 hover:border-zinc-700/50`}>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{s.label}</span>
                      <span className={`text-2xl font-bold tracking-tight mt-3 ${s.color} transition-transform duration-300 group-hover:scale-105 inline-block`}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress Ring Card (Apple/Linear vibe) */}
                <div className="bg-[#0B0B0E]/60 backdrop-blur-md border border-zinc-800/40 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Efficiency</span>
                    <span className="text-lg font-semibold tracking-tight text-zinc-200 mt-1">{completionPercentage}% Completed</span>
                  </div>
                  {/* Inline SVGs for elegant dynamic styling control */}
                  <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-zinc-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-purple-500 transition-all duration-500 ease-out" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* AI Trigger Strip */}
              <button onClick={() => setView('ai')} className="w-full group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-transparent p-4 text-left transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_24px_rgba(108,92,231,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-purple-500/10 to-transparent blur-md pointer-events-none transition-transform group-hover:translate-x-6" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg animate-pulse">✨</span>
                    <div>
                      <h4 className="text-xs font-semibold text-purple-300 tracking-tight">Generate Autonomous Priority Matrix</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Let LLM orchestrate today's tasks timeline parameters seamlessly.</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 group-hover:text-purple-400 text-sm transition-colors">&rarr;</span>
                </div>
              </button>

              {/* Horizontal Category Pill Deck (Arc Browser/Linear inspired icons view) */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setView('category'); setSelectedCat(c.id); }} className="group text-left bg-[#0A0A0C] border border-zinc-800/50 hover:border-zinc-700 rounded-xl p-3 transition-all duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-lg opacity-80 group-hover:opacity-100 transition-opacity">{c.icon}</span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{catCounts[c.id] || 0}</span>
                    </div>
                    <div className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors mt-3 truncate">{c.name}</div>
                  </button>
                ))}
              </div>

              {/* Task Section / Activity Timeline Container */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Core Objectives Execution</h3>
                  <div className="h-px bg-zinc-800/60 flex-1 mx-4" />
                </div>
                {getTodayTasks().length === 0 ? (
                  <Empty text="No structural objectives mapped for this scope. Insert node to begin." />
                ) : (
                  <div className="space-y-2.5">
                    {getTodayTasks().map(tk => (
                      <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: AI ENGINE */}
          {view === 'ai' && (
            <div className="max-w-2xl mx-auto py-4 animate-in fade-in duration-300">
              {!aiPlan && !aiLoading && (
                <div className="border border-zinc-800/60 bg-[#0B0B0E]/40 backdrop-blur-md rounded-2xl p-8 text-center relative overflow-hidden">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto text-xl text-purple-400 mb-4 border border-purple-500/20">🤖</div>
                  <h3 className="text-base font-semibold text-zinc-200 tracking-tight">AI Pipeline Analysis</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-2 leading-relaxed">
                    System will pull structural properties across active threads to generate a unified tactical roadmap layout.
                  </p>
                  <button onClick={getAiPlan} className="mt-6 bg-zinc-100 text-zinc-950 text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-all shadow-md">
                    Execute Engine Map
                  </button>
                </div>
              )}

              {aiLoading && (
                <div className="py-16 text-center space-y-3">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono text-zinc-500 tracking-wider uppercase">Running heuristic models...</p>
                </div>
              )}

              {aiPlan && (
                <div className="bg-[#0B0B0E]/80 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3 mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400">Validated Recommendation System</span>
                    <button onClick={getAiPlan} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"/></svg>
                      Recalibrate
                    </button>
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap selection:bg-purple-500/40 bg-zinc-950/40 p-4 rounded-lg border border-zinc-900">
                    {aiPlan}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: CATEGORY (Sleek Index Lists) */}
          {view === 'category' && selectedCat && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0B0E]/40 border border-zinc-800/40 p-3 rounded-xl backdrop-blur-md">
                <div className="flex gap-1.5">
                  {['all', 'pending', 'done'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`text-[11px] font-medium tracking-wide px-3.5 py-1.5 rounded-lg transition-all border ${filter === f ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                {(selectedCat === 'clients' || selectedCat === 'websites') && (
                  <div className="relative">
                    <input 
                      className="bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg text-xs px-3.5 py-1.5 w-full sm:w-60 focus:outline-none placeholder-zinc-600 text-zinc-300 transition-colors"
                      placeholder={'Filter node parameters...'} 
                      value={subFilter} 
                      onChange={e => setSubFilter(e.target.value)} 
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {getFiltered().length === 0 ? (
                  <Empty text="No active nodes found inside this sequence matrix." />
                ) : (
                  getFiltered().map(tk => (
                    <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW: GLOBAL ALL INDEX */}
          {view === 'all' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-[#0B0B0E]/40 border border-zinc-800/40 p-3 rounded-xl backdrop-blur-md inline-flex gap-1.5">
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`text-[11px] font-medium tracking-wide px-3.5 py-1.5 rounded-lg transition-all border ${filter === f ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {CATEGORIES.map(cat => { 
                  const ct = getFiltered().filter(tk => tk.category === cat.id); 
                  if (!ct.length) return null; 
                  return (
                    <div key={cat.id} className="space-y-2.5">
                      <h3 className="text-xs font-semibold flex items-center gap-2 text-zinc-400 px-1">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                        <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900/60 px-1.5 py-0.2 rounded border border-zinc-800/50">{ct.length}</span>
                      </h3>
                      <div className="space-y-2">
                        {ct.map(tk => (
                          <TaskCard key={tk.id} task={tk} onToggle={handleToggleStatus} onEdit={startEdit} onDelete={handleDeleteTask} isMobile={isMobile} />
                        ))}
                      </div>
                    </div>
                  ); 
                })}
                {getFiltered().length === 0 && <Empty text="Zero sequence records registered globally." />}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Glassmorphism Fixed Dock */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/80 backdrop-blur-lg border-t border-zinc-800/60 flex justify-around py-2.5 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          {[
            { id: 'today', icon: '📋', label: 'Focus' },
            { id: 'all', icon: '📁', label: 'Index' },
            { id: 'ai', icon: '🤖', label: 'AI Engine' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setSelectedCat(null); setSidebarOpen(false); }} className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${view === item.id ? 'text-purple-400' : 'text-zinc-500'}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
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
