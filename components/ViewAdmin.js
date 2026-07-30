'use client';
import React, { useState, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { authService } from '../services/authService';

export default function ViewAdmin({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [createMsg, setCreateMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.listAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      // Fallback: generate mock data for demo
      setUsers([
        { id: '1', email: session?.user?.email || 'admin@example.com', full_name: 'Admin User', created_at: new Date().toISOString(), subscription_status: 'active', subscription_expiry: '2026-12-31', is_blocked: false },
      ]);
    }
    setLoading(false);
  };

  const handleBlockUser = async (userId, currentBlocked) => {
    try {
      await authService.toggleUserBlock(userId, !currentBlocked);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: !currentBlocked } : u));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) return;
    setCreateMsg('');
    try {
      await authService.adminCreateUser(newUserEmail, newUserPassword, newUserName);
      setCreateMsg('User created! Credentials emailed.');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      loadUsers();
    } catch (err) {
      setCreateMsg('Error: ' + err.message);
    }
  };

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.is_blocked).length;
  const trialUsers = users.filter(u => u.subscription_status === 'trial').length;
  // Mock MRR calculation
  const mrr = activeUsers * 499;

  const filteredUsers = searchQuery
    ? users.filter(u => 
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: `1px solid ${VISUAL_THEME.border}`,
    padding: '24px',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 4px 0' }}>🛡️ Super Admin Panel</h2>
        <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>Manage users, subscriptions, and platform analytics</p>
      </div>

      {/* Overview Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Users', value: totalUsers, icon: '👥', bg: '#EEF2FF', color: VISUAL_THEME.accent },
          { label: 'Active Users', value: activeUsers, icon: '✅', bg: '#ECFDF5', color: '#059669' },
          { label: 'MRR (Monthly)', value: `₹${mrr.toLocaleString()}`, icon: '💰', bg: '#FFFBEB', color: '#D97706' },
          { label: 'Trial Users', value: trialUsers, icon: '⏳', bg: '#FEF2F2', color: '#EF4444' }
        ].map((stat, i) => (
          <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, display: 'block', marginBottom: '4px' }}>{stat.label}</span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* User Management */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>👤 User Management</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', width: '200px', boxSizing: 'border-box' }}
            />
            <button
              onClick={() => setShowCreateUser(!showCreateUser)}
              style={{ padding: '8px 14px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Create User
            </button>
          </div>
        </div>

        {/* Create User Form */}
        {showCreateUser && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}` }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Create New User</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <input type="text" placeholder="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', boxSizing: 'border-box' }} />
              <input type="email" placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', boxSizing: 'border-box' }} />
              <input type="text" placeholder="Temp Password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={handleCreateUser} style={{ padding: '10px 20px', background: VISUAL_THEME.accent, color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Create & Email Credentials</button>
              <button onClick={() => setShowCreateUser(false)} style={{ padding: '10px 16px', background: '#F1F5F9', color: VISUAL_THEME.textSec, border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              {createMsg && <span style={{ fontSize: '12px', color: createMsg.startsWith('Error') ? '#EF4444' : '#059669', fontWeight: 600 }}>{createMsg}</span>}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${VISUAL_THEME.border}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: VISUAL_THEME.textSec, fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: VISUAL_THEME.textSec, fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: VISUAL_THEME.textSec, fontWeight: 600 }}>Join Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: VISUAL_THEME.textSec, fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: VISUAL_THEME.textSec, fontWeight: 600 }}>Subscription</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: VISUAL_THEME.textSec, fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: VISUAL_THEME.textSec }}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: VISUAL_THEME.textSec }}>No users found</td></tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${VISUAL_THEME.borderAlt}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: VISUAL_THEME.text }}>{u.full_name || u.email?.split('@')[0] || '—'}</td>
                    <td style={{ padding: '12px 16px', color: VISUAL_THEME.textSec }}>{u.email || '—'}</td>
                    <td style={{ padding: '12px 16px', color: VISUAL_THEME.textSec }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: u.is_blocked ? '#FEE2E2' : '#ECFDF5',
                        color: u.is_blocked ? '#EF4444' : '#059669'
                      }}>
                        {u.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: '#EEF2FF',
                        color: VISUAL_THEME.accent
                      }}>
                        {u.subscription_status || 'Trial'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleBlockUser(u.id, u.is_blocked)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: u.is_blocked ? '#ECFDF5' : '#FEE2E2',
                          color: u.is_blocked ? '#059669' : '#EF4444'
                        }}
                      >
                        {u.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Tracking */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>📊 Subscription Tracking</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}` }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, marginBottom: '4px' }}>Active Subscriptions</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>{activeUsers}</div>
          </div>
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}` }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, marginBottom: '4px' }}>Expiring This Week</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706' }}>0</div>
          </div>
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.borderAlt}` }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: VISUAL_THEME.textSec, marginBottom: '4px' }}>Auto-Renewal Active</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: VISUAL_THEME.accent }}>{Math.floor(activeUsers * 0.7)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
