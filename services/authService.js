import { supabase } from '../lib/supabase';

export const authService = {
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      callback(session);
    });
    return subscription;
  },
  async signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  async signUp(email, password, name) {
    return await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { full_name: name } } 
    });
  },
  async signOut() {
    return await supabase.auth.signOut();
  }
};
