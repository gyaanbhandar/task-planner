'use client';

import React, { useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES, CLIENTS, RECURRING_PRESETS, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr, formatIndianDate } from '../utils/dateUtils';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import FormPanel from '../components/FormPanel';
import AuthScreen from '../components/AuthScreen';
import { authService } from '../services/authService';

export default function ModernTaskPlannerOS() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // View states
  const [currentView, setCurrentView] = useState('today'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  
  // Responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Overlays
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedTask, setInspectedTask] = useState(null);
  const [subtasks, setSubtasks] = useState([
    { id: 1, title: 'Crawl the website', completed: true, date: '14 Jul' },
    { id: 2, title: 'Check technical issues', completed: true, date: '14 Jul' },
    { id: 3, title: 'Analyze on-page SEO', completed: false, date: '16 Jul' },
    { id: 4, title: 'Prepare report & recommendations', completed: false, date: '18 Jul' }
  ]);

  const [tasks, setTasks] = useState([
    { id: 't1', title: 'ek SEO ki resource hire karni hai', category: 'personal', subcategory: 'Personal', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '09:00 AM' },
    { id: 't2', title: 'Data compilation', category: 'professional', subcategory: 'Lead Gen', priority: 'high', deadline: '2026-07-19', status: 'pending', time: '11:00 AM' },
    { id: 't3', title: 'Invoice & Client Tracker', category: 'personal', subcategory: 'Personal', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '02:00 PM' },
    { id: 't4', title: 'Daily Task', category: 'work', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-19', status: 'pending', time: '06:00 PM' },
    { id: 't5', title: 'Australian Data base', category: 'professional', subcategory: 'Lead Gen', priority: 'medium', deadline: '2026-07-18', status: 'pending', time: '07:00 PM' },
    { id: 't6', title: 'Follow Week on Week Tracker for Horizon', category: 'clients', subcategory: 'Horizon Solutions', priority: 'low', deadline: '2026-07-19', status: 'pending', time: '07:30 PM' },
  ]);

  // Handle Responsive Window Breakpoints
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    authService.getSession().then((s) => { setSession(s); setAuthLoading(false); });
    const sub = authService.onAuthStateChange((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontSize: '14px', fontWeight: 500, color: '#64748B' }}>Initializing Business OS Engine...</div>;
  if (!session) return <AuthScreen onLogin={s => setSession(s)} />;

  const handleToggleStatus = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (inspectedTask?.id === id) setInspectedTask(null);
  };

  const triggerViewTransition = (viewId, catId = null, clientId = null) => {
    setCurrentView(viewId);
    setActiveCategory(catId);
    setActiveClient(clientId);
    setMobileSidebarOpen(false); // Close drawer on navigation
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: VISUAL_THEME.bg, overflow: 'hidden', position: 'relative' }}>
      
      {/* DESKTOP SIDEBAR: Persistent view */}
      {!isMobile && (
        <div style={{ width: '260px', height: '100%', flexShrink: 0 }}>
          <Sidebar currentView={currentView} onViewChange={triggerViewTransition} activeCategory={activeCategory} activeClient={activeClient} taskCounts={{}} userName={session.user.email} onLogout={() => authService.signOut().then(() => setSession(null))} />
        </div>
      )}

      {/* MOBILE SIDEBAR DRAWEROVERLAY */}
      {isMobile && mobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileSidebarOpen(false)} />
          <div style={{ width: '280px', height: '100%', position: 'relative', zIndex: 1000, animation: 'slideIn 0.2s ease-out' }}>
            <Sidebar currentView={currentView} onViewChange={triggerViewTransition} activeCategory={activeCategory} activeClient={activeClient} taskCounts={{}} userName={session.user.email} onLogout={() => authService.signOut().then(() => setSession(null))} />
          </div>
        </div>
      )}

      {/* RIGHT MAIN CANVAS AREA */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* GLOBAL HEADER BAR */}
        <div style={{ height: '70px', borderBottom: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 40px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '70%' : 'auto' }}>
            {isMobile && (
              <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '4px', color: VISUAL_THEME.text }}>
                ☰
              </button>
            )}
            <div style={{ position: 'relative', width: '100%' }}>
              <input type="text" placeholder={isMobile ? "Search..." : "Search tasks, clients, workspaces..."} style={{ width: isMobile ? '100%' : '280px', padding: '8px 16px 8px 36px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', fontSize: '13px' }} />
              <span style={{ position: 'absolute', left: '12px', top: '9px', fontSize: '14px', color: '#94A3B8' }}>🔍</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => triggerViewTransition('notifications')}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <span style={{ position: 'absolute', top: '-2px', right: '-4px', background: '#EF4444', color: '#FFFFFF', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold' }}>2</span>
            </div>
            <button onClick={() => setShowCreateModal(true)} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: isMobile ? '8px 12px' : '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
              {isMobile ? '+ Add' : '+ New Task'}
            </button>
          </div>
        </div>

        {/* CONTENT VIEWPORT WRAPPER */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '40px' }}>
          
          {/* SCREEN 1: DASHBOARD VIEW */}
          {currentView === 'today' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 700, color: VISUAL_THEME.text, marginBottom: '4px' }}>Good morning, Anukant 👋</h1>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec }}>{formatIndianDate()}</p>
              </div>

              {/* STATS METRIC MATRIX ROW GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Today', count: 6, icon: '📅', bg: '#EEF2FF' },
                  { label: 'Pending', count: 14, icon: '⏳', bg: '#FFFBEB' },
                  { label: 'Upcoming', count: 8, icon: '📆', bg: '#EFF6FF' },
                  { label: 'Completed', count: 3, icon: '✅', bg: '#ECFDF5' },
                  { label: 'Skipped', count: 2, icon: '❌', bg: '#FEF2F2' }
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '14px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gridColumn: isMobile && i === 4 ? '1 / span 2' : 'auto' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: VISUAL_THEME.textSec, display: 'block', marginBottom: '4px' }}>{stat.label}</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: VISUAL_THEME.text }}>{stat.count}</span>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{stat.icon}</div>
                  </div>
                ))}
              </div>

              {/* TODAY REGISTER LIST COMPONENT */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: isMobile ? '16px' : '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: VISUAL_THEME.text }}>Today's Tasks</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tasks.map(t => (
                    <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: UPCOMING CHRONO PLANNER */}
          {currentView === 'upcoming' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Upcoming Tasks</h1>
              {['Tomorrow, 17 July 2026', 'This Week', 'Next Week'].map((segment, sIdx) => (
                <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: VISUAL_THEME.textSec }}>{segment}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tasks.slice(0, 2).map(t => (
                      <TaskCard key={t.id + sIdx} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SCREEN 3: CALENDAR VIEW COMPONENT */}
          {currentView === 'calendar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '16px', overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))', gap: '1px', background: VISUAL_THEME.border, minWidth: '320px' }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                    <div key={d} style={{ background: '#F8FAFC', padding: '6px', fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>{d}</div>
                  ))}
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} style={{ background: '#FFFFFF', minHeight: '50px', padding: '4px', border: `1px solid ${VISUAL_THEME.borderAlt}` }}>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>{i + 1}</span>
                      {i === 15 && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: VISUAL_THEME.accent, margin: '2px auto 0' }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: MASTER ALL TASKS REPOSITORY TABLE */}
          {currentView === 'all_tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>All Tasks</h1>
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, overflowX: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', minWidth: '320px' }}>
                  {tasks.map(t => (
                    <TaskCard key={t.id} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 6: CLIENT WORKSPACE */}
          {currentView === 'client_workspace' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AB</div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>ABC Workspace</h3>
                  <p style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>Client context tracking board logs</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.slice(0, 3).map(t => (
                  <TaskCard key={t.id + '_m_cl'} task={t} onToggle={handleToggleStatus} onSelectDetail={setInspectedTask} onDelete={handleDeleteTask} />
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 8: AI PLANNER ENGINE */}
          {currentView === 'ai_planner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>AI Assistant Planner</h1>
              <div style={{ padding: '20px', background: '#FFFFFF', border: `1px solid ${VISUAL_THEME.border}`, borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, marginBottom: '16px' }}>Let Claude calibrate data modules directly from your active canvas grid frames.</p>
                <button style={{ width: '100%', padding: '12px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}>🤖 Plan My Day</button>
              </div>
            </div>
          )}

          {/* SCREEN 9: RECURRING DASHBOARD TASK */}
          {currentView === 'recurring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Recurring Tasks</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {RECURRING_PRESETS.slice(0, 5).map(preset => (
                  <div key={preset.id} style={{ padding: '14px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0' }}>{preset.title}</h4>
                      <span style={{ fontSize: '11px', color: VISUAL_THEME.accent }}>🔄 {preset.frequency}</span>
                    </div>
                    <input type="checkbox" checked={preset.active} readOnly style={{ accentColor: VISUAL_THEME.accent }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 10: CLIENT PORFOLIO MANAGEMENT HUB */}
          {currentView === 'clients_hub' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Clients Hub</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {CLIENTS.slice(0, 3).map(client => (
                  <div key={client.id} style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}` }} onClick={() => triggerViewTransition('client_workspace', null, client.id)}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>{client.name} Workspace</h3>
                    <span style={{ fontSize: '11px', color: '#10B981' }}>● Health: {client.health}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 11: CATEGORIES ARCHITECTURE GRID MATRIX */}
          {currentView === 'categories_matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Workspaces</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CATEGORIES.map(cat => (
                  <div key={cat.id} style={{ padding: '14px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{cat.name} Context Node</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 12: ALERTS NOTIFICATION CENTER */}
          {currentView === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Alerts Console</h1>
              <div style={{ padding: '14px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, borderLeft: '4px solid #EF4444' }}>
                <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: 700 }}>OVERDUE MIGRATION FAILURE</span>
                <p style={{ fontSize: '12px', margin: '4px 0 0 0', fontWeight: 500 }}>On-page SEO optimization window expired yesterday.</p>
              </div>
            </div>
          )}

        </div>

        {/* SCREEN 7: DRILL-IN INSPECTOR SHEET MODAL OVERLAY (MOBILE OPTIMIZED) */}
        {inspectedTask && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.2)', backdropFilter: 'blur(2px)' }} onClick={() => setInspectedTask(null)} />
            <div style={{ width: isMobile ? '100vw' : '420px', height: '100%', background: '#FFFFFF', position: 'relative', zIndex: 2001, display: 'flex', flexDirection: 'column', animation: 'slideLeft 0.2s ease-out' }}>
              <div style={{ padding: '20px', borderBottom: `1px solid ${VISUAL_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.accent }}>Inspection Sheet</span>
                <button onClick={() => setInspectedTask(null)} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{inspectedTask.title}</h3>
                <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, lineHeight: 1.5, marginBottom: '20px' }}>Drill-down optimization tracking context blocks render seamlessly inside responsive matrices.</p>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
                  <strong>Time Track Log:</strong> 02:30 hrs active
                </div>
              </div>
              <div style={{ padding: '20px', borderTop: `1px solid ${VISUAL_THEME.border}` }}>
                <button onClick={() => { handleToggleStatus(inspectedTask.id); setInspectedTask(null); }} style={{ width: '100%', padding: '12px', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}>Mark Complete ✓</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* SCREEN 5: CREATE CONTEXTUAL ACTION MODAL */}
      {showCreateModal && (
        <FormPanel form={{ title: '', description: '', category: 'personal', subcategory: '', priority: 'medium', deadline: todayStr(), type: 'daily' }} setForm={() => {}} editTask={null} onSubmit={() => setShowCreateModal(false)} onClose={() => setShowCreateModal(false)} isMobile={isMobile} />
      )}

      {/* Global Embedded Keyframes CSS Injection for CSS transitions */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

    </div>
  );
}
