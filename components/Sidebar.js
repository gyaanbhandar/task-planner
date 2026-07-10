'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, getS } from '../constants/taskConstants';
import { formatIndianDate } from '../utils/dateUtils';

export default function Sidebar({ mobile, view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd }) {
  const { theme, t, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: t.sidebar, color: t.text, boxSizing: 'border-box' }}>
      
      <div style={{ padding: '20px 16px', borderBottom: '1px solid ' + t.border, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 14, color: t.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '-0.2px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6C5CE7' }} />
            Task Planner
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 10, fontFamily: 'monospace', color: t.textSec }}>{formatIndianDate()}</p>
        </div>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: t.textSec, padding: 2 }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <span style={{ fontSize: 9, fontFamily: 'monospace', color: t.textDim, letterSpacing: '0.5px', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 2, fontWeight: 600 }}>Scopes</span>
        
        {[
          { id: 'today', icon: '📋', label: "Today's Focus" }, 
          { id: 'all', icon: '📁', label: 'All Indices' }, 
          { id: 'ai', icon: '🤖', label: 'AI Optimizer' }
        ].map(item => {
          const isActive = view === item.id && !selectedCat;
          return (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id); setSelectedCat(null); if (mobile) setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 600 : 500, background: isActive ? (theme === 'dark' ? '#18181C' : '#E4E4E7') : 'transparent', color: isActive ? t.text : t.textSec, textAlign: 'left' }}
            >
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}

        <div style={{ height: 1, background: t.border, margin: '8px 4px' }} />
        <span style={{ fontSize: 9, fontFamily: 'monospace', color: t.textDim, letterSpacing: '0.5px', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 2, fontWeight: 600 }}>Categories</span>
        
        {CATEGORIES.map(c => {
          const isCatActive = selectedCat === c.id;
          return (
            <button 
              key={c.id} 
              onClick={() => { setView('category'); setSelectedCat(c.id); if (mobile) setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: isCatActive ? 600 : 500, background: isCatActive ? (theme === 'dark' ? '#141417' : '#E4E4E7') : 'transparent', color: isCatActive ? t.text : t.textSec }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </span>
              {catCounts[c.id] > 0 && (
                <span style={{ fontSize: 10, fontFamily: 'monospace', background: t.inputBg, color: t.textSec, padding: '0px 4px', borderRadius: 4, border: '1px solid ' + t.border }}>
                  {catCounts[c.id]}
                </span>
              )}
            </button>
          );
        })}

        {!notifEnabled && (
          <button onClick={enableNotifications} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.15)', cursor: 'pointer', fontSize: 11, background: 'transparent', color: '#F59E0B', fontWeight: 500, marginTop: 8 }}>
            🔔 Sync Reminders
          </button>
        )}
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid ' + t.border, background: t.sidebar, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#FFFFFF', fontWeight: 700 }}>
            {userName[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: t.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 10, fontWeight: 500, cursor: 'pointer', padding: 2 }}>Exit</button>
        </div>
        <button onClick={() => { setShowAdd(true); if (mobile) setSidebarOpen(false); }} style={{ width: '100%', background: '#6C5CE7', border: 'none', color: '#FFFFFF', padding: '7px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
          + New Directive
        </button>
      </div>

    </div>
  );
}
