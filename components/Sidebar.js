'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, getS } from '../constants/taskConstants';
import { formatIndianDate } from '../utils/dateUtils';

export default function Sidebar({ mobile, view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd }) {
  const { theme, t, toggleTheme } = useTheme();
  const S = getS(t);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: t.sidebar, color: t.text, fontFamily: 'inherit' }}>
      
      <div style={{ padding: '24px 20px 16px', display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid ' + t.border }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 15, color: t.text, fontWeight: 700, tracking: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C5CE7', display: 'inline-block' }} />
            Task Planner
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 10, fontFamily: 'monospace', color: t.textSec, textTransform: 'uppercase' }}>{formatIndianDate()}</p>
        </div>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: t.textSec }} title="Toggle System Theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 9, fontFamily: 'monospace', color: t.textDim, letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 4 }}>Scopes</span>
        
        {[
          { id: 'today', icon: '📋', label: "Today's Focus" }, 
          { id: 'all', icon: '📁', label: 'All Indices' }, 
          { id: 'ai', icon: '🤖', label: 'AI Optimization' }
        ].map(item => {
          const isActive = view === item.id && !selectedCat;
          return (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id); setSelectedCat(null); if (mobile) setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 10, border: isActive ? '1px solid ' + t.border : '1px solid transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: isActive ? (theme === 'dark' ? '#1E1E24' : '#E4E4E7') : 'transparent', color: isActive ? '#6C5CE7' : t.textSec, textAlign: 'left' }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}

        <div style={{ height: 1, background: t.border, margin: '12px 4px' }} />
        <span style={{ fontSize: 9, fontFamily: 'monospace', color: t.textDim, letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 4 }}>Categories</span>
        
        {CATEGORIES.map(c => {
          const isCatActive = selectedCat === c.id;
          return (
            <button 
              key={c.id} 
              onClick={() => { setView('category'); setSelectedCat(c.id); if (mobile) setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', width: '100%', padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: isCatActive ? 'rgba(108,92,231,0.08)' : 'transparent', color: isCatActive ? c.color : t.textSec }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ opacity: isCatActive ? 1 : 0.6 }}>{c.icon}</span>
                <span>{c.name}</span>
              </span>
              {catCounts[c.id] > 0 && (
                <span style={{ fontSize: 10, fontFamily: 'monospace', background: t.inputBg, color: c.color, padding: '1px 6px', borderRadius: 6, border: '1px solid ' + t.border }}>
                  {catCounts[c.id]}
                </span>
              )}
            </button>
          );
        })}

        {!notifEnabled && (
          <>
            <div style={{ height: 1, background: t.border, margin: '12px 4px' }} />
            <button onClick={enableNotifications} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', cursor: 'pointer', fontSize: 12, background: 'rgba(245,158,11,0.04)', color: '#F59E0B', fontWeight: 500 }}>
              🔔 Sync Reminders
            </button>
          </>
        )}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid ' + t.border, background: t.sidebar, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#FFFFFF', fontWeight: 700 }}>
            {userName[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: t.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: t.textSec }}>NODE CONTEXT</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Exit</button>
        </div>
        <button onClick={() => { setShowAdd(true); if (mobile) setSidebarOpen(false); }} style={{ width: '100%', background: '#6C5CE7', border: 'none', color: '#FFFFFF', padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Create Directive
        </button>
      </div>

    </div>
  );
}
