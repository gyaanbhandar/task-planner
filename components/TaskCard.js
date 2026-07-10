'use client';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, PRIORITY_COLORS } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

export default function TaskCard({ task, onToggle, onEdit, onDelete, isMobile }) {
  const { t } = useTheme();
  const [exp, setExp] = useState(false);
  const cat = CATEGORIES.find(c => c.id === task.category);
  const overdue = task.deadline && task.deadline < todayStr() && task.status !== 'done';
  const isDone = task.status === 'done';

  // Premium Linear UI accent map for clean modern tags boundary
  const priorityAccents = {
    high: 'border-rose-500/40 shadow-[inset_4px_0_0_0_#f43f5e]',
    medium: 'border-amber-500/40 shadow-[inset_4px_0_0_0_#f59e0b]',
    low: 'border-emerald-500/40 shadow-[inset_4px_0_0_0_#10b981]'
  };

  return (
    <div className={`group relative bg-[#0C0C0F]/60 backdrop-blur-md border rounded-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-[#121217]/60 overflow-hidden ${
      isDone ? 'opacity-40 hover:opacity-60 border-zinc-900' : 'border-zinc-800/40 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
    } ${priorityAccents[task.priority] || 'border-zinc-800'}`}>

      {/* Main Structural Node Data Row */}
      <div className="p-3.5 sm:p-4 flex items-start gap-3.5 select-none">
        
        {/* Custom Premium Minimal Checkbox (Linear / Apple Style) */}
        <button 
          onClick={() => onToggle(task.id)} 
          className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-0.5 focus:outline-none ${
            isDone 
              ? 'bg-purple-600 border-purple-500 shadow-sm shadow-purple-900/30 text-white' 
              : 'border-zinc-700 bg-zinc-950 hover:border-purple-500/50 hover:bg-zinc-900'
          }`}
        >
          {isDone && (
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Central Details Hierarchy Anchor */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExp(!exp)}>
          <div className={`text-xs font-medium tracking-wide leading-tight transition-all text-zinc-100 ${
            isDone ? 'line-through text-zinc-500 font-normal' : ''
          }`}>
            {task.title}
          </div>
          
          {/* Metadata Parameters Badges Strip (Vercel Metrics Look) */}
          <div className="flex gap-2 mt-2 flex-wrap items-center text-[10px] font-medium font-mono text-zinc-500">
            <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded-md tracking-tight flex items-center gap-1 shadow-xs">
              <span className="opacity-80">{cat?.icon}</span>
              <span>{cat?.name}</span>
            </span>

            {task.subcategory && (
              <span className="text-zinc-500 bg-zinc-900/30 px-1 rounded border border-transparent">
                &bull;&nbsp;{task.subcategory}
              </span>
            )}

            {task.deadline && (
              <span className={`flex items-center gap-1 px-1.5 py-0.2 rounded border ${
                overdue 
                  ? 'bg-rose-950/20 border-rose-900/30 text-rose-400 font-semibold' 
                  : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-400'
              }`}>
                <span>{overdue ? '⚠️' : '📅'}</span>
                <span>{task.deadline}</span>
              </span>
            )}

            <span className="text-[9px] text-zinc-600 bg-zinc-950 border border-zinc-900 px-1 rounded-sm uppercase tracking-wider">
              {task.type}
            </span>
          </div>
        </div>

        {/* Desktop Quick Actions Floating Bar (Fades in smoothly on row hover) */}
        {!isMobile && (
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={() => onEdit(task)} 
              className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg transition-colors border border-transparent hover:border-zinc-700/30"
              title="Modify Node"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
            <button 
              onClick={() => onDelete(task.id)} 
              className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors border border-transparent hover:border-rose-900/30"
              title="Purge Sequence"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Expanded Descriptive Meta Pane */}
      {exp && (
        <div className="px-3.5 pb-4 pt-1 sm:px-4 sm:pb-4 border-t border-zinc-900/40 bg-zinc-950/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="pl-7">
            {task.description ? (
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-sans font-medium whitespace-pre-line">
                {task.description}
              </p>
            ) : (
              <p className="text-[11px] font-mono italic text-zinc-600">
                No supplemental string configurations allocated for this target segment.
              </p>
            )}

            {/* Mobile Action Triggers Grid Block */}
            {isMobile && (
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => onEdit(task)} 
                  className="flex-1 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-zinc-300 text-xs font-medium transition-all"
                >
                  Modify File
                </button>
                <button 
                  onClick={() => onDelete(task.id)} 
                  className="flex-1 py-1.5 rounded-lg border border-rose-950/40 bg-rose-950/10 text-rose-400 text-xs font-medium transition-all"
                >
                  Purge Sequence
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
