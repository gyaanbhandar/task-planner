// task-planner-main/components/FormPanel.js
import React, { useState } from 'react';

export default function FormPanel({ clients = [], onAddTask, onClose }) {
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('One-time'); // Daily or One-time
  const [reminderTime, setReminderTime] = useState('09:00');
  const [dueDate, setDueDate] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    onAddTask({
      title,
      type: taskType,
      reminderTime: taskType === 'Daily' ? reminderTime : null,
      dueDate: taskType === 'One-time' ? dueDate : null,
      clientId: selectedClient?.id || null,
      clientName: selectedClient?.name || null,
      status: 'Pending',
      subTasks: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl p-6 border-l border-slate-200 z-50 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Create New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Task Title</label>
            <input 
              type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="e.g., Ansh se baat karni hai"
              className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Dynamic Smart Searchable Client Input Field */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assign Client</label>
            <input 
              type="text" 
              placeholder="Search client name..." 
              value={selectedClient ? selectedClient.name : clientSearch}
              onFocus={() => setShowClientDropdown(true)}
              onChange={(e) => {
                setClientSearch(e.target.value);
                if (selectedClient) setSelectedClient(null);
              }}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {showClientDropdown && (
              <div className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 text-sm">
                {filteredClients.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => {
                      setSelectedClient(c);
                      setShowClientDropdown(false);
                    }}
                    className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                  >
                    👤 {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Schedule Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button" onClick={() => setTaskType('One-time')}
                className={`p-2 text-xs font-medium rounded-lg border text-center ${taskType === 'One-time' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-600'}`}
              >
                One-time
              </button>
              <button 
                type="button" onClick={() => setTaskType('Daily')}
                className={`p-2 text-xs font-medium rounded-lg border text-center ${taskType === 'Daily' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-600'}`}
              >
                Daily Reminder
              </button>
            </div>
          </div>

          {taskType === 'Daily' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Daily Reminder Time</label>
              <input type="time" value={reminderTime} onChange={(e) => setTemplateTime(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm"/>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm"/>
            </div>
          )}
        </form>
      </div>

      <div className="pt-4 border-t border-slate-100 flex gap-2">
        <button onClick={onClose} type="button" className="w-1/2 p-2.5 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg">Cancel</button>
        <button onClick={handleSubmit} type="submit" className="w-1/2 p-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Save Task</button>
      </div>
    </div>
  );
}
