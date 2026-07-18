// task-planner-main/app/page.js
'react';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import FormPanel from '../components/FormPanel';
import { TASK_STATUSES, TIME_FILTERS } from '../constants/taskConstants';

export default function Home() {
  const [activeStatus, setActiveStatus] = useState(TASK_STATUSES.PENDING);
  const [activeTime, setActiveTime] = useState(TIME_FILTERS.TODAY);
  const [filter, setFilter] = useState({ type: 'all' });
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Seed / State data representation
  const [clients, setClients] = useState([
    { id: '1', name: 'Horizon Solutions' },
    { id: '2', name: 'Alpha Tech' }
  ]);

  const [tasks, setTasks] = useState([
    { 
      id: 't1', 
      title: 'Ansh se baat karni hai har halat mein', 
      status: 'Pending', 
      type: 'One-time', 
      dueDate: '2026-07-19', 
      clientId: '1', 
      clientName: 'Horizon Solutions',
      subTasks: [
        { id: 's1', title: 'Collect balance sheets', completed: false },
        { id: 's2', title: 'Verify lead generation files', completed: true }
      ]
    }
  ]);

  // Handle nested changes
  const handleToggleSubTask = (taskId, subId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, subTasks: t.subTasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    } : t));
  };

  const handleToggleStatus = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed'
    } : t));
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar currentFilter={filter} setFilter={setFilter} clients={clients} onAddClient={() => {
        const name = prompt("Enter client name:");
        if (name) setClients([...clients, { id: Date.now().toString(), name }]);
      }} />

      <main className="flex-1 p-8 max-w-5xl mx-auto">
        {/* Modern Filter Matrix Hub Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Today's Focus Control</h2>
            <button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700">
              + New Task
            </button>
          </div>

          {/* Status Matrix Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-3">
            {Object.values(TASK_STATUSES).map(status => (
              <button
                key={status} onClick={() => setActiveStatus(status)}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition ${activeStatus === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Time Context Filters row dynamically shifts labels based on state */}
          <div className="flex gap-1 overflow-x-auto py-1">
            {(activeStatus === TASK_STATUSES.COMPLETED || activeStatus === TASK_STATUSES.SKIPPED) ? (
              ['Yesterday', 'Last Week', 'Last Month'].map(time => (
                <button 
                  key={time} onClick={() => setActiveTime(time)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${activeTime === time ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {time}
                </button>
              ))
            ) : (
              ['Today', 'Tomorrow', 'This Week', 'This Month'].map(time => (
                <button 
                  key={time} onClick={() => setActiveTime(time)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${activeTime === time ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {time}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Task List Feed */}
        <div className="space-y-1">
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggleSubTask={handleToggleSubTask} 
              onToggleStatus={handleToggleStatus} 
            />
          ))}
        </div>
      </main>

      {isFormOpen && (
        <FormPanel 
          clients={clients} 
          onAddTask={(newTask) => setTasks([...tasks, { ...newTask, id: Date.now().toString() }])} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
