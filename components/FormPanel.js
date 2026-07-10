'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, PRIORITY_COLORS, getS } from '../constants/taskConstants';

export default function FormPanel({ form, setForm, editTask, onSubmit, onClose, isMobile }) {
  const { t } = useTheme();
  const S = getS(t);

  // Custom priority visual parameters map for Stripe/Linear UI bounds
  const priorityStyles = {
    high: { borderActive: 'border-rose-500 text-rose-400 bg-rose-500/5', ring: 'bg-rose-500' },
    medium: { borderActive: 'border-amber-500 text-amber-400 bg-amber-500/5', ring: 'bg-amber-500' },
    low: { borderActive: 'border-emerald-500 text-emerald-400 bg-emerald-500/5', ring: 'bg-emerald-500' }
  };
  
  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans select-none"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Premium Glassmorphic Overlay Window Shell */}
      <div className={`bg-[#0B0B0E]/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.7)] flex flex-col w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200 ${
        isMobile ? 'max-w-md' : 'max-w-[450px]'
      }`}>
        
        {/* Modal Heading Stream Grid */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-zinc-900/60">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">
              {editTask ? 'Reconfigure Sequence Node' : 'Initialize Directive Protocol'}
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wider">
              {editTask ? 'Modifying memory matrix parameters' : 'Staging task object node descriptor'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-lg transition-colors text-xs font-mono border border-transparent hover:border-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Input Thread Container Stack */}
        <div className="flex flex-col gap-4">
          
          {/* Primary Field: Title Descriptor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Title Segment *</label>
            <input 
              className="bg-zinc-950 border border-zinc-800/80 focus:border-purple-500/50 rounded-xl text-xs px-3.5 py-2.5 focus:outline-none placeholder-zinc-700 text-zinc-200 transition-colors w-full shadow-inner"
              placeholder="Primary target action title string..." 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
            />
          </div>

          {/* Secondary Field: Description Body Text area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Supplemental Details</label>
            <textarea 
              className="bg-zinc-950 border border-zinc-800/80 focus:border-purple-500/50 rounded-xl text-xs px-3.5 py-2.5 focus:outline-none placeholder-zinc-700 text-zinc-200 transition-colors w-full h-20 resize-none shadow-inner leading-relaxed"
              placeholder="Optional contextual arguments (scope metadata info, links, notes)..." 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
            />
          </div>

          {/* Category Drop Deck Grid View */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Category Allocation Matrix</label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map(c => {
                const isSelected = form.category === c.id;
                return (
                  <button 
                    key={c.id} 
                    onClick={() => setForm({ ...form, category: c.id })} 
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left border text-xs font-medium transition-all duration-200 ${
                      isSelected 
                        ? 'bg-purple-950/20 border-purple-500/30 text-purple-400' 
                        : 'border-zinc-800/60 bg-zinc-950/30 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span className={`text-xs opacity-80 ${isSelected ? 'opacity-100' : ''}`}>{c.icon}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Dynamic Configuration Parameter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sub-Namespace Identification</label>
            <input 
              className="bg-zinc-950 border border-zinc-800/80 focus:border-purple-500/50 rounded-xl text-xs px-3.5 py-2.5 focus:outline-none placeholder-zinc-700 text-zinc-200 transition-colors w-full shadow-inner font-mono"
              placeholder="e.g. workspace-alpha, dev-thread" 
              value={form.subcategory} 
              onChange={e => setForm({ ...form, subcategory: e.target.value })} 
            />
          </div>

          {/* Execution Time Target / Deadline Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Chronological Deadline Boundary</label>
            <input 
              type="date" 
              className="bg-zinc-950 border border-zinc-800/80 focus:border-purple-500/50 rounded-xl text-xs px-3.5 py-2.5 focus:outline-none text-zinc-200 transition-colors w-full font-mono shadow-inner accent-purple-500"
              value={form.deadline} 
              onChange={e => setForm({ ...form, deadline: e.target.value })} 
            />
          </div>

          {/* Metric Component: Priority Scale Buttons */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Priority Indexing State</label>
            <div className="flex gap-2">
              {
