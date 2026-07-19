'use client';
import React, { useState, useEffect } from 'react';
import { CATEGORIES, PRIORITY_CONFIG, VISUAL_THEME } from '../constants/taskConstants';

export default function FormPanel({ form: initialForm, editTask, onSubmit, onClose }) {
  const [localForm, setLocalForm] = useState(initialForm || {
    title: '',
    description: '',
    category: 'personal',
    subcategory: '',
    priority: 'medium',
    deadline: '',
    time: '12:00 PM',
    type: 'daily'
  });

  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkWidth = () => { setIsMobileDevice(window.innerWidth < 1024); };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleSave = () => {
    if (!localForm.title.trim()) return;
    onSubmit(localForm);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', 
        alignItems: isMobileDevice ? 'flex-end' : 'center', justifyContent: 'center', 
        background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', padding: isMobileDevice ? '0' : '24px', boxSizing: 'border-box'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        style={{ 
          background: '#FFFFFF', borderRadius: isMobileDevice ? '24px 24px 0 0' : '20px', 
          padding: isMobileDevice ? '28px 20px 40px' : '32px', width: '100%', maxWidth: '520px', 
          maxHeight: isMobileDevice ? '92vh' : 'none', overflowY: 'auto', overflowX: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', border: isMobileDevice ? 'none' : `1px solid ${VISUAL_THEME.border}`,
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px', outline: 'none'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none !important; }`}} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h2 style={{ fontSize: isMobileDevice ? '22px' : '20px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>Create New Task</h2>
            <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '6px 0 0 0' }}>Structure your operational workspace loops.</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Task Title *</label>
            <input 
              type="text" placeholder="e.g., Ansh se baat karni hai" value={localForm.title} 
              onChange={e => setLocalForm({ ...localForm, title: e.target.value })} 
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobileDevice ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Category</label>
              <select 
                value={localForm.category} onChange={e => setLocalForm({ ...localForm, category: e.target.value })} 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Client / Workspace</label>
              <input 
                type="text" placeholder="e.g., Lead Gen, Horizon" value={localForm.subcategory} 
                onChange={e => setLocalForm({ ...localForm, subcategory: e.target.value })} 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Time & Date Block Frame */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Due Date</label>
              <input 
                type="date" value={localForm.deadline} onChange={e => setLocalForm({ ...localForm, deadline: e.target.value })} 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Reminder Time</label>
              <input 
                type="text" placeholder="e.g., 02:00 PM" value={localForm.time} onChange={e => setLocalForm({ ...localForm, time: e.target.value })} 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Priority Level</label>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              {Object.keys(PRIORITY_CONFIG).map(pKey => {
                const conf = PRIORITY_CONFIG[pKey];
                const isSelected = localForm.priority === pKey;
                return (
                  <button
                    key={pKey} type="button" onClick={() => setLocalForm({ ...localForm, priority: pKey })}
                    style={{ 
                      flex: 1, padding: '12px 8px', borderRadius: '12px', border: isSelected ? `2px solid ${conf.color}` : `1px solid ${VISUAL_THEME.border}`, 
                      background: isSelected ? conf.bg : '#FFFFFF', color: conf.color, fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxSizing: 'border-box'
                    }}
                  >
                    {conf.icon} {conf.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '20px', marginTop: '12px', width: '100%' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px 0', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, fontSize: '14px', fontWeight: 600 }}>Cancel</button>
          <button type="button" onClick={handleSave} style={{ flex: 1, padding: '14px 0', borderRadius: '12px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Save Task</button>
        </div>
      </div>
    </div>
  );
}
