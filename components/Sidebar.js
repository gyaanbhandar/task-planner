'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, getS } from '../constants/taskConstants';
import { formatIndianDate } from '../utils/dateUtils';

export default function Sidebar({ mobile, view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd }) {
  const { theme, t, toggleTheme } = useTheme();
  const S = getS(t);

  const activeBg = '#1E1E24';
  const hoverBg = '#16161A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#121215', color: '#E4E4E7', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Profile/Header Section */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1F1F23' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 15, color: '#FFFFFF', fontWeight: 600, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C5CE7', display: 'inline-block' }} />
            Task Planner
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 10, fontFamily: 'monospace', color: '#71717A', textTransform: 'uppercase' }}>{formatIndianDate()}</p>
        </div>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#71717A' }} title="Toggle System Theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Navigation Stack */}
      <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#52525B', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 4 }}>Scopes</span>
        
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
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 10, border: isActive ? '1px solid #27272A' : '1px solid transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: isActive ? activeBg : 'transparent', color: isActive ? '#A29BFE' : '#A1A1AA', textAlign: 'left', transition: '0.2s' }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}

        <div style={{ height: 1, background: '#1F1F23', margin: '12px 4px' }} />
        <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#52525B', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 4 }}>Categories</span>
        
        {CATEGORIES.map(c => {
          const isCatActive = selectedCat === c.id;
          return (
            <button 
              key={c.id} 
              onClick={() => { setView('category'); setSelectedCat(c.id); if (mobile) setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: isCatActive ? 'rgba(108,92,231,0.1)' : 'transparent', color: isCatActive ? '#A29BFE' : '#A1A1AA', transition: '0.2s' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ opacity: isCatActive ? 1 : 0.6 }}>{c.icon}</span>
                <span>{c.name}</span>
              </span>
              {catCounts[c.id] > 0 && (
                <span style={{ fontSize: 10, fontFamily: 'monospace', background: '#16161A', color: '#52525B', padding: '1px 6px', borderRadius: 6, border: '1px solid #27272A' }}>
                  {catCounts[c.id]}
                </span>
              )}
            </button>
          );
        })}

        {!notifEnabled && (
          <>
            <div style={{ height: 1, background: '#1F1F23', margin: '12px 4px' }} />
            <button onClick={enableNotifications} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', cursor: 'pointer', fontSize: 12, background: 'rgba(245,158,11,0.05)', color: '#F59E0B', fontWeight: 500 }}>
              🔔 Sync Notifications
            </button>
          </>
        )}
      </div>

      {/* Footer User Block */}
      <div style={{ padding: '16px', borderTop: '1px solid #1F1F23', background: '#0D0D10', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: 12, color: '#FFFFFF', fontWeight: 700, textAlign: 'center', lineHeight: '30px', flexShrink: 0 }}>
            {userName[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#52525B' }}>SESSION NODE</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Exit</button>
        </div>
        <button onClick={() => { setShowAdd(true); if (mobile) setSidebarOpen(false); }} style={{ width: '100%', background: '#6C5CE7', border: 'none', color: '#FFFFFF', padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,92,231,0.2)' }}>
          Create Directive
        </button>
      </div>

    </div>
  );
}
