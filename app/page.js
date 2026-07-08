'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { id: 'personal', name: 'Personal', icon: '🧘', color: '#a29bfe' },
  { id: 'work', name: 'Work', icon: '💼', color: '#00b894' },
  { id: 'websites', name: 'My Websites', icon: '🌐', color: '#0984e3' },
  { id: 'clients', name: 'Clients', icon: '👥', color: '#fdcb6e' },
  { id: 'leadgen', name: 'Lead Gen', icon: '🎯', color: '#e17055' },
];

const PRIORITY_COLORS = { high: '#ff6b6b', medium: '#ffa502', low: '#a4b0be' };
const todayStr = () => new Date().toISOString().split('T')[0];

// THEME COLORS
const THEMES = {
  dark: {
    bg: '#0F1117', surface: '#1A1D27', sidebar: '#14161F', border: '#1e2130', borderAlt: '#2a2d3a',
    text: '#E8E8ED', textSec: '#8B8D97', textDim: '#555',
    inputBg: '#0F1117',
  },
  light: {
    bg: '#F5F5F7', surface: '#FFFFFF', sidebar: '#FAFAFA', border: '#E5E5EA', borderAlt: '#D1D1D6',
    text: '#1a1a2e', textSec: '#6b6b80', textDim: '#aaa',
    inputBg: '#F0F0F5',
  },
};

function getS(t) {
  return {
    input: { background: t.inputBg, border: '1px solid ' + t.borderAlt, borderRadius: 8, padding: '10px 12px', color: t.text, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
    label: { fontSize: 11, color: t.textSec, fontWeight: 700, letterSpacing: 0.3 },
    primaryBtn: { background: '#6C5CE7', border: 'none', borderRadius: 10, padding: '12px 0', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' },
  };
}

// ─── NOTIFICATIONS ───
function requestNotifPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendNotification(title, body) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '⚡' });
  }
}

// ─── AUTH SCREEN ───
function AuthScreen({ onLogin, theme }) {
  const t = THEMES[theme];
  const S = getS(t);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!email || !password) { setError('Email aur password dono daalo'); return; }
    if (!isLogin && !name) { setError('Naam daalo'); return; }
    setLoading(true);
    if (isLogin) {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError('Galat email ya password'); setLoading(false); return; }
      onLogin(data.session);
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.session) { onLogin(data.session); }
      else { setSuccess('Verification email bheja hai — inbox + spam check karo. Verify ke baad login karo.'); setIsLogin(true); }
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ background: t.surface, borderRadius: 16, padding: 32, width: '90%', maxWidth: 400, border: '1px solid ' + t.border }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
          <h1 style={{ margin: 0, fontSize: 22, color: t.text, fontWeight: 700 }}>Task Planner</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: t.textSec }}>AI-Powered Business OS</p>
        </div>
        <div style={{ display: 'flex', marginBottom: 20, background: t.inputBg, borderRadius: 8, padding: 3 }}>
          <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: isLogin ? '#6C5CE7' : 'transparent', color: isLogin ? '#fff' : t.textSec }}>Login</button>
          <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: !isLogin ? '#6C5CE7' : 'transparent', color: !isLogin ? '#fff' : t.textSec }}>Sign Up</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isLogin && <input style={S.input} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown} />}
          <input style={S.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
          <input style={S.input} type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
          {error && <div style={{ background: '#ff6b6b18', border: '1px solid #ff6b6b44', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#ff6b6b' }}>{error}</div>}
          {success && <div style={{ background: '#00b89418', border: '1px solid #00b89444', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#00b894' }}>{success}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }}>{loading ? 'Wait...' : isLogin ? 'Login' : 'Create Account'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── FORM ───
function FormPanel({ form, setForm, editTask, onSubmit, onClose, isMobile, t }) {
  const S = getS(t);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000aa' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: t.surface, borderRadius: 16, padding: 24, width: isMobile ? '92%' : 440, maxHeight: '90vh', overflowY: 'auto', border: '1px solid ' + t.border }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: t.text }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.textSec, fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={S.input} placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
          <textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' }} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label style={S.label}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setForm({ ...form, category: c.id })} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid ' + (form.category === c.id ? c.color : t.borderAlt), background: form.category === c.id ? c.color + '18' : 'transparent', color: form.category === c.id ? c.color : t.textSec, fontSize: 12, cursor: 'pointer' }}>{c.icon} {c.name}</button>
            ))}
          </div>
          {(form.category === 'clients' || form.category === 'websites') && (
            <input style={S.input} placeholder={form.category === 'clients' ? 'Client name' : 'Website / Domain'} value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
          )}
          <label style={S.label}>Priority</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['high', 'medium', 'low'].map(p => (
              <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid ' + (form.priority === p ? PRIORITY_COLORS[p] : t.borderAlt), background: form.priority === p ? PRIORITY_COLORS[p] + '18' : 'transparent', color: form.priority === p ? PRIORITY_COLORS[p] : t.textSec, fontSize: 13, cursor: 'pointer' }}>{p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '⚪'} {p[0].toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
          <label style={S.label}>Type</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['daily', 'weekly', 'monthly', 'one-time'].map(tp => (
              <button key={tp} onClick={() => setForm({ ...form, type: tp })} style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, cursor: 'pointer', border: '1px solid ' + (form.type === tp ? '#6C5CE7' : t.borderAlt), background: form.type === tp ? '#6C5CE718' : 'transparent', color: form.type === tp ? '#6C5CE7' : t.textSec }}>{tp[0].toUpperCase() + tp.slice(1)}</button>
            ))}
          </div>
          <label style={S.label}>Deadline</label>
          <input type="date" style={S.input} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          <button onClick={onSubmit} style={S.primaryBtn}>{editTask ? 'Save Changes' : 'Add Task'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── TASK CARD ───
function TaskCard({ task, onToggle, onEdit, onDelete, isMobile, t }) {
  const [exp, setExp] = useState(false);
  const cat = CATEGORIES.find(c => c.id === task.category);
  const overdue = task.deadline && task.deadline < todayStr() && task.status !== 'done';
  return (
    <div style={{ background: t.surface, borderRadius: 10, padding: isMobile ? '10px 12px' : '12px 16px', marginBottom: 6, borderLeft: '3px solid ' + PRIORITY_COLORS[task.priority], opacity: task.status === 'done' ? 0.5 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button onClick={() => onToggle(task.id)} style={{ background: 'none', border: 'none', fontSize: 17, cursor: 'pointer', padding: 0, marginTop: 1 }}>{task.status === 'done' ? '✅' : '⬜'}</button>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExp(!exp)}>
          <div style={{ fontSize: 14, color: t.text, textDecoration: task.status === 'done' ? 'line-through' : 'none', fontWeight: 500 }}>{task.title}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, background: (cat?.color || '#888') + '22', color: cat?.color || '#888', padding: '1px 6px', borderRadius: 4 }}>{cat?.name}</span>
            {task.subcategory && <span style={{ fontSize: 10, color: t.textSec }}>· {task.subcategory}</span>}
            {task.deadline && <span style={{ fontSize: 10, color: overdue ? '#ff6b6b' : t.textSec }}>{overdue ? '⚠️ ' : '📅 '}{task.deadline}</span>}
            <span style={{ fontSize: 10, color: t.textDim }}>{task.type}</span>
          </div>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '4px 6px', opacity: 0.6 }}>✏️</button>
            <button onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '4px 6px', opacity: 0.6 }}>🗑</button>
          </div>
        )}
      </div>
      {exp && (
        <div style={{ marginTop: 8, paddingLeft: 36 }}>
          {task.description && <p style={{ fontSize: 13, color: t.textSec, margin: '0 0 8px', lineHeight: 1.5 }}>{task.description}</p>}
          {isMobile && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(task)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid ' + t.borderAlt, background: 'transparent', color: t.textSec, fontSize: 12, cursor: 'pointer' }}>✏️ Edit</button>
              <button onClick={() => onDelete(task.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ff6b6b33', background: 'transparent', color: '#ff6b6b', fontSize: 12, cursor: 'pointer' }}>🗑 Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Empty({ text, t }) { return <div style={{ textAlign: 'center', padding: 32, color: t.textSec, fontSize: 14 }}>{text}</div>; }

function useWindowWidth() {
  const [w, setW] = useState(1200);
  useEffect(() => { setW(window.innerWidth); const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  return w;
}

// ─── MAIN ───
export default function Home() {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [theme, setTheme] = useState('dark');
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('today');
  const [selectedCat, setSelectedCat] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const notifInterval = useRef(null);

  const t = THEMES[theme];
  const S = getS(t);
  const emptyForm = { title: '', description: '', category: 'personal', subcategory: '', priority: 'medium', deadline: '', type: 'daily' };
  const [form, setForm] = useState(emptyForm);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  // THEME
  useEffect(() => {
    document.body.className = theme;
    const saved = localStorage.getItem('tp-theme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('tp-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // NOTIFICATIONS
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted');
    }
  }, []);

  const enableNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifEnabled(perm === 'granted');
      if (perm === 'granted') {
        sendNotification('⚡ Task Planner', 'Notifications enabled! Ab tumhe task reminders milenge.');
        showToast('Notifications ON ✓');
      }
    }
  };

  // Check deadlines every 30 min
  useEffect(() => {
    if (!notifEnabled || tasks.length === 0) return;
    const check = () => {
      const today = todayStr();
      const dueTasks = tasks.filter(tk => tk.status !== 'done' && tk.deadline === today);
      if (dueTasks.length > 0) {
        sendNotification('⚡ Tasks Due Today!', dueTasks.map(tk => '• ' + tk.title).join('\n'));
      }
      const overdue = tasks.filter(tk => tk.status !== 'done' && tk.deadline && tk.deadline < today);
      if (overdue.length > 0) {
        sendNotification('⚠️ Overdue Tasks!', overdue.length + ' tasks overdue hain. Check karo!');
      }
    };
    check();
    notifInterval.current = setInterval(check, 30 * 60 * 1000);
    return () => clearInterval(notifInterval.current);
  }, [notifEnabled, tasks]);

  // AUTH
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setTasks([]); };

  // TASKS
  const loadTasks = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (!error && data) setTasks(data.map(tk => ({ ...tk, deadline: tk.deadline || '', description: tk.description || '', subcategory: tk.subcategory || '' })));
    setLoading(false);
  }, [session]);

  useEffect(() => { if (session) loadTasks(); }, [session, loadTasks]);

  const addTask = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from('tasks').insert([{ title: form.title, description: form.description, category: form.category, subcategory: form.subcategory, priority: form.priority, type: form.type, deadline: form.deadline || null, status: 'pending', approval_status: 'none', suggested_by: 'user', user_id: session.user.id }]);
    if (!error) { await loadTasks(); setForm({ ...emptyForm, category: form.category, subcategory: form.subcategory }); setShowAdd(false); showToast('Task added ✓'); }
  };

  const updateTask = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from('tasks').update({ title: form.title, description: form.description, category: form.category, subcategory: form.subcategory, priority: form.priority, type: form.type, deadline: form.deadline || null }).eq('id', editTask.id);
    if (!error) { await loadTasks(); setEditTask(null); setForm(emptyForm); setShowAdd(false); showToast('Updated ✓'); }
  };

  const toggleStatus = async (id) => {
    const task = tasks.find(tk => tk.id === id);
    const ns = task.status === 'done' ? 'pending' : 'done';
    await supabase.from('tasks').update({ status: ns, completed_at: ns === 'done' ? new Date().toISOString() : null }).eq('id', id);
    await loadTasks();
  };

  const deleteTask = async (id) => { await supabase.from('tasks').delete().eq('id', id); await loadTasks(); showToast('Deleted'); };

  const startEdit = (task) => { setEditTask(task); setForm({ title: task.title, description: task.description || '', category: task.category, subcategory: task.subcategory || '', priority: task.priority, deadline: task.deadline || '', type: task.type || 'daily' }); setShowAdd(true); };
  const handleFormClose = () => { setShowAdd(false); setEditTask(null); setForm(emptyForm); };

  const getAiPlan = async () => {
    setAiLoading(true);
    const pending = tasks.filter(tk => tk.status !== 'done');
    const summary = pending.map(tk => `[${tk.category}] ${tk.title} (Pri: ${tk.priority}${tk.deadline ? ', DL: ' + tk.deadline : ''}${tk.subcategory ? ', ' + tk.subcategory : ''})`).join('\n');
    try { const res = await fetch('/api/ai-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tasks: summary }) }); const data = await res.json(); setAiPlan(data.plan || 'Response nahi aaya.'); } catch (e) { setAiPlan('AI connect nahi hua.'); }
    setAiLoading(false);
  };

  const getFiltered = () => {
    let f = tasks;
    if (selectedCat) f = f.filter(tk => tk.category === selectedCat);
    if (filter === 'pending') f = f.filter(tk => tk.status !== 'done');
    if (filter === 'done') f = f.filter(tk => tk.status === 'done');
    if (subFilter) f = f.filter(tk => tk.subcategory?.toLowerCase().includes(subFilter.toLowerCase()));
    return f.sort((a, b) => { if ((a.status === 'done') !== (b.status === 'done')) return a.status === 'done' ? 1 : -1; return ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority]; });
  };

  const getTodayTasks = () => tasks.filter(tk => tk.status !== 'done' && (tk.deadline === todayStr() || tk.type === 'daily' || (!tk.deadline && tk.priority === 'high'))).sort((a, b) => ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority]);

  const stats = { total: tasks.length, done: tasks.filter(tk => tk.status === 'done').length, pending: tasks.filter(tk => tk.status !== 'done').length, highPri: tasks.filter(tk => tk.priority === 'high' && tk.status !== 'done').length };
  const catCounts = CATEGORIES.reduce((a, c) => { a[c.id] = tasks.filter(tk => tk.category === c.id && tk.status !== 'done').length; return a; }, {});

  if (authLoading) return <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSec, fontFamily: 'system-ui' }}>Loading...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} theme={theme} />;
  if (loading) return <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSec, fontFamily: 'system-ui' }}>Loading tasks...</div>;

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';

  // SIDEBAR CONTENT
  const SB = ({ mobile }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, color: t.text, fontWeight: 700 }}>⚡ Task Planner</h1>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: t.textSec }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '2px 4px' }} title="Toggle theme">{theme === 'dark' ? '☀️' : '🌙'}</button>
      </div>
      <div style={{ padding: '4px 8px', flex: 1 }}>
        {[{ id: 'today', icon: '📋', label: "Today's Focus" }, { id: 'all', icon: '📁', label: 'All Tasks' }, { id: 'ai', icon: '🤖', label: 'AI Plan' }].map(item => (
          <button key={item.id} onClick={() => { setView(item.id); setSelectedCat(null); if (mobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 2, background: view === item.id && !selectedCat ? '#6C5CE718' : 'transparent', color: view === item.id && !selectedCat ? '#a29bfe' : t.textSec }}><span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}</button>
        ))}
        <div style={{ height: 1, background: t.border, margin: '10px 4px' }} />
        <div style={{ padding: '4px 12px', fontSize: 10, color: t.textDim, fontWeight: 700, letterSpacing: 1 }}>CATEGORIES</div>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setView('category'); setSelectedCat(c.id); setFilter('all'); setSubFilter(''); if (mobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 1, background: selectedCat === c.id ? c.color + '14' : 'transparent', color: selectedCat === c.id ? c.color : t.textSec }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 15 }}>{c.icon}</span>{c.name}</span>
            {catCounts[c.id] > 0 && <span style={{ fontSize: 11, background: c.color + '22', color: c.color, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>{catCounts[c.id]}</span>}
          </button>
        ))}
        {!notifEnabled && (
          <>
            <div style={{ height: 1, background: t.border, margin: '10px 4px' }} />
            <button onClick={enableNotifications} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, background: 'transparent', color: '#ffa502' }}>🔔 Enable Notifications</button>
          </>
        )}
      </div>
      <div style={{ padding: '8px 12px 16px', borderTop: '1px solid ' + t.border }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '0 4px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: '#6C5CE722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#a29bfe', fontWeight: 700 }}>{userName[0].toUpperCase()}</div>
          <span style={{ fontSize: 12, color: t.textSec, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: 11, cursor: 'pointer', padding: '4px 8px' }}>Logout</button>
        </div>
        <button onClick={() => { setShowAdd(true); if (mobile) setSidebarOpen(false); }} style={{ ...S.primaryBtn, fontSize: 13, padding: '10px 0' }}>+ New Task</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {toast && <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#00b894', color: '#fff', padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 200 }}>{toast}</div>}
      {showAdd && <FormPanel form={form} setForm={setForm} editTask={editTask} onSubmit={editTask ? updateTask : addTask} onClose={handleFormClose} isMobile={isMobile} t={t} />}

      {!isMobile && <div style={{ width: 240, background: t.sidebar, borderRight: '1px solid ' + t.border, position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}><SB mobile={false} /></div>}

      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 260, background: t.sidebar, height: '100%', overflowY: 'auto', borderRight: '1px solid ' + t.border }}><SB mobile={true} /></div>
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
              {getTodayTasks().length === 0 && <Empty text="Aaj ke liye koi task nahi. Naya task add karo!" t={t} />}
              {getTodayTasks().map(tk => <TaskCard key={tk.id} task={tk} onToggle={toggleStatus} onEdit={startEdit} onDelete={deleteTask} isMobile={isMobile} t={t} />)}
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
              {(selectedCat === 'clients' || selectedCat === 'websites') && <input style={{ ...S.input, marginBottom: 10 }} placeholder={'Search by ' + (selectedCat === 'clients' ? 'client' : 'site') + '...'} value={subFilter} onChange={e => setSubFilter(e.target.value)} />}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid ' + (filter === f ? '#6C5CE7' : t.borderAlt), background: filter === f ? '#6C5CE718' : 'transparent', color: filter === f ? '#6C5CE7' : t.textSec }}>{f[0].toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              {getFiltered().length === 0 && <Empty text="No tasks here." t={t} />}
              {getFiltered().map(tk => <TaskCard key={tk.id} task={tk} onToggle={toggleStatus} onEdit={startEdit} onDelete={deleteTask} isMobile={isMobile} t={t} />)}
            </>
          )}

          {view === 'all' && (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid ' + (filter === f ? '#6C5CE7' : t.borderAlt), background: filter === f ? '#6C5CE718' : 'transparent', color: filter === f ? '#6C5CE7' : t.textSec }}>{f[0].toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              {CATEGORIES.map(cat => { const ct = getFiltered().filter(tk => tk.category === cat.id); if (!ct.length) return null; return (<div key={cat.id} style={{ marginBottom: 16 }}><h3 style={{ fontSize: 13, color: cat.color, margin: '0 0 8px', fontWeight: 600 }}>{cat.icon} {cat.name} ({ct.length})</h3>{ct.map(tk => <TaskCard key={tk.id} task={tk} onToggle={toggleStatus} onEdit={startEdit} onDelete={deleteTask} isMobile={isMobile} t={t} />)}</div>); })}
              {getFiltered().length === 0 && <Empty text="No tasks found." t={t} />}
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
