'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, getS } from '../constants/taskConstants';
import { formatIndianDate } from '../utils/dateUtils';

export default function Sidebar({ mobile, view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd }) {
  const { theme, t, toggleTheme } = useTheme();
  const S = getS(t);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, color: t.text, fontWeight: 700 }}>⚡ Task Planner</h1>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: t.textSec }}>{formatIndianDate()}</p>
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
          <button key={c.id} onClick={() => { setView('category'); setSelectedCat(c.id); if (mobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 1, background: selectedCat === c.id ? c.color + '14' : 'transparent', color: selectedCat === c.id ? c.color : t.textSec }}>
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
}
