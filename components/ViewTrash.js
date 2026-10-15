'use client';
import React, { useState } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function ViewTrash({
  trashedTasks,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  isMobile
}) {
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getDaysLeft = (trashedAtValue) => {
    if (!trashedAtValue) return 15;
    const trashDate = new Date(trashedAtValue);
    if (isNaN(trashDate.getTime())) return 15;
    const now = new Date();
    const diffMs = now - trashDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, 15 - diffDays);
  };

  const formatTrashDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header — restrained */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '22px' }}>🗑️</span>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: VISUAL_THEME.text }}>Trash Bin</h2>
            <span style={{ fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.textSec, background: '#F1F5F9', padding: '2px 10px', borderRadius: '999px' }}>
              {trashedTasks.length} item{trashedTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
            Deleted tasks are automatically removed after 15 days.
          </p>
        </div>
        {trashedTasks.length > 0 && (
          <button
            onClick={() => setShowConfirmEmpty(true)}
            style={{
              padding: '9px 18px',
              background: 'transparent',
              color: '#DC2626',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            🗑️ Empty trash
          </button>
        )}
      </div>

      {/* Empty Trash Confirmation */}
      {showConfirmEmpty && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '2px solid #FECACA',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px'
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626', margin: '0 0 4px 0' }}>⚠️ Permanently delete all {trashedTasks.length} items?</p>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowConfirmEmpty(false)}
              style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
            >Cancel</button>
            <button
              onClick={() => { onEmptyTrash(); setShowConfirmEmpty(false); }}
              style={{ padding: '8px 16px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >Yes, Delete All</button>
          </div>
        </div>
      )}

      {/* Trashed Tasks List */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: `1px solid ${VISUAL_THEME.border}`,
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        {trashedTasks.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.4 }}>🗑️</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: VISUAL_THEME.text, margin: '0 0 4px 0' }}>Trash is empty</p>
            <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>Deleted tasks will appear here for 15 days before being permanently removed.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trashedTasks.map(t => {
              const daysLeft = getDaysLeft(t.trashed_at);
              const isDeleting = deletingId === t.id;

              return (
                <div
                  key={t.id}
                  style={{
                    padding: isMobile ? '14px' : '14px 18px',
                    borderRadius: '12px',
                    border: `1px solid ${VISUAL_THEME.border}`,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: isMobile ? '12px' : '12px',
                    opacity: isDeleting ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                    background: daysLeft <= 3 ? '#FFFBEB' : '#FFFFFF'
                  }}
                >
                  {/* Task Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#94A3B8',
                      textDecoration: 'line-through',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: isMobile ? 'normal' : 'nowrap',
                      wordBreak: 'break-word'
                    }}>
                      {t.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {t.category && (
                        <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, textTransform: 'capitalize' }}>
                          {t.category}
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        Deleted {formatTrashDate(t.trashed_at)}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: daysLeft <= 3 ? '#DC2626' : daysLeft <= 7 ? '#D97706' : '#64748B'
                      }}>
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} until permanent deletion
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                    paddingTop: isMobile ? '8px' : '0',
                    borderTop: isMobile ? '1px solid #F1F5F9' : 'none'
                  }}>
                    <button
                      onClick={() => onRestore(t.id)}
                      style={{
                        padding: '7px 14px',
                        background: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#D1FAE5'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ECFDF5'}
                    >
                      ♻️ Restore
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(t.id);
                        if (window.confirm('Permanently delete this task? This cannot be undone.')) {
                          onPermanentDelete(t.id);
                        }
                        setDeletingId(null);
                      }}
                      style={{
                        padding: '7px 14px',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                      onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
