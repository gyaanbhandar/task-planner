import { supabase } from '../lib/supabase';

export const taskService = {
  async fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data.map(tk => ({
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
      deadline: form.deadline || null 
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

  async deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  async fetchAiPlan(tasksSummary) {
    const res = await fetch('/api/ai-plan', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ tasks: tasksSummary }) 
    });
    const data = await res.json();
    return data.plan || 'Response nahi aaya.';
  }
};
