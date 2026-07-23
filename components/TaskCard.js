'use client';

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }) {
  if (!task) return null;

  // Time format helper (09:00 -> 09:00 AM)
  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '09:00 AM';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [hours, minutes] = timeStr.split(':');
    if (!hours) return timeStr;
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${minutes || '00'} ${ampm}`;
  };

  // Priority color styling helper
  const getPriorityStyle = (priority) => {
    const p = (priority || 'MEDIUM').toUpperCase();
    if (p === 'HIGH') return { bg: '#fee2e2', text: '#dc2626' }; // Red
    if (p === 'LOW') return { bg: '#dcfce7', text: '#16a34a' };  // Green
    return { bg: '#fef3c7', text: '#d97706' };                   // Yellow (MEDIUM)
  };

  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <div
      onClick={() => onEdit && onEdit(task)}
      className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer my-2"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #f3f4f6',
        padding: '12px 16px',
        marginBottom: '10px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        gap: '12px'
      }}
    >
      {/* LEFT SECTION: Checkbox, Title, Category, Date */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          flex: 1, 
          minWidth: 0 
        }}
      >
        <input
          type="checkbox"
          checked={Boolean(task.completed)}
          onChange={(e) => {
            e.stopPropagation();
            onToggleComplete && onToggleComplete(task.id);
          }}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 cursor-pointer"
          style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Task Title */}
          <h3 
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: task.completed ? '#9ca3af' : '#1f2937',
              textDecoration: task.completed ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {task.title || 'Untitled Task'}
          </h3>

          {/* Category & Date Pills */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '4px', 
              flexWrap: 'wrap' 
            }}
          >
            {task.category && (
              <span 
                style={{
                  backgroundColor: '#e0e7ff',
                  color: '#4f46e5',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {task.category}
              </span>
            )}

            {task.date && (
              <span 
                style={{ 
                  color: '#9ca3af', 
                  fontSize: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px' 
                }}
              >
                📅 {task.date}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Time, Priority, Delete Icon */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flexShrink: 0 
        }}
      >
        {/* Time Badge */}
        <span 
          style={{
            backgroundColor: '#e0e7ff',
            color: '#4338ca',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap'
          }}
        >
          🕒 {formatDisplayTime(task.time)}
        </span>

        {/* Priority Badge */}
        <span 
          style={{
            backgroundColor: priorityStyle.bg,
            color: priorityStyle.text,
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {task.priority || 'MEDIUM'}
        </span>

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(task.id);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Delete Task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
