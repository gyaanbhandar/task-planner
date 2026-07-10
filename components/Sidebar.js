'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, getS } from '../constants/taskConstants';
import { formatIndianDate } from '../utils/dateUtils';

export default function Sidebar({ mobile, view, setView, setSelectedCat, selectedCat, setSidebarOpen, catCounts, notifEnabled, enableNotifications, userName, handleLogout, setShowAdd }) {
  const { theme, t, toggleTheme } = useTheme();
  const S = getS(t);

  return (
    <div className="flex flex-col h-full bg-[#09090B]/40 backdrop-blur-xl border-r border-zinc-900/60 font-sans select-none text-zinc-300">
      
      {/* Header Profile Section / Arc Browser Inspired Title */}
      <div className="p-5 flex justify-between items-start border-b border-zinc-900/40">
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Task Planner
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">{formatIndianDate()}</p>
        </div>
        <button 
          onClick={toggleTheme} 
          className="text-zinc-500 hover:text-zinc-200 transition-colors text-sm p-1 rounded-md hover:bg-zinc-900/50" 
          title="Toggle System Environment Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main Core Thread Sequences navigation stack */}
      <div className="p-3 flex-1 space-y-1 overflow-y-auto">
        <div className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase px-2.5 mb-2 block">Scopes</div>
        
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
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 ${
                isActive 
                  ? 'bg-zinc-900 text-purple-400 border border-zinc-800 shadow-[0_1px_10px_rgba(0,0,0,0.4)]' 
                  : 'hover:bg-zinc-900/40 hover:text-zinc-100 border border-transparent'
              }`}
            >
              <span className={`text-sm transition-transform duration-200 ${isActive ? 'scale-110 opacity-100' : 'opacity-60'}`}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        {/* Categories Division Grid (Linear Matrix View) */}
        <div className="h-px bg-zinc-900/60 my-4 mx-2" />
        <div className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase px-2.5 mb-2 block">Categories</div>
        
        <div className="space-y-0.5">
          {CATEGORIES.map(c => {
            const isCatActive = selectedCat === c.id;
            return (
              <button 
                key={c.id} 
                onClick={() => { setView('category'); setSelectedCat(c.id); if (mobile) setSidebarOpen(false); }} 
                className={`flex items-center justify-between w-full px-3 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 ${
                  isCatActive 
                    ? 'bg-purple-950/20 text-purple-300 border border-purple-500/20 shadow-[0_2px_12px_rgba(108,92,231,0.05)]' 
                    : 'hover:bg-zinc-900/30 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <span className={`text-xs transition-opacity ${isCatActive ? 'opacity-100' : 'opacity-60'}`}>{c.icon}</span>
                  <span className="truncate">{c.name}</span>
                </span>
                {catCounts[c.id] > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border transition-all ${
                    isCatActive 
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                      : 'bg-zinc-950/60 border-zinc-900 text-zinc-500'
                  }`}>
                    {catCounts[c.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Premium Warning system notification link trigger widget */}
        {!notifEnabled && (
          <>
            <div className="h-px bg-zinc-900/60 my-4 mx-2" />
            <button 
              onClick={enableNotifications} 
              className="group flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-amber-500 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 transition-all duration-200 shadow-sm"
            >
              <span className="text-xs group-hover:animate-bounce">🔔</span>
              <span className="text-left tracking-wide">Sync Notifications</span>
            </button>
          </>
        )}
      </div>

      {/* Account Deployment Identity Card (Stripe / Stripe Layout Footer Style) */}
      <div className="p-4 border-t border-zinc-900/60 bg-zinc-950/30 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center text-[11px] text-purple-300 font-mono font-bold tracking-tight shadow-inner">
            {userName[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate tracking-tight">{userName}</div>
            <div className="text-[9px] font-mono text-zinc-600 truncate uppercase">Developer Session</div>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-[10px] font-medium text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 px-2 py-1 rounded-md transition-all border border-transparent hover:border-rose-500/10"
          >
            Exit
          </button>
        </div>

        <button 
          onClick={() => { setShowAdd(true); if (mobile) setSidebarOpen(false); }} 
          className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium py-2.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all duration-300 hover:opacity-95"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          Create Directive
        </button>
      </div>

    </div>
  );
}
