'use client';
import React, { useState } from 'react';
import { CATEGORIES, PRIORITY_CONFIG, VISUAL_THEME } from '../constants/taskConstants';

export default function FormPanel({ form: initialForm, editTask, onSubmit, onClose, isMobile }) {
  const [localForm, setLocalForm] = useState(initialForm || {
    title: '',
    description: '',
    category: 'personal',
    subcategory: '',
    priority: 'medium',
    deadline: '',
    type: 'daily'
  });

  const handleSave = () => {
    if (!localForm.title.trim()) return;
    onSubmit(localForm);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'rgba(15, 23, 42, 0.4)', 
        backdropFilter: 'blur(4px)', 
        padding: isMobile ? '0' : '24px', 
        boxSizing: 'border-box'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        style={{ 
          background: '#FFFFFF', 
          borderRadius: isMobile ? '0' : '20px', 
          padding: isMobile ? '24px 20px' : '32px', 
          width: '100%', 
          maxWidth: '520px', 
          height: isMobile ? '100vh' : 'auto', 
          maxHeight: isMobile ? '100vh' : '85vh', 
          overflowY: 'auto', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)', 
          border: isMobile ? 'none' : `1px solid ${VISUAL_THEME.border}`,
          boxSizing: 'border-box',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          outline: 'none'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ paddingRight: '12px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '20px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0, letterSpacing: '-0.5px' }}>
              {editTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '6px 0 0 0', lineHeight: '1.4' }}>
              Fill in the details to structure your operational nodes.
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: '#F1F5F9', 
              border: 'none', 
              borderRadius: '50%', 
              width: '32px', 
              height: '32px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              fontSize: '14px', 
              color: VISUAL_THEME.textSec,
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Input Form Fields Framework */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, width: '100%', boxSizing: 'border-box' }}>
          {/* Task Title */}
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '6px' }}>Task Title *</label>
            <input 
              type="text" 
              placeholder="e.g., Ansh se baat karni hai" 
              value={localForm.title} 
              onChange={e => setLocalForm({ ...localForm, title: e.target.value })} 
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
            />
          </div>

          {/* Description */}
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '6px' }}>Description</label>
            <textarea 
              placeholder="Add details or dynamic context parameters..." 
              value={localForm.description} 
              onChange={e => setLocalForm({ ...localForm, description: e.target.value })} 
              style={{ width: '100%', height: '80px', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', resize: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Grid Rows for Category & Subcategory */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '6px' }}>Category</label>
              <select 
                value={localForm.category} 
                onChange={e => setLocalForm({ ...localForm, category: e.target.value })} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '6px' }}>Client / Workspace</label>
              <input 
                type="text" 
                placeholder="e.g., Lead Gen, Horizon" 
                value={localForm.subcategory} 
                onChange={e => setLocalForm({ ...localForm, subcategory: e.target.value })} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Grid Rows for Due Date & Repeat Type */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '6px' }}>Due Date</label>
              <input 
                type="date" 
                value={localForm.deadline} 
                onChange={e => setLocalForm({ ...localForm, deadline: e.target.value })} 
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '6px' }}>Schedule Type</label>
              <select 
                value={localForm.type} 
                onChange={e => setLocalForm({ ...localForm, type: e.target.value })} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                <option value="one-time">One-time Task</option>
                <option value="daily">Daily Reminder</option>
                <option value="weekly">Weekly Routine</option>
                <option value="monthly">Monthly Audit</option>
              </select>
            </div>
          </div>

          {/* Priority Matrix Selector */}
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '8px' }}>Priority Matrix Level</label>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              {Object.keys(PRIORITY_CONFIG).map(pKey => {
                const conf = PRIORITY_CONFIG[pKey];
                const isSelected = localForm.priority === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setLocalForm({ ...localForm, priority: pKey })}
                    style={{ 
                      flex: 1, 
                      padding: '11px 8px', 
                      borderRadius: '10px', 
                      border: isSelected ? `2px solid ${conf.color}` : `1px solid ${VISUAL_THEME.border}`, 
                      background: isSelected ? conf.bg : '#FFFFFF', 
                      color: conf.color, 
                      fontSize: isMobile ? '12px' : '13px', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    {conf.icon} {conf.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dialog Actions Panel Footer */}
        <div style={{ display: 'flex', gap: '12px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '20px', marginTop: 'auto', width: '100%', boxSizing: 'border-box', paddingBottom: isMobile ? '20px' : '0' }}>
          <button 
            type="button"
            onClick={onClose} 
            style={{ flex: 1, padding: '12px 0', borderRadius: '10px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, cursor: 'pointer', fontSize: '14px', fontWeight: 500, boxSizing: 'border-box' }}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave} 
            style={{ flex: 1, padding: '12px 0', borderRadius: '10px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)', boxSizing: 'border-box' }}
          >
            Save Task
          </button>
        </div>

      </div>
    </div>
  );
}
