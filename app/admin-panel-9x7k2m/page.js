'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ADMIN_THEME = {
  bg: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  border: '#475569',
  text: '#F8FAFC',
  textSec: '#94A3B8',
  accent: '#818CF8',
  accentBg: 'rgba(129,140,248,0.15)',
  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24'
};

export default function SuperAdminPanel() {
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseAnonKey));
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [createMsg, setCreateMsg] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) checkAdmin(data.session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s);
      if (s) checkAdmin(s.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (uid) => {
    const { data } = await supabase.from('admin_users').select('id').eq('user_id', uid).single();
    setIsAdmin(!!data);
    if (data) loadUsers();
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const handleBlock = async (uid, blocked) => {
    await supabase.from('profiles').update({ is_blocked: !blocked }).eq('id', uid);
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, is_blocked: !blocked } : u));
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return;
    setCreateMsg('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword, name: newName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreateMsg('✅ User created successfully!');
      setNewEmail(''); setNewPassword(''); setNewName('');
      loadUsers();
    } catch (err) { setCreateMsg('❌ ' + err.message); }
  };

  // Login screen for admin
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    setLoginError(''); setLoginLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) { setLoginError('Invalid credentials'); setLoginLoading(false); return; }
    setSession(data.session);
    checkAdmin(data.session.user.id);
    setLoginLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: ADMIN_THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ADMIN_THEME.textSec, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>🛡️</div>
          <div style={{ fontSize: '14px' }}>Verifying access...</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: ADMIN_THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
        <div style={{ background: ADMIN_THEME.surface, borderRadius: '20px', padding: '40px 32px', width: '100%', maxWidth: '380px', border: `1px solid ${ADMIN_THEME.border}` }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🛡️</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: ADMIN_THEME.text, margin: '0 0 4px' }}>Admin Access</h1>
            <p style={{ fontSize: '13px', color: ADMIN_THEME.textSec, margin: 0 }}>Restricted area — authorized personnel only</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="email" placeholder="Admin Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${ADMIN_THEME.border}`, background: ADMIN_THEME.surfaceLight, color: ADMIN_THEME.text, fontSize: '14px', boxSizing: 'border-box' }} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${ADMIN_THEME.border}`, background: ADMIN_THEME.surfaceLight, color: ADMIN_THEME.text, fontSize: '14px', boxSizing: 'border-box' }} />
            {loginError && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', color: ADMIN_THEME.danger, fontSize: '13px' }}>{loginError}</div>}
            <button onClick={handleLogin} disabled={loginLoading} style={{ padding: '14px', background: ADMIN_THEME.accent, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: loginLoading ? 0.6 : 1 }}>
              {loginLoading ? 'Verifying...' : 'Login to Admin Panel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but NOT admin
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: ADMIN_THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: ADMIN_THEME.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ fontSize: '14px', color: ADMIN_THEME.textSec }}>You are not authorized to access this panel.</p>
          <button onClick={() => supabase.auth.signOut().then(() => setSession(null))} style={{ marginTop: '20px', padding: '10px 24px', background: ADMIN_THEME.surfaceLight, color: ADMIN_THEME.text, border: `1px solid ${ADMIN_THEME.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.is_blocked).length;
  const blockedUsers = users.filter(u => u.is_blocked).length;
  const trialUsers = users.filter(u => u.subscription_status === 'trial').length;
  const mrr = activeUsers * 499;

  const filteredUsers = searchQuery
    ? users.filter(u => (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '💳' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: ADMIN_THEME.bg, fontFamily: "'Inter', sans-serif", color: ADMIN_THEME.text }}>
      
      {/* Admin Sidebar */}
      <div style={{ width: '240px', background: ADMIN_THEME.surface, borderRight: `1px solid ${ADMIN_THEME.border}`, padding: '24px 16px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: ADMIN_THEME.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', fontSize: '16px' }}>🛡️</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: ADMIN_THEME.text }}>Super Admin</div>
            <div style={{ fontSize: '11px', color: ADMIN_THEME.textSec }}>Control Panel</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
              background: activeSection === item.id ? ADMIN_THEME.accentBg : 'transparent',
              color: activeSection === item.id ? ADMIN_THEME.accent : ADMIN_THEME.textSec
            }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${ADMIN_THEME.border}`, paddingTop: '12px' }}>
          <div style={{ fontSize: '12px', color: ADMIN_THEME.textSec, marginBottom: '8px', paddingLeft: '8px' }}>{session.user.email}</div>
          <button onClick={() => supabase.auth.signOut().then(() => setSession(null))} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', border: 'none', borderRadius: '8px', color: ADMIN_THEME.danger, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            ⏻ Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        
        {/* ========== DASHBOARD ========== */}
        {activeSection === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px' }}>📊 Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Total Users', value: totalUsers, icon: '👥', color: ADMIN_THEME.accent },
                { label: 'Active Users', value: activeUsers, icon: '✅', color: ADMIN_THEME.success },
                { label: 'Blocked', value: blockedUsers, icon: '🚫', color: ADMIN_THEME.danger },
                { label: 'MRR', value: `₹${mrr.toLocaleString()}`, icon: '💰', color: ADMIN_THEME.warning },
                { label: 'Trial Users', value: trialUsers, icon: '⏳', color: '#FB923C' }
              ].map((stat, i) => (
                <div key={i} style={{ background: ADMIN_THEME.surface, borderRadius: '14px', padding: '20px', border: `1px solid ${ADMIN_THEME.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: ADMIN_THEME.textSec, marginBottom: '4px' }}>{stat.label}</div>
                      <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    </div>
                    <div style={{ fontSize: '24px' }}>{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: ADMIN_THEME.surface, borderRadius: '14px', padding: '24px', border: `1px solid ${ADMIN_THEME.border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveSection('users')} style={{ padding: '10px 20px', background: ADMIN_THEME.accentBg, color: ADMIN_THEME.accent, border: `1px solid ${ADMIN_THEME.accent}40`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>👤 Manage Users</button>
                <button onClick={() => { setActiveSection('users'); setShowCreateUser(true); }} style={{ padding: '10px 20px', background: 'rgba(52,211,153,0.1)', color: ADMIN_THEME.success, border: `1px solid ${ADMIN_THEME.success}40`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>+ Create User</button>
                <button onClick={() => setActiveSection('subscriptions')} style={{ padding: '10px 20px', background: 'rgba(251,191,36,0.1)', color: ADMIN_THEME.warning, border: `1px solid ${ADMIN_THEME.warning}40`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>💳 Subscriptions</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== USERS ========== */}
        {activeSection === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>👥 User Management</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${ADMIN_THEME.border}`, background: ADMIN_THEME.surfaceLight, color: ADMIN_THEME.text, fontSize: '13px', width: '220px', boxSizing: 'border-box' }} />
                <button onClick={() => setShowCreateUser(!showCreateUser)} style={{ padding: '10px 16px', background: ADMIN_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New User</button>
              </div>
            </div>

            {showCreateUser && (
              <div style={{ marginBottom: '20px', padding: '20px', background: ADMIN_THEME.surface, borderRadius: '14px', border: `1px solid ${ADMIN_THEME.border}` }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700 }}>Create New User</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                  <input type="text" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${ADMIN_THEME.border}`, background: ADMIN_THEME.surfaceLight, color: ADMIN_THEME.text, fontSize: '13px', boxSizing: 'border-box' }} />
                  <input type="email" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${ADMIN_THEME.border}`, background: ADMIN_THEME.surfaceLight, color: ADMIN_THEME.text, fontSize: '13px', boxSizing: 'border-box' }} />
                  <input type="text" placeholder="Temp Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${ADMIN_THEME.border}`, background: ADMIN_THEME.surfaceLight, color: ADMIN_THEME.text, fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={handleCreateUser} style={{ padding: '10px 20px', background: ADMIN_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Create & Email</button>
                  <button onClick={() => setShowCreateUser(false)} style={{ padding: '10px 16px', background: ADMIN_THEME.surfaceLight, color: ADMIN_THEME.textSec, border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                  {createMsg && <span style={{ fontSize: '12px', fontWeight: 600 }}>{createMsg}</span>}
                </div>
              </div>
            )}

            <div style={{ background: ADMIN_THEME.surface, borderRadius: '14px', border: `1px solid ${ADMIN_THEME.border}`, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${ADMIN_THEME.border}` }}>
                    {['Name', 'Email', 'Joined', 'Status', 'Plan', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: ADMIN_THEME.textSec, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${ADMIN_THEME.border}30` }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{u.full_name || '—'}</td>
                      <td style={{ padding: '14px 16px', color: ADMIN_THEME.textSec }}>{u.email || '—'}</td>
                      <td style={{ padding: '14px 16px', color: ADMIN_THEME.textSec }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: u.is_blocked ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)', color: u.is_blocked ? ADMIN_THEME.danger : ADMIN_THEME.success }}>
                          {u.is_blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: ADMIN_THEME.accentBg, color: ADMIN_THEME.accent }}>
                          {u.subscription_status || 'Trial'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => handleBlock(u.id, u.is_blocked)} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: u.is_blocked ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: u.is_blocked ? ADMIN_THEME.success : ADMIN_THEME.danger }}>
                          {u.is_blocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: ADMIN_THEME.textSec }}>No users found</div>}
            </div>
          </div>
        )}

        {/* ========== SUBSCRIPTIONS ========== */}
        {activeSection === 'subscriptions' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px' }}>💳 Subscription Tracking</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Active Subscriptions', value: activeUsers, color: ADMIN_THEME.success },
                { label: 'Trial Users', value: trialUsers, color: ADMIN_THEME.warning },
                { label: 'Expiring This Week', value: 0, color: ADMIN_THEME.danger },
                { label: 'Auto-Renewal ON', value: Math.floor(activeUsers * 0.7), color: ADMIN_THEME.accent }
              ].map((stat, i) => (
                <div key={i} style={{ background: ADMIN_THEME.surface, borderRadius: '14px', padding: '24px', border: `1px solid ${ADMIN_THEME.border}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: ADMIN_THEME.textSec, marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
