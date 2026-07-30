import { useState, useEffect } from 'react';

export function useTasks() {
  // Default active tab changed from 'all' to 'today'
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Reorder function for drag and drop priority handling
  const reorderTasks = (newOrderedTasks) => {
    setTasks(newOrderedTasks);
    // Optional: save to localstorage or backend sync if required
  };

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
      ...taskData,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id, updatedFields) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Compute stats across all views
  const stats = {
    totalCount: tasks.length,
    todayCount: tasks.filter(t => {
      const todayStr = new Date().toISOString().split('T')[0];
      return t.date === todayStr || t.dueDate === todayStr;
    }).length,
    pendingCount: tasks.filter(t => !t.completed).length,
    completedCount: tasks.filter(t => t.completed).length,
  };

  return {
    tasks,
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    stats,
  };
}
