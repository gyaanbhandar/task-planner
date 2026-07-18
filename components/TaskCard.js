// task-planner-main/components/TaskCard.js
import React, { useState } from 'react';

export default function TaskCard({ task, onToggleSubTask, onToggleStatus }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`p-4 rounded-xl border mb-3 bg-white transition shadow-sm ${task.isSkipped ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            checked={task.status === 'Completed'}
            onChange={() => onToggleStatus(task.id)}
            className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-medium text-slate-900 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h3>
              {task.subTasks?.length > 0 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="text-xs text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded hover:bg-indigo-100"
                >
                  {isExpanded ? 'Hide' : `Show Sub-tasks (${task.subTasks.length})`}
                </button>
              )}
            </div>

            {/* Reminders & Metadata */}
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                ⏰ {task.type === 'Daily' ? `Daily at ${task.reminderTime}` : `One-time: ${task.dueDate}`}
              </span>
              {task.clientName && (
                <span className="text-indigo-600 font-medium">💼 {task.clientName}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Sub-Tasks UI Section */}
      {isExpanded && task.subTasks && (
        <div className="mt-4 pl-7 pt-3 border-t border-slate-100 space-y-2">
          {task.subTasks.map((sub) => (
            <label key={sub.id} className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer">
              <input 
                type="checkbox" 
                checked={sub.completed}
                onChange={() => onToggleSubTask(task.id, sub.id)}
                className="rounded text-emerald-600 w-3.5 h-3.5"
              />
              <span className={sub.completed ? 'line-through text-slate-400' : ''}>{sub.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
