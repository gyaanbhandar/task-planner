// components/Sidebar.js
'use client';
import React from 'react';
import { CATEGORIES, CLIENTS, VISUAL_THEME } from '../constants/taskConstants';
import { formatIndianDate } from '../utils/dateUtils';

export default function Sidebar({ currentView, onViewChange, activeCategory, activeClient, taskCounts, userName, onLogout }) {
  const primaryViews = [
    { id: 'today', icon: '☀️', label: 'Today' },
    { id: 'upcoming', icon: '📅', label: 'Upcoming' },
    { id: 'calendar', icon: '🗓️', label: 'Calendar' },
    { id: 'all_tasks', icon: '📋', label: 'All Tasks' },
    { id: 'ai_planner', icon: '🧠', label: 'AI Planner' },
    { id: 'recurring', icon: '🔄', label: 'Recurring Tasks' }
  ];

  const coreManagementCategories = [
    { id: 'leadgen', name: 'Lead Generation', icon: '🎯' },
    { id: 'health', name: 'Health', icon: '❤️' },
    { id: 'learning', name: 'Learning', icon: '📚' },
    { id: 'finance', name: 'Finance', icon: '💳' },
    { id: 'family', name: 'Family', icon: '🏠' },
    { id: 'travel', name: 'Travel', icon: '✈️' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: VISUAL_THEME.sidebar, borderRight: `1px solid ${VISUAL_THEME.border}`, padding: '24px 16px' }}>
      
      {/* Brand Workspace Identity Asset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingLeft: '8px' }}>
        <div style={{ width: '32px', height: '32px', background: VISUAL_THEME.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: '18px' }}>✓</div>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>Task Planner</h2>
          <p style={{ fontSize: '11px', color: VISUAL_THEME.textSec, margin: 0 }}>by Anukant</p>
        </div>
      </div>

      {/* Navigation Pipeline Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {primaryViews.map(view => {
          const isSelected = currentView === view.id && !activeCategory && !activeClient;
          return (
            <button key={view.id} onClick={() => onViewChange(view.id, null, null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent', color: isSelected ? VISUAL_THEME.accent : VISUAL_THEME.textSec, fontSize: '13px', fontWeight: isSelected ? 600 : 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}>
              <span style={{ fontSize: '16px' }}>{view.icon}</span>
              <span style={{ flex: 1 }}>{view.label}</span>
            </button>
          );
        })}

        {/* Categories Section Node */}
        <div style={{ marginTop: '24px', marginBottom: '6px', fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '12px' }}>Categories</div>
        {CATEGORIES.map(cat => {
          const isSelected = currentView === 'category' && activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => onViewChange('category', cat.id, null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', border: 'none', background: isSelected ? 'rgba(99, 102, 241, 0.04)' : 'transparent', color: isSelected ? VISUAL_THEME.text : VISUAL_THEME.textSec, fontSize: '13px', fontWeight: isSelected ? 600 : 500, cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </span>
            </button>
          );
        })}

        {/* Clients Structural Contexts Row Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', marginBottom: '6px', paddingLeft: '12px', paddingRight: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clients</span>
          <button onClick={() => onViewChange('clients_hub', null, null)} style={{ border: 'none', background: 'transparent', color: VISUAL_THEME.textSec, fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
        </div>
        {CLIENTS.slice(0, 5).map(client => {
          const isSelected = currentView === 'client_workspace' && activeClient === client.id;
          return (
            <button key={client.id} onClick={() => onViewChange('client_workspace', null, client.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: isSelected ? 'rgba(99, 102, 241, 0.04)' : 'transparent', color: isSelected ? VISUAL_THEME.text : VISUAL_THEME.textSec, fontSize: '13px', fontWeight: isSelected ? 600 : 500, cursor: 'pointer' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: client.status === 'Active' ? '#10B981' : '#F59E0B' }} />
              <span>{client.name}</span>
            </button>
          );
        })}
        
        {/* Expanded Dynamic Management Node Block */}
        {coreManagementCategories.map(mCat => (
          <button key={mCat.id} onClick={() => onViewChange('categories_matrix', null, null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            <span>{mCat.icon}</span>
            <span>{mCat.name}</span>
          </button>
        ))}
        
        <button onClick={() => onViewChange('categories_matrix', null, null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: currentView === 'categories_matrix' ? 'rgba(99, 102, 241, 0.04)' : 'transparent', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '8px' }}>
          <span>📂</span>
          <span>Manage Categories</span>
        </button>
        <button onClick={() => onViewChange('notifications', null, null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: currentView === 'notifications' ? 'rgba(99, 102, 241, 0.04)' : 'transparent', color: VISUAL_THEME.textSec, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
          <span>🔔</span>
          <span>Notifications</span>
        </button>
      </div>

      {/* Identity Profile Badge Asset Block */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${VISUAL_THEME.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: VISUAL_THEME.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
          {userName ? userName[0].toUpperCase() : 'A'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: VISUAL_THEME.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || 'Anukant'}</h4>
          <p style={{ fontSize: '11px', color: '#10B981', margin: 0 }}>Free Plan</p>
        </div>
        <button onClick={onLogout} style={{ border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' }} title="Logout">🚪</button>
      </div>

    </div>
  );
}
