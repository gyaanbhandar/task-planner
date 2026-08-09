'use client';
import React, { useState } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function Sidebar({ 
  currentView, onViewChange, activeCategory, activeClient, 
  userName, userFullName, onLogout, customCategories, clientsList, userProfile 
}) {
  const [clientsExpanded, setClientsExpanded] = useState(true);
  
  // Show actual name from profile, not email
  const displayName = userFullName || (userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'User');
  const planLabel = userProfile?.subscription_plan === 'pro' ? 'Pro' : userProfile?.subscription_plan === 'starter' ? 'Starter' : 'Trial';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: VISUAL_THEME.sidebar, borderRight: `1px solid ${VISUAL_THEME.border}`, padding: '24px 16px', boxSizing: 'border-box' }}>
      
      {/* Logo — Click to go to Today's Tasks */}
      <div 
        onClick={() => onViewChange('today', null, null)}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingLeft: '8px', cursor: 'pointer' }}
      >
        <div style={{ width: '34px', height: '34px', borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
          <svg viewBox="0 0 120 120" width="34" height="34" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="22" fill="#6366F1"/>
            <path d="M30 78L50 42L60 58L70 42L90 78" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M52 72L65 52L78 72" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <g transform="translate(60,30)">
              <circle r="3" fill="#FF8A00"/>
              <line x1="0" y1="-6" x2="0" y2="-10" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="5.2" y1="-3" x2="8.7" y2="-5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="5.2" y1="3" x2="8.7" y2="5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="-5.2" y1="-3" x2="-8.7" y2="-5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="-5.2" y1="3" x2="-8.7" y2="5" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round"/>
            </g>
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#312E81', margin: 0, letterSpacing: '-0.3px' }}>AnuTask</h2>
          <p style={{ fontSize: '10px', color: VISUAL_THEME.textSec, margin: 0 }}>Smart SaaS OS by Anukant</p>
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
        
        {(customCategories || []).map(c => {
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
                {clientsExpanded && (clientsList || []).map(cl => (
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
        </div>
      </div>

      {/* Bottom User Section — Click name to open Settings */}
      <div style={{ marginTop: '16px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '12px' }}>
        <div 
          onClick={() => onViewChange('settings', null, null)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', 
            borderRadius: '10px', cursor: 'pointer', 
            background: currentView === 'settings' ? 'rgba(99,102,241,0.06)' : 'transparent',
            transition: 'background 0.15s'
          }}
        >
          <div style={{ width: '36px', height: '36px', background: 'rgba(99,102,241,0.1)', color: VISUAL_THEME.accent, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
            {displayName[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: VISUAL_THEME.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {displayName}
              <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: planLabel === 'Pro' ? '#EEF2FF' : planLabel === 'Starter' ? '#ECFDF5' : '#FEF3C7', color: planLabel === 'Pro' ? '#4338CA' : planLabel === 'Starter' ? '#059669' : '#D97706', fontWeight: 700, flexShrink: 0 }}>{planLabel}</span>
            </div>
            <div style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>Settings & Profile</div>
          </div>
          <span style={{ fontSize: '14px', color: VISUAL_THEME.textSec }}>⚙️</span>
        </div>
        
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', marginTop: '8px', padding: '8px 12px', background: '#FEF2F2', border: 'none', borderRadius: '8px', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          ⏻ Logout
        </button>
      </div>
    </div>
  );
}
