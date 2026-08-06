'use client';
import React, { useState, useEffect } from 'react';
import { CATEGORIES, PRIORITY_CONFIG, VISUAL_THEME } from '../constants/taskConstants';

export default function FormPanel({ form: initialForm, editTask, onSubmit, onClose }) {
  // Helper: Convert Date + Time string into valid datetime-local value (YYYY-MM-DDTHH:mm)
  const formatToDateTimeLocal = (dateStr, timeStr) => {
    let d = dateStr || new Date().toISOString().split('T')[0];
    let t = '09:00';

    if (timeStr) {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        let [_, hours, minutes, period] = match;
        let h = parseInt(hours, 10);
        if (period.toUpperCase() === 'PM' && h < 12) h += 12;
        if (period.toUpperCase() === 'AM' && h === 12) h = 0;
        t = `${h.toString().padStart(2, '0')}:${minutes}`;
      } else if (/^\d{2}:\d{2}$/.test(timeStr)) {
        t = timeStr;
      }
    }

    if (d.includes('T')) return d; // Already datetime-local
    return `${d}T${t}`;
  };

  const [localForm, setLocalForm] = useState(initialForm || {
    title: '',
    description: '',
    category: 'personal',
    subcategory: '',
    priority: 'medium',
    deadline: formatToDateTimeLocal('', '09:00 AM'),
    type: 'daily'
  });

  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Sync state when editing a task or initialForm changes
  useEffect(() => {
    if (initialForm || editTask) {
      const source = editTask || initialForm || {};
      const deadlineValue = formatToDateTimeLocal(
        source.deadline || source.date,
        source.time
      );
      setLocalForm({
        ...source,
        title: source.title || '',
        description: source.description || '',
        category: source.category || 'personal',
        subcategory: source.subcategory || '',
        priority: source.priority || 'medium',
        deadline: deadlineValue,
        type: source.type || 'daily'
      });
    }
  }, [initialForm, editTask]);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobileDevice(window.innerWidth < 1024);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleSave = () => {
    if (!localForm.title.trim()) return;

    let formattedTime = '09:00 AM';
    let formattedDate = localForm.deadline;

    // Extract exact Date and Time from datetime-local input (e.g., "2026-07-25T13:03")
    if (localForm.deadline && localForm.deadline.includes('T')) {
      const [datePart, timePart] = localForm.deadline.split('T');
      formattedDate = datePart;

      if (timePart) {
        const [h, m] = timePart.split(':');
        let hours = parseInt(h, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        formattedTime = `${hours.toString().padStart(2, '0')}:${m || '00'} ${ampm}`;
      }
    }

    // Prepare complete payload with explicitly calculated `time`
    const payload = {
      ...localForm,
      title: localForm.title.trim(),
      deadline: formattedDate,
      date: formattedDate,
      time: formattedTime, // <--- Fixed! Now sends exact AM/PM formatted time to database
    };

    onSubmit(payload);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: isMobileDevice ? 'flex-end' : 'center', 
        justifyContent: 'center', 
        background: 'rgba(15, 23, 42, 0.4)', 
        backdropFilter: 'blur(8px)', 
        padding: isMobileDevice ? '0' : '24px', 
        boxSizing: 'border-box'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        style={{ 
          background: '#FFFFFF', 
          borderRadius: isMobileDevice ? '24px 24px 0 0' : '20px', 
          padding: isMobileDevice ? '28px 20px 40px' : '32px', 
          width: '100%', 
          maxWidth: '520px', 
          maxHeight: isMobileDevice ? '92vh' : '85vh', 
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', 
          border: isMobileDevice ? 'none' : `1px solid ${VISUAL_THEME.border}`,
          boxSizing: 'border-box',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          outline: 'none'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none !important; }`}} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h2 style={{ fontSize: isMobileDevice ? '22px' : '20px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0, letterSpacing: '-0.5px' }}>
              {editTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '6px 0 0 0', lineHeight: '1.4' }}>
              Configure parameters and reminder intervals.
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: VISUAL_THEME.textSec }}>✕</button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Task Title *</label>
            <input 
              type="text" 
              placeholder="e.g., Ansh se baat karni hai" 
              value={localForm.title} 
              onChange={e => setLocalForm({ ...localForm, title: e.target.value })} 
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Description</label>
            {/* Rich Text Toolbar */}
            <div style={{ display: 'flex', gap: '2px', padding: '6px 8px', background: '#F1F5F9', borderRadius: '12px 12px 0 0', border: `1px solid ${VISUAL_THEME.border}`, borderBottom: 'none', flexWrap: 'wrap' }}>
              {[
                { cmd: 'bold', icon: 'B', title: 'Bold', style: { fontWeight: 700 } },
                { cmd: 'italic', icon: 'I', title: 'Italic', style: { fontStyle: 'italic' } },
                { cmd: 'underline', icon: 'U', title: 'Underline', style: { textDecoration: 'underline' } },
                { cmd: 'strikeThrough', icon: 'S', title: 'Strikethrough', style: { textDecoration: 'line-through' } },
              ].map(btn => (
                <button
                  key={btn.cmd}
                  type="button"
                  title={btn.title}
                  onMouseDown={(e) => { e.preventDefault(); document.execCommand(btn.cmd, false, null); }}
                  style={{ width: '30px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', ...btn.style }}
                  onMouseEnter={e => e.target.style.background = '#E2E8F0'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  {btn.icon}
                </button>
              ))}
              <div style={{ width: '1px', background: '#CBD5E1', margin: '2px 4px' }} />
              <button
                type="button"
                title="Insert Link"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const sel = window.getSelection();
                  const selectedText = sel.toString();
                  const url = prompt('Enter URL:', 'https://');
                  if (url) {
                    if (selectedText) {
                      document.execCommand('createLink', false, url);
                      // Make link open in new tab
                      setTimeout(() => {
                        const editorEl = document.getElementById('desc-editor');
                        if (editorEl) {
                          editorEl.querySelectorAll('a').forEach(a => {
                            a.setAttribute('target', '_blank');
                            a.setAttribute('rel', 'noopener noreferrer');
                          });
                        }
                      }, 0);
                    } else {
                      const linkText = prompt('Link text:', url);
                      document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText || url}</a>`);
                    }
                  }
                }}
                style={{ width: '30px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.target.style.background = '#E2E8F0'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                🔗
              </button>
              <button
                type="button"
                title="Remove Link"
                onMouseDown={(e) => { e.preventDefault(); document.execCommand('unlink', false, null); }}
                style={{ width: '30px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'line-through' }}
                onMouseEnter={e => e.target.style.background = '#E2E8F0'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                🔗
              </button>
              <div style={{ width: '1px', background: '#CBD5E1', margin: '2px 4px' }} />
              <button
                type="button"
                title="Bullet List"
                onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false, null); }}
                style={{ width: '30px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.target.style.background = '#E2E8F0'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                •≡
              </button>
              <button
                type="button"
                title="Numbered List"
                onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertOrderedList', false, null); }}
                style={{ width: '30px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.target.style.background = '#E2E8F0'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                1.
              </button>
            </div>
            {/* Rich Text Editor Area */}
            <div
              id="desc-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setLocalForm(prev => ({ ...prev, description: e.currentTarget.innerHTML }))}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                // Auto-detect URLs in pasted text and make them clickable
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const html = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
                document.execCommand('insertHTML', false, html);
              }}
              dangerouslySetInnerHTML={{ __html: localForm.description || '' }}
              style={{ width: '100%', minHeight: '90px', maxHeight: '160px', overflowY: 'auto', padding: '14px 16px', borderRadius: '0 0 12px 12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box', lineHeight: 1.6, outline: 'none', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            />
            <style dangerouslySetInnerHTML={{__html: `
              #desc-editor a { color: ${VISUAL_THEME.accent}; text-decoration: underline; cursor: pointer; word-break: break-all; }
              #desc-editor ul, #desc-editor ol { margin: 4px 0; padding-left: 20px; }
              #desc-editor li { margin: 2px 0; }
              #desc-editor:empty::before { content: 'Add details, links, notes...'; color: #94A3B8; pointer-events: none; }
            `}} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobileDevice ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Category</label>
              <select 
                value={localForm.category} 
                onChange={e => setLocalForm({ ...localForm, category: e.target.value })} 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Client Name / Subcategory</label>
              <input 
                type="text" 
                placeholder="e.g., ABC, Horizon Solutions" 
                value={localForm.subcategory} 
                onChange={e => setLocalForm({ ...localForm, subcategory: e.target.value })} 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobileDevice ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Due Date & Time</label>
              <input 
                type="datetime-local" 
                value={localForm.deadline} 
                onChange={e => setLocalForm({ ...localForm, deadline: e.target.value })} 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', color: VISUAL_THEME.text, background: '#F8FAFC', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Schedule Type</label>
              <select 
                value={localForm.type} 
                onChange={e => setLocalForm({ ...localForm, type: e.target.value })} 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box' }}
              >
                <option value="one-time">One-time Task</option>
                <option value="daily">Daily Reminder</option>
                <option value="weekly">Weekly Routine</option>
                <option value="monthly">Monthly Audit</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Priority Level</label>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              {Object.keys(PRIORITY_CONFIG).map(pKey => {
                const conf = PRIORITY_CONFIG[pKey];
                const isSelected = localForm.priority === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setLocalForm({ ...localForm, priority: pKey })}
                    style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: isSelected ? `2px solid ${conf.color}` : `1px solid ${VISUAL_THEME.border}`, background: isSelected ? conf.bg : '#FFFFFF', color: conf.color, fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    {conf.icon} {conf.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', gap: '12px', borderTop: `1px solid ${VISUAL_THEME.border}`, paddingTop: '20px', marginTop: '12px', width: '100%' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px 0', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Cancel</button>
          <button type="button" onClick={handleSave} style={{ flex: 1, padding: '14px 0', borderRadius: '12px', border: 'none', background: VISUAL_THEME.accent, color: '#FFFFFF', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Save Task</button>
        </div>
      </div>
    </div>
  );
}
