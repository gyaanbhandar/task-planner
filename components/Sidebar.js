'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, getS } from '../constants/taskConstants';
import { formatIndianDate } from '../utils/dateUtils';

export default function Sidebar({ mobile, view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd }) {
  const { theme, t, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: t.sidebar, color: t.text, boxSizing: 'border-box', fontFamily: 'inherit' }}>
      
      <div style={{ padding: '22px 18px', borderBottom: '1px solid ' + t.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 16, color: t.text, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C5CE7' }} />
            Task Planner
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: t.textSec }}>{formatIndianDate()}</p>
        </div>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', color: t.textSec, padding: 2 }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ padding: '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        
        {[
          { id: 'today', icon: '📋', label: "Today's Focus" }, 
          { id: 'all', icon: '📁', label: 'All Tasks' }, 
          { id: 'ai', icon: '🤖', label: 'AI Plan' }
        ].map(item => {
          const isActive = view === item.id && !selectedCat;
          return (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id); setSelectedCat(null); if (mobile) setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 600 : 500, background: isActive ? (theme === 'dark' ? '#1E1E24' : '#E4E4E7') : 'transparent', color: isActive ? '#6C5CE7' : t.textSec, textAlign: 'left' }}
            >
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}

        <div style={{ height: 1, background: t.border, margin: '12px 4px' }} />
        <span style={{ fontSize: 11, color: t.textMuted || t.textSec, paddingLeft: 12, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</span>
        
        {CATEGORIES.map(c => {
          const isCatActive = selectedCat === c.id;
          return (
            <button 
              key={c.id} 
              onClick={() => { setView('category'); setSelectedCat(c.id); if (mobile) setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: isCatActive ? 600 : 500, background: isCatActive ? 'rgba(108,92,231,0.08)' : 'transparent', color: isCatActive ? t.text : t.textSec }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </span>
              {catCounts[c.id] > 0 && (
                <span style={{ fontSize: 11, background: t.inputBg, color: c.color, padding: '1px 6px', borderRadius: 6, border: '1px solid ' + t.border, fontWeight: 600 }}>
                  {catCounts[c.id]}
                </span>
              )}
            </button>
          );
        })}

        {!notifEnabled && (
          <button onClick={enableNotifications} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.15)', cursor: 'pointer', fontSize: 12, background: 'transparent', color: '#F59E0B', fontWeight: 500, marginTop: 12 }}>
            🔔 Enable Notifications
          </button>
        )}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid ' + t.border, background: t.sidebar, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#FFFFFF', fontWeight: 700 }}>
            {userName[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Logout</button>
        </div>
        <button onClick={() => { setShowAdd(true); if (mobile) setSidebarOpen(false); }} style={{ width: '100%', background: '#6C5CE7', border: 'none', color: '#FFFFFF', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + New Task
        </button>
      </div>

    </div>
  );
}
