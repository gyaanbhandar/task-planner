import React, { useState } from 'react';
import TaskCard from './TaskCard';

export default function ViewToday({ tasks, onUpdateTask, onDeleteTask, onReorderTasks, stats, setActiveTab }) {
  const [draggedItemId, setDraggedItemId] = useState(null);

  // Drag and Drop Handlers for Desktop & Mobile Touch support
  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;
    
    const currentIndex = tasks.findIndex(t => t.id === draggedItemId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);
    
    if (currentIndex !== -1 && targetIndex !== -1) {
      const updatedTasks = [...tasks];
      const [movedItem] = updatedTasks.splice(currentIndex, 1);
      updatedTasks.splice(targetIndex, 0, movedItem);
      
      if (onReorderTasks) {
        onReorderTasks(updatedTasks);
      }
    }
    setDraggedItemId(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Today's Tasks</h1>
        <p className="text-gray-500 text-sm">Organize and prioritize your daily agenda seamlessly.</p>
      </div>

      {/* Top 4 Summary Cards in Requested Sequence */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* 1. Today Tasks */}
        <div 
          onClick={() => setActiveTab && setActiveTab('today')}
          className="p-4 rounded-xl cursor-pointer border border-indigo-500 bg-indigo-50/20 shadow-sm transition hover:shadow-md"
        >
          <div className="text-sm font-medium text-gray-500">Today Tasks</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{stats?.todayCount || 0}</div>
        </div>

        {/* 2. Pending Tasks */}
        <div 
          onClick={() => setActiveTab && setActiveTab('pending')}
          className="p-4 rounded-xl cursor-pointer border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="text-sm font-medium text-gray-500">Pending Tasks</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats?.pendingCount || 0}</div>
        </div>

        {/* 3. Completed Tasks */}
        <div 
          onClick={() => setActiveTab && setActiveTab('completed')}
          className="p-4 rounded-xl cursor-pointer border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="text-sm font-medium text-gray-500">Completed Tasks</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats?.completedCount || 0}</div>
        </div>

        {/* 4. All Tasks */}
        <div 
          onClick={() => setActiveTab && setActiveTab('all')}
          className="p-4 rounded-xl cursor-pointer border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="text-sm font-medium text-gray-500">All Tasks</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{stats?.totalCount || 0}</div>
        </div>
      </div>

      {/* Task List with Drag & Drop Support */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks List (Drag & Drop to Reorder Priority)</h2>
        
        {tasks && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, task.id)}
                className="cursor-grab active:cursor-grabbing transition transform hover:-translate-y-0.5"
              >
                <TaskCard 
                  task={task} 
                  onUpdate={onUpdateTask} 
                  onDelete={onDeleteTask} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No tasks found in this section. Click "+ New Task" to add one!
          </div>
        )}
      </div>
    </div>
  );
}
