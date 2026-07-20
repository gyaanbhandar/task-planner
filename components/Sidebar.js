'use client';
import React, { useState } from 'react';
import { CATEGORIES, CLIENTS, VISUAL_THEME } from '../constants/taskConstants';

export default function Sidebar({ currentView, onViewChange, activeCategory, activeClient, userName, onLogout }) {
  const [clientsExpanded, setClientsExpanded] = useState(true);
  const cleanName = userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'Anukant';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: VISUAL_THEME.sidebar, borderRight: `1px solid ${VISUAL_THEME.border}`, padding: '24px 16px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingLeft: '8px' }}>
        <div style={{ width: '32px', height: '32px', background: VISUAL_THEME.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: '18px' }}>✓</div>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>Task Planner</h2>
          <p style={{ fontSize: '11px', color: VISUAL_THEME.textSec, margin: 0 }}>by {cleanName}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
        {[
          { id: 'today', label: 'Today', icon: '☀️' },
          { id: 'upcoming', label: 'Upcoming Tasks', icon: '📅' },
          { id: 'calendar', label: 'Calendar View', icon: '🗓️' },
          { id: 'all_tasks', label: 'All Tasks', icon: '📋' },
          { id: 'ai_planner', label: 'AI Planner', icon: '🧠' },
          { id: 'recurring', label: 'Recurring Tasks', icon: '🔄' }
        ].map(v => {
          const isSelected = currentView === v.id && !activeCategory && !activeClient;
          return (
            <button key={v.id} onClick={() => onViewChange(v.id, null, null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent', color: isSelected ? VISUAL_THEME.accent : VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <span>{v.icon}</span><span>{v.label}</span>
            </button>
          );
        })}

        <div style={{ marginTop: '20px', marginBottom: '6px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '12px' }}>Categories</div>
        
        {CATEGORIES.map(c => {
          if (c.id === 'clients') {
            const isClientsViewActive = currentView === 'category' && activeCategory === 'clients' && !activeClient;
            return (
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: isClientsViewActive ? 'rgba(99, 102, 241, 0.04)' : 'transparent' }}>
                  <button onClick={() => onViewChange('category', 'clients', null)} style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '12px', padding: 0, color: VISUAL_THEME.text, fontSize: '13px', fontWeight: isClientsViewActive ? 600 : 400, cursor: 'pointer', textAlign: 'left', flex: 1 }}>
                    <span>{c.icon}</span><span>{c.name}</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setClientsExpanded(!clientsExpanded); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: VISUAL_THEME.textSec, fontSize: '11px', padding: '0 4px' }}>
                    {clientsExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {clientsExpanded && CLIENTS.map(cl => (
                  <button key={cl.id} onClick={() => onViewChange('client_workspace', 'clients', cl.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 28px', borderRadius: '6px', border: 'none', background: currentView === 'client_workspace' && activeClient === cl.id ? '#F4F4F5' : 'transparent', color: VISUAL_THEME.textSec, fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: VISUAL_THEME.accent }} />
                    <span>{cl.name}</span>
                  </button>
                ))}
              </div>
            );
          }

          return (
            <button key={c.id} onClick={() => onViewChange('category', c.id, null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: currentView === 'category' && activeCategory === c.id ? 'rgba(99, 102, 241, 0.04)' : 'transparent', color: VISUAL_THEME.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
              <span>{c.icon}</span><span>{c.name}</span>
            </button>
          );
        })}

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${VISUAL_THEME.border}` }}>
          <button onClick={() => onViewChange('manage_categories', null, null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', width: '100%', border: 'none', background: currentView === 'manage_categories' ? '#F4F4F5' : 'transparent', fontSize: '13px', color: VISUAL_THEME.textSec, cursor: 'pointer', textAlign: 'left', borderRadius: '8px' }}>📂 Manage Categories</button>
          <button onClick={() => onViewChange('notifications', null, null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', width: '100%', border: 'none', background: currentView === 'notifications' ? '#F4F4F5' : 'transparent', fontSize: '13px', color: VISUAL_THEME.textSec, cursor: 'pointer', textAlign: 'left', borderRadius: '8px' }}>🔔 Notifications Center</button>
        </div>
      </div>

      <div style={{ marginTop: '16px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.1)', color: VISUAL_THEME.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>{cleanName[0]}</div>
          <span style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cleanName}</span>
        </div>
        <button onClick={onLogout} style={{ background: '#FEE2E2', border: 'none', borderRadius: '6px', width: '28px', height: '28px', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏻</button>
      </div>
    </div>
  );
}
