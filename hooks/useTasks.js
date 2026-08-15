'use client';
import { useState, useCallback } from 'react';
import { taskService } from '../services/taskService';

export function useTasks(session, showToast) {
  const [tasks, setTasks] = useState([]);
  const [trashedTasks, setTrashedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!session) return;
    try {
      // Phase 2: Pass user_id for data isolation
      const data = await taskService.fetchTasks(session.user.id);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const loadTrashedTasks = useCallback(async () => {
    if (!session) return;
    try {
      const data = await taskService.fetchTrashedTasks(session.user.id);
      setTrashedTasks(data);
    } catch (err) {
      console.error('Failed to load trashed tasks:', err);
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

  // Soft delete — moves to trash bin (with confirmation)
  const handleDeleteTask = async (id, skipConfirm = false) => {
    // Find task name for confirmation
    const task = tasks.find(tk => tk.id === id);
    const taskTitle = task ? task.title : 'this task';
    
    if (!skipConfirm) {
      const confirmed = window.confirm(`🗑️ Move "${taskTitle}" to Trash?\n\nIt will be auto-deleted after 15 days. You can restore it from the Trash Bin anytime.`);
      if (!confirmed) return;
    }

    try {
      await taskService.trashTask(id);
      await loadTasks();
      await loadTrashedTasks();
      showToast('🗑️ Moved to Trash — auto-deletes in 15 days');
    } catch (err) {
      console.error('Delete (trash) failed:', err);
      showToast('❌ Task delete failed — please try again');
    }
  };

  // Restore from trash
  const handleRestoreTask = async (id) => {
    try {
      await taskService.restoreTask(id);
      await loadTasks();
      await loadTrashedTasks();
      showToast('✅ Task restored successfully');
    } catch (err) {
      console.error('Restore failed:', err);
      showToast('❌ Restore failed — please try again');
    }
  };

  // Permanent delete from trash
  const handlePermanentDelete = async (id) => {
    try {
      await taskService.permanentDeleteTask(id);
      await loadTrashedTasks();
      showToast('Task permanently deleted');
    } catch (err) {
      console.error('Permanent delete failed:', err);
      showToast('❌ Delete failed — please try again');
    }
  };

  // Empty entire trash
  const handleEmptyTrash = async () => {
    try {
      await taskService.emptyTrash(session.user.id);
      setTrashedTasks([]);
      showToast('🗑️ Trash emptied');
    } catch (err) {
      console.error('Empty trash failed:', err);
      showToast('❌ Failed to empty trash — please try again');
    }
  };

  // Auto-clean old trash (>15 days) — runs on login, only deletes tasks trashed 15+ days ago
  const handleAutoCleanTrash = async () => {
    try {
      const result = await taskService.autoCleanTrash(session.user.id);
      // Only reload if something was actually deleted
      await loadTrashedTasks();
    } catch (err) {
      // Don't show error toast for auto-clean — it's a background operation
      console.error('Auto-clean trash failed:', err);
    }
  };

  // Drag-and-drop reorder handler
  const handleReorderTasks = async (reorderedTasks) => {
    setTasks(reorderedTasks);
    try {
      const orderedIds = reorderedTasks.map(t => t.id);
      await taskService.updateTaskOrder(orderedIds);
    } catch (err) {
      console.error('Reorder save failed:', err);
    }
  };

  // ✅ NEW: Bulk import tasks from file (CSV/JSON)
  const handleImportTasks = async (parsedTasks) => {
    try {
      const result = await taskService.importTasks(parsedTasks, session.user.id);
      await loadTasks(); // Refresh task list after import
      showToast(`${result.count} tasks imported ✓`);
      return result;
    } catch (err) {
      console.error('Import failed:', err);
      throw err;
    }
  };

  return {
    tasks,
    trashedTasks,
    loading,
    setLoading,
    loadTasks,
    loadTrashedTasks,
    handleAddTask,
    handleUpdateTask,
    handleToggleStatus,
    handleDeleteTask,
    handleRestoreTask,
    handlePermanentDelete,
    handleEmptyTrash,
    handleAutoCleanTrash,
    handleReorderTasks,
    handleImportTasks
  };
}
