// task-planner-main/components/Sidebar.js
import React, { useState } from 'react';

export default function Sidebar({ currentFilter, setFilter, clients = [], onAddClient }) {
  const [isOpenClients, setIsOpenClients] = useState(false);

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold tracking-wide">Task Planner 2.0</h1>
          <span className="text-xs text-slate-400">v2.0</span>
        </div>

        {/* Navigation Filters */}
        <nav className="space-y-2">
          <button 
            onClick={() => setFilter({ type: 'all' })}
            className={`w-full text-left p-2.5 rounded-lg text-sm font-medium transition ${!currentFilter.clientId ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            📂 All Focus Tasks
          </button>

          {/* Collapsible Client Section */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <button 
                onClick={() => setIsOpenClients(!isOpenClients)}
                className="hover:text-white flex items-center gap-1"
              >
                {isOpenClients ? '▼' : '▶'} Clients
              </button>
              <button 
                onClick={onAddClient}
                className="hover:text-white text-sm font-bold bg-slate-800 px-1.5 rounded"
              >
                +
              </button>
            </div>

            {isOpenClients && (
              <div className="pl-4 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setFilter({ type: 'client', clientId: client.id })}
                    className={`w-full text-left p-2 rounded text-xs transition truncate ${currentFilter.clientId === client.id ? 'bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    👤 {client.name}
                  </button>
                ))}
                {clients.length === 0 && (
                  <p className="text-xs text-slate-600 p-2 italic">No clients added</p>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Profile Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">👤 gyaanbhandar90</span>
        <button className="text-rose-400 hover:underline">Logout</button>
      </div>
    </aside>
  );
}
