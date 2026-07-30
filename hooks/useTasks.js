'use client';
import { useState, useCallback } from 'react';
import { taskService } from '../services/taskService';

export function useTasks(session, showToast) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!session) return;
    try {
      const data = await taskService.fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const handleAddTask = async (form, emptyForm, setForm, setShowAdd) => {
    if (!form.title.trim()) return;
    try {
      await taskService.createTask(form, session.user.id);
      await loadTasks();
      setForm({ ...emptyForm, category: form.category, subcategory: form.subcategory });
      setShowAdd(false);
      showToast('Task added ✓');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (editTaskId, form, emptyForm, setForm, setEditTask, setShowAdd) => {
    if (!form.title.trim()) return;
    try {
      await taskService.updateTask(editTaskId, form);
      await loadTasks();
      setEditTask(null);
      setForm(emptyForm);
      setShowAdd(false);
      showToast('Updated ✓');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id) => {
    const task = tasks.find(tk => tk.id === id);
    if (!task) return;
    try {
      await taskService.toggleTaskStatus(id, task.status);
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      await loadTasks();
      showToast('Deleted');
    } catch (err) {
      console.error(err);
    }
  };

  return {
    tasks,
    loading,
    setLoading,
    loadTasks,
    handleAddTask,
    handleUpdateTask,
    handleToggleStatus,
    handleDeleteTask
  };
}
