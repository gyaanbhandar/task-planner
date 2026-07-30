import React from 'react';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm hover:shadow transition ${task.completed ? 'opacity-60 bg-gray-50' : ''}`}>
      <div className="flex items-center space-x-4 flex-1">
        {/* Drag handle indicator icon */}
        <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
          ⠿
        </div>

        {/* Checkbox */}
        <input 
          type="checkbox" 
          checked={!!task.completed} 
          onChange={(e) => onUpdate(task.id, { completed: e.target.checked })}
          className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
        />

        {/* Title & Details */}
        <div className="flex-1">
          <h3 className={`font-medium text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title || task.text}
          </h3>
          {task.category && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium mt-1 inline-block">
              {task.category}
            </span>
          )}
        </div>
      </div>

      {/* Right side metadata & actions */}
      <div className="flex items-center space-x-3">
        {task.priority && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getPriorityColor(task.priority)}`}>
            {task.priority.toUpperCase()}
          </span>
        )}
        
        <button 
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition"
          title="Delete Task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
