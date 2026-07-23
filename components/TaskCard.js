'use client';

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }) {
  if (!task) return null;

  // Priority badge color styling
  const getPriorityStyle = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-50 text-red-600';
      case 'LOW':
        return 'bg-green-50 text-green-600';
      case 'MEDIUM':
      default:
        return 'bg-amber-50 text-amber-600';
    }
  };

  return (
    <div 
      onClick={() => onEdit && onEdit(task)}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-2"
    >
      {/* Left Section: Checkbox, Title, Category, Date */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={Boolean(task.completed)}
          onChange={(e) => {
            e.stopPropagation();
            onToggleComplete && onToggleComplete(task.id);
          }}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
        />
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-gray-800 text-sm sm:text-base truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.title || 'Untitled Task'}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
            {task.category && (
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
                {task.category}
              </span>
            )}
            
            {task.date && (
              <span className="flex items-center gap-1 text-gray-400">
                📅 {task.date}
              </span>
            )}

            {task.link && (
              <span className="text-indigo-500 italic truncate max-w-[150px]">
                • {task.link}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Time, Priority Badge, Delete Icon */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          {/* Time Pill */}
          <span className="px-3 py-1 bg-indigo-50/80 text-indigo-600 font-medium rounded-lg text-xs flex items-center gap-1">
            🕒 {task.time || '09:00 AM'}
          </span>
          
          {/* Priority Pill */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityStyle(task.priority)}`}>
            {task.priority || 'MEDIUM'}
          </span>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(task.id);
          }}
          className="text-gray-300 hover:text-red-500 p-1 transition-colors rounded-md"
          title="Delete Task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
