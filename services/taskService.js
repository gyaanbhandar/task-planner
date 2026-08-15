import { supabase } from '../lib/supabase';

export const taskService = {
  async fetchTasks(userId) {
    // Phase 2: RLS - filter by user_id for data isolation
    // Exclude trashed tasks from normal views
    let query = supabase
      .from('tasks')
      .select('*')
      .neq('status', 'trashed')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
      
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(tk => ({
      ...tk,
      deadline: tk.deadline || '',
      description: tk.description || '',
      subcategory: tk.subcategory || ''
    }));
  },

  // Fetch only trashed tasks — ordered by trashed_at (newest first)
  async fetchTrashedTasks(userId) {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('status', 'trashed')
      .order('trashed_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('fetchTrashedTasks error:', error);
      throw error;
    }
    return (data || []).map(tk => ({
      ...tk,
      deadline: tk.deadline || '',
      description: tk.description || '',
      subcategory: tk.subcategory || ''
    }));
  },

  async createTask(form, userId) {
    const { error } = await supabase.from('tasks').insert([{ 
      title: form.title, 
      description: form.description, 
      category: form.category, 
      subcategory: form.subcategory, 
      priority: form.priority, 
      type: form.type, 
      deadline: form.deadline || null, 
      time: form.time || '09:00 AM',
      status: 'pending', 
      approval_status: 'none', 
      suggested_by: 'user', 
      user_id: userId 
    }]);
    if (error) throw error;
  },

  async updateTask(id, form) {
    const { error } = await supabase.from('tasks').update({ 
      title: form.title, 
      description: form.description, 
      category: form.category, 
      subcategory: form.subcategory, 
      priority: form.priority, 
      type: form.type, 
      deadline: form.deadline || null,
      time: form.time || '09:00 AM'
    }).eq('id', id);
    if (error) throw error;
  },

  async toggleTaskStatus(id, currentStatus) {
    const nextStatus = currentStatus === 'done' ? 'pending' : 'done';
    const { error } = await supabase.from('tasks').update({ 
      status: nextStatus, 
      completed_at: nextStatus === 'done' ? new Date().toISOString() : null 
    }).eq('id', id);
    if (error) throw error;
  },

  // Soft delete — move to trash (keeps data, sets status='trashed', stores trash date in trashed_at)
  // completed_at is preserved so restoring a "done" task keeps its completion date
  async trashTask(id) {
    const { error } = await supabase.from('tasks').update({
      status: 'trashed',
      trashed_at: new Date().toISOString()
    }).eq('id', id);
    if (error) {
      console.error('trashTask error:', error);
      throw error;
    }
  },

  // Restore from trash back to pending — clear trashed_at, keep completed_at intact
  async restoreTask(id) {
    const { error } = await supabase.from('tasks').update({
      status: 'pending',
      trashed_at: null
    }).eq('id', id);
    if (error) {
      console.error('restoreTask error:', error);
      throw error;
    }
  },

  // Permanent delete — removes from DB forever
  async permanentDeleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('permanentDeleteTask error:', error);
      throw error;
    }
  },

  // Auto-clean: permanently delete tasks trashed more than 15 days ago
  // Uses trashed_at (dedicated column) — NOT completed_at
  async autoCleanTrash(userId) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 15);
    const cutoffStr = cutoff.toISOString();

    // Only delete tasks that have a trashed_at date AND it's older than 15 days
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'trashed')
      .not('trashed_at', 'is', null)
      .lt('trashed_at', cutoffStr);
    
    if (error) {
      console.error('autoCleanTrash error:', error);
      throw error;
    }
    return data;
  },

  // Empty entire trash for a user
  async emptyTrash(userId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'trashed');
    if (error) {
      console.error('emptyTrash error:', error);
      throw error;
    }
  },

  // Legacy deleteTask — now redirects to trashTask for backward compat
  async deleteTask(id) {
    return this.trashTask(id);
  },

  // Drag-and-drop: update sort_order for reordered tasks
  async updateTaskOrder(orderedIds) {
    // Batch update sort_order for each task
    const updates = orderedIds.map((id, index) => 
      supabase.from('tasks').update({ sort_order: index }).eq('id', id)
    );
    await Promise.all(updates);
  },

  // ✅ NEW: Bulk import tasks from CSV/JSON file
  async importTasks(tasksArray, userId) {
    const records = tasksArray.map(t => ({
      title: t.title,
      description: t.description || '',
      category: t.category || 'personal',
      subcategory: t.subcategory || 'General',
      priority: t.priority || 'medium',
      type: t.type || 'one-time',
      deadline: t.deadline || null,
      time: t.time || '09:00 AM',
      status: t.status || 'pending',
      approval_status: 'none',
      suggested_by: 'user',
      user_id: userId
    }));

    // Supabase supports batch insert — all records in one call
    const { data, error } = await supabase.from('tasks').insert(records);
    if (error) throw error;
    return { count: records.length };
  },

  async fetchAiPlan(tasksSummary, userId) {
    const res = await fetch('/api/ai-plan', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ tasks: tasksSummary, userId }) 
    });
    const data = await res.json();
    return { 
      plan: data.plan || 'Response nahi aaya.',
      limit_reached: data.limit_reached || false,
      used: data.used,
      limit: data.limit
    };
  }
};
