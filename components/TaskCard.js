export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }) {
  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      
      {/* Left Section: Checkbox, Title & Badges */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
        />
        <div className="min-w-0 flex-1">
          <h3 className={`font-medium text-gray-900 text-sm sm:text-base break-words ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-medium">
              {task.category}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              📅 {task.date}
            </span>
            {task.link && (
              <span className="text-indigo-500 italic truncate max-w-[120px]">
                • {task.link}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Time, Priority & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
        <span className="px-2.5 py-1 bg-indigo-50/70 text-indigo-600 font-medium rounded-lg text-xs flex items-center gap-1">
          🕒 {task.time || '09:00 AM'}
        </span>
        
        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
          task.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
          task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
        }`}>
          {task.priority}
        </span>

        <button 
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
        >
          🗑️
        </button>
      </div>

    </div>
  );
}
