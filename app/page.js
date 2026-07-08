'use client';
import { useState, useEffect, useCallback } from 'react';
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

function useWindowWidth() {
  const [w, setW] = useState(1200);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

export default function Home() {
  const width = useWindowWidth();
  const isMobile = width < 768;
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

  const emptyForm = { title: '', description: '', category: 'personal', subcategory: '', priority: 'medium', deadline: '', type: 'daily' };
  const [form, setForm] = useState(emptyForm);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  // LOAD TASKS FROM SUPABASE
  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setTasks(data.map(t => ({
        ...t,
        deadline: t.deadline || '',
        description: t.description || '',
        subcategory: t.subcategory || '',
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // ADD TASK
  const addTask = async () => {
    if (!form.title.trim()) return;
    const newTask = {
      title: form.title,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory,
      priority: form.priority,
      type: form.type,
      deadline: form.deadline || null,
      status: 'pending',
      approval_status: 'none',
      suggested_by: 'user',
    };
    const { error } = await supabase.from('tasks').insert([newTask]);
    if (!error) {
      await loadTasks();
      setForm({ ...emptyForm, category: form.category, subcategory: form.subcategory });
      setShowAdd(false);
      showToast('Task added ✓');
    }
  };

  // UPDATE TASK
  const updateTask = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from('tasks').update({
      title: form.title,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory,
      priority: form.priority,
      type: form.type,
      deadline: form.deadline || null,
    }).eq('id', editTask.id);
    if (!error) {
      await loadTasks();
      setEditTask(null);
      setForm(emptyForm);
      setShowAdd(false);
      showToast('Updated ✓');
    }
  };

  // TOGGLE STATUS
  const toggleStatus = async (id) => {
    const task = tasks.find(t => t.id === id);
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    const { error } = await supabase.from('tasks').update({
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    }).eq('id', id);
    if (!error) await loadTasks();
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) { await loadTasks(); showToast('Deleted'); }
  };

  const startEdit = (task) => {
    setEditTask(task);
    setForm({ title: task.title, description: task.description || '', category: task.category, subcategory: task.subcategory || '', priority: task.priority, deadline: task.deadline || '', type: task.type || 'daily' });
    setShowAdd(true);
  };

  // AI PLAN
  const getAiPlan = async () => {
    setAiLoading(true);
    const pending = tasks.filter(t => t.status !== 'done');
    const summary = pending.map(t => `[${t.category}] ${t.title} (Pri: ${t.priority}${t.deadline ? ', DL: ' + t.deadline : ''}${t.subcategory ? ', ' + t.subcategory : ''})`).join('\n');
    try {
      const res = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: summary }),
      });
      const data = await res.json();
      setAiPlan(data.plan || 'Response nahi aaya.');
    } catch (e) {
      setAiPlan('AI connect nahi hua. Khud prioritize karo.');
    }
    setAiLoading(false);
  };

  // FILTERS
  const getFiltered = () => {
    let f = tasks;
    if (selectedCat) f = f.filter(t => t.category === selectedCat);
    if (filter === 'pending') f = f.filter(t => t.status !== 'done');
    if (filter === 'done') f = f.filter(t => t.status === 'done');
    if (subFilter) f = f.filter(t => t.subcategory?.toLowerCase().includes(subFilter.toLowerCase()));
    return f.sort((a, b) => {
      if ((a.status === 'done') !== (b.status === 'done')) return a.status === 'done' ? 1 : -1;
      return ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority];
    });
  };

  const getTodayTasks = () =>
    tasks.filter(t => t.status !== 'done' && (t.deadline === todayStr() || t.type === 'daily' || (!t.deadline && t.priority === 'high')))
      .sort((a, b) => ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority]);

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    pending: tasks.filter(t => t.status !== 'done').length,
    highPri: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
  };

  const catCounts = CATEGORIES.reduce((a, c) => { a[c.id] = tasks.filter(t => t.category === c.id && t.status !== 'done').length; return a; }, {});

  if (loading) return <div style={{ background: '#0F1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B8D97' }}>Loading...</div>;

  // FORM MODAL
  const FormPanel = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000aa' }}
      onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); setEditTask(null); } }}>
      <div style={{ background: '#1A1D27', borderRadius: 16, padding: 24, width: isMobile ? '92%' : 440, maxHeight: '90vh', overflowY: 'auto', border: '1px solid #2a2d3a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#E8E8ED' }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={() => { setShowAdd(false); setEditTask(null); }} style={{ background: 'none', border: 'none', color: '#8B8D97', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={S.input} placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' }} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label style={S.label}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setForm({ ...form, category: c.id })} style={{
                padding: '5px 10px', borderRadius: 8, border: '1px solid ' + (form.category === c.id ? c.color : '#2a2d3a'),
                background: form.category === c.id ? c.color + '18' : 'transparent', color: form.category === c.id ? c.color : '#8B8D97', fontSize: 12, cursor: 'pointer',
              }}>{c.icon} {c.name}</button>
            ))}
          </div>
          {(form.category === 'clients' || form.category === 'websites') && (
            <input style={S.input} placeholder={form.category === 'clients' ? 'Client name' : 'Website / Domain'} value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
          )}
          <label style={S.label}>Priority</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['high', 'medium', 'low'].map(p => (
              <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{
                flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid ' + (form.priority === p ? PRIORITY_COLORS[p] : '#2a2d3a'),
                background: form.priority === p ? PRIORITY_COLORS[p] + '18' : 'transparent', color: form.priority === p ? PRIORITY_COLORS[p] : '#8B8D97', fontSize: 13, cursor: 'pointer',
              }}>{p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '⚪'} {p[0].toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
          <label style={S.label}>Type</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['daily', 'weekly', 'monthly', 'one-time'].map(t => (
              <button key={t} onClick={() => setForm({ ...form, type: t })} style={{
                flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                border: '1px solid ' + (form.type === t ? '#6C5CE7' : '#2a2d3a'),
                background: form.type === t ? '#6C5CE718' : 'transparent', color: form.type === t ? '#6C5CE7' : '#8B8D97',
              }}>{t[0].toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
          <label style={S.label}>Deadline</label>
          <input type="date" style={S.input} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          <button onClick={editTask ? updateTask : addTask} style={S.primaryBtn}>{editTask ? 'Save Changes' : 'Add Task'}</button>
        </div>
      </div>
    </div>
  );

  // SIDEBAR
  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 16px 12px' }}>
        <h1 style={{ margin: 0, fontSize: 17, color: '#E8E8ED', fontWeight: 700 }}>⚡ Task Planner</h1>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8B8D97' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <div style={{ padding: '4px 8px', flex: 1 }}>
        {[{ id: 'today', icon: '📋', label: "Today's Focus" }, { id: 'all', icon: '📁', label: 'All Tasks' }, { id: 'ai', icon: '🤖', label: 'AI Plan' }].map(item => (
          <button key={item.id} onClick={() => { setView(item.id); setSelectedCat(null); if (isMobile) setSidebarOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 2,
              background: view === item.id && !selectedCat ? '#6C5CE718' : 'transparent', color: view === item.id && !selectedCat ? '#a29bfe' : '#8B8D97',
            }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
          </button>
        ))}
        <div style={{ height: 1, background: '#1e2130', margin: '10px 4px' }} />
        <div style={{ padding: '4px 12px', fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1 }}>CATEGORIES</div>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setView('category'); setSelectedCat(c.id); setFilter('all'); setSubFilter(''); if (isMobile) setSidebarOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 1,
              background: selectedCat === c.id ? c.color + '14' : 'transparent', color: selectedCat === c.id ? c.color : '#8B8D97',
            }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 15 }}>{c.icon}</span>{c.name}</span>
            {catCounts[c.id] > 0 && <span style={{ fontSize: 11, background: c.color + '22', color: c.color, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>{catCounts[c.id]}</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 12px 16px' }}>
        <button onClick={() => { setShowAdd(true); if (isMobile) setSidebarOpen(false); }} style={{ ...S.primaryBtn, fontSize: 13, padding: '10px 0' }}>+ New Task</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0F1117', minHeight: '100vh', display: 'flex' }}>
      {toast && <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#00b894', color: '#fff', padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 200 }}>{toast}</div>}
      {showAdd && <FormPanel />}

      {!isMobile && (
        <div style={{ width: 240, background: '#14161F', borderRight: '1px solid #1e2130', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
          <SidebarContent />
        </div>
      )}

      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 260, background: '#14161F', height: '100%', overflowY: 'auto', borderRight: '1px solid #1e2130' }}><SidebarContent /></div>
          <div style={{ flex: 1, background: '#00000066' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', height: isMobile ? 'auto' : '100vh', minHeight: '100vh', paddingBottom: isMobile ? 80 : 24 }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#14161F', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #1e2130' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#8B8D97', fontSize: 22, cursor: 'pointer', padding: 0 }}>☰</button>
            <h2 style={{ margin: 0, fontSize: 15, color: '#E8E8ED', fontWeight: 600 }}>
              {view === 'today' ? '📋 Today' : view === 'ai' ? '🤖 AI Plan' : view === 'all' ? '📁 All' : selectedCat ? (CATEGORIES.find(c => c.id === selectedCat)?.icon + ' ' + CATEGORIES.find(c => c.id === selectedCat)?.name) : 'Tasks'}
            </h2>
            <button onClick={() => setShowAdd(true)} style={{ background: '#6C5CE7', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: 8, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        )}

        <div style={{ padding: isMobile ? '12px 14px' : '24px 32px', maxWidth: 860, margin: '0 auto' }}>
          {!isMobile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, color: '#E8E8ED', fontWeight: 700 }}>
                  {view === 'today' ? "Today's Focus" : view === 'ai' ? 'AI Daily Plan' : view === 'all' ? 'All Tasks' : selectedCat ? (CATEGORIES.find(c => c.id === selectedCat)?.icon + ' ' + CATEGORIES.find(c => c.id === selectedCat)?.name) : 'Tasks'}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#8B8D97' }}>{stats.pending} pending · {stats.done} completed</p>
              </div>
              <button onClick={() => setShowAdd(true)} style={{ ...S.primaryBtn, width: 'auto', padding: '10px 24px', fontSize: 13 }}>+ New Task</button>
            </div>
          )}

          {/* TODAY */}
          {view === 'today' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: isMobile ? 8 : 12, marginBottom: 16 }}>
                {[{ l: 'Total', v: stats.total, c: '#E8E8ED' }, { l: 'Done', v: stats.done, c: '#00b894' }, { l: 'Pending', v: stats.pending, c: '#ffa502' }, { l: 'Urgent', v: stats.highPri, c: '#ff6b6b' }].map(s => (
                  <div key={s.l} style={{ background: '#1A1D27', borderRadius: 10, padding: isMobile ? '10px 6px' : '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: '#8B8D97', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setView('ai')} style={{
                display: 'block', width: '100%', padding: isMobile ? '12px 14px' : '14px 18px', marginBottom: 16,
                background: 'linear-gradient(135deg, #6C5CE714, #a29bfe14)', border: '1px solid #6C5CE733', borderRadius: 10,
                color: '#a29bfe', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
              }}>🤖 AI se aaj ka plan banwao →</button>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: isMobile ? 8 : 10, marginBottom: isMobile ? 14 : 20 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setView('category'); setSelectedCat(c.id); }} style={{
                    background: '#1A1D27', border: '1px solid ' + c.color + '33', borderRadius: 10, padding: isMobile ? '10px 8px' : '14px 12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', gap: isMobile ? 3 : 4,
                  }}>
                    <span style={{ fontSize: isMobile ? 18 : 22 }}>{c.icon}</span>
                    <span style={{ fontSize: isMobile ? 11 : 13, color: '#E8E8ED', fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontSize: isMobile ? 10 : 11, color: c.color }}>{catCounts[c.id]} pending</span>
                  </button>
                ))}
              </div>
              <h3 style={{ fontSize: 13, color: '#8B8D97', margin: '0 0 8px', fontWeight: 600, letterSpacing: 0.5 }}>TODAY&apos;S TASKS</h3>
              {getTodayTasks().length === 0 && <Empty text="Aaj ke liye koi task nahi. Naya task add karo!" />}
              {getTodayTasks().map(t => <TaskCard key={t.id} task={t} onToggle={toggleStatus} onEdit={startEdit} onDelete={deleteTask} isMobile={isMobile} />)}
            </>
          )}

          {/* AI */}
          {view === 'ai' && (
            <div style={{ maxWidth: 600 }}>
              {!aiPlan && !aiLoading && (
                <div style={{ textAlign: 'center', padding: isMobile ? '30px 12px' : '50px 20px' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>🧠</div>
                  <p style={{ color: '#8B8D97', marginBottom: 20, lineHeight: 1.7, fontSize: 14 }}>AI tumhare saare pending tasks analyze karke batayega ki aaj kya karna chahiye.</p>
                  <button onClick={getAiPlan} style={{ ...S.primaryBtn, width: 'auto', padding: '12px 32px' }}>Generate Today&apos;s Plan</button>
                </div>
              )}
              {aiLoading && <div style={{ textAlign: 'center', padding: 50, color: '#8B8D97' }}>🤖 Analyzing tasks...</div>}
              {aiPlan && (
                <div style={{ background: '#1A1D27', borderRadius: 12, padding: isMobile ? 16 : 24, border: '1px solid #6C5CE733' }}>
                  <div style={{ color: '#6C5CE7', fontSize: 12, marginBottom: 10, fontWeight: 700, letterSpacing: 0.5 }}>AI RECOMMENDATION</div>
                  <div style={{ color: '#E8E8ED', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 14 }}>{aiPlan}</div>
                  <button onClick={getAiPlan} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid #6C5CE744', background: 'transparent', color: '#6C5CE7', fontSize: 13, cursor: 'pointer' }}>🔄 Regenerate</button>
                </div>
              )}
            </div>
          )}

          {/* CATEGORY */}
          {view === 'category' && selectedCat && (
            <>
              {(selectedCat === 'clients' || selectedCat === 'websites') && (
                <input style={{ ...S.input, marginBottom: 10 }} placeholder={'Search by ' + (selectedCat === 'clients' ? 'client' : 'site') + ' name...'} value={subFilter} onChange={e => setSubFilter(e.target.value)} />
              )}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    border: '1px solid ' + (filter === f ? '#6C5CE7' : '#2a2d3a'),
                    background: filter === f ? '#6C5CE718' : 'transparent', color: filter === f ? '#6C5CE7' : '#8B8D97',
                  }}>{f[0].toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              {getFiltered().length === 0 && <Empty text="No tasks in this category." />}
              {getFiltered().map(t => <TaskCard key={t.id} task={t} onToggle={toggleStatus} onEdit={startEdit} onDelete={deleteTask} isMobile={isMobile} />)}
            </>
          )}

          {/* ALL */}
          {view === 'all' && (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['all', 'pending', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    border: '1px solid ' + (filter === f ? '#6C5CE7' : '#2a2d3a'),
                    background: filter === f ? '#6C5CE718' : 'transparent', color: filter === f ? '#6C5CE7' : '#8B8D97',
                  }}>{f[0].toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              {CATEGORIES.map(cat => {
                const ct = getFiltered().filter(t => t.category === cat.id);
                if (!ct.length) return null;
                return (
                  <div key={cat.id} style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 13, color: cat.color, margin: '0 0 8px', fontWeight: 600 }}>{cat.icon} {cat.name} ({ct.length})</h3>
                    {ct.map(t => <TaskCard key={t.id} task={t} onToggle={toggleStatus} onEdit={startEdit} onDelete={deleteTask} isMobile={isMobile} />)}
                  </div>
                );
              })}
              {getFiltered().length === 0 && <Empty text="No tasks found." />}
            </>
          )}
        </div>
      </div>

      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, background: '#14161F', borderTop: '1px solid #1e2130',
          display: 'flex', justifyContent: 'space-around', padding: '6px 0 8px', zIndex: 20,
        }}>
          {[{ id: 'today', icon: '📋', l: 'Today' }, { id: 'all', icon: '📁', l: 'All' }, { id: 'ai', icon: '🤖', l: 'AI Plan' }].map(i => (
            <button key={i.id} onClick={() => { setView(i.id); setSelectedCat(null); setSidebarOpen(false); }}
              style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '4px 20px', color: view === i.id ? '#6C5CE7' : '#8B8D97' }}>
              <span style={{ fontSize: 18 }}>{i.icon}</span>
              <span style={{ fontSize: 10, fontWeight: view === i.id ? 600 : 400 }}>{i.l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete, isMobile }) {
  const [exp, setExp] = useState(false);
  const cat = CATEGORIES.find(c => c.id === task.category);
  const overdue = task.deadline && task.deadline < todayStr() && task.status !== 'done';

  return (
    <div style={{
      background: '#1A1D27', borderRadius: 10, padding: isMobile ? '10px 12px' : '12px 16px', marginBottom: 6,
      borderLeft: '3px solid ' + PRIORITY_COLORS[task.priority], opacity: task.status === 'done' ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button onClick={() => onToggle(task.id)} style={{ background: 'none', border: 'none', fontSize: 17, cursor: 'pointer', padding: 0, marginTop: 1 }}>
          {task.status === 'done' ? '✅' : '⬜'}
        </button>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExp(!exp)}>
          <div style={{ fontSize: 14, color: '#E8E8ED', textDecoration: task.status === 'done' ? 'line-through' : 'none', fontWeight: 500 }}>{task.title}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, background: (cat?.color || '#888') + '22', color: cat?.color || '#888', padding: '1px 6px', borderRadius: 4 }}>{cat?.name}</span>
            {task.subcategory && <span style={{ fontSize: 10, color: '#8B8D97' }}>· {task.subcategory}</span>}
            {task.deadline && <span style={{ fontSize: 10, color: overdue ? '#ff6b6b' : '#8B8D97' }}>{overdue ? '⚠️ ' : '📅 '}{task.deadline}</span>}
            <span style={{ fontSize: 10, color: '#555' }}>{task.type}</span>
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
          {task.description && <p style={{ fontSize: 13, color: '#8B8D97', margin: '0 0 8px', lineHeight: 1.5 }}>{task.description}</p>}
          {isMobile && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(task)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #2a2d3a', background: 'transparent', color: '#8B8D97', fontSize: 12, cursor: 'pointer' }}>✏️ Edit</button>
              <button onClick={() => onDelete(task.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ff6b6b33', background: 'transparent', color: '#ff6b6b', fontSize: 12, cursor: 'pointer' }}>🗑 Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ textAlign: 'center', padding: 32, color: '#8B8D97', fontSize: 14 }}>{text}</div>;
}

const S = {
  input: { background: '#0F1117', border: '1px solid #2a2d3a', borderRadius: 8, padding: '10px 12px', color: '#E8E8ED', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  label: { fontSize: 11, color: '#8B8D97', fontWeight: 700, letterSpacing: 0.3 },
  primaryBtn: { background: '#6C5CE7', border: 'none', borderRadius: 10, padding: '12px 0', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' },
};
