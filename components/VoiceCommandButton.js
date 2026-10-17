'use client';
// ============================================
// VoiceCommandButton — floating mic + listening overlay + confirm sheet.
//
// Drop this into the dashboard once; it wires itself to useVoiceCommand.
// - Idle: a floating indigo mic button (bottom-right).
// - Listening: pulsing red, shows live transcript.
// - Confirming: a sheet listing the destructive actions, with Confirm / Cancel.
//
// Styling matches constants/taskConstants VISUAL_THEME (indigo #6366F1).
// ============================================

import React from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

// Human-readable summary of a staged action, for the confirm sheet.
function describeAction(a, tasks) {
  const titleFor = (id) => {
    const t = (tasks || []).find((x) => String(x.id) === String(id));
    return t ? t.title : `task ${id}`;
  };
  if (a.type === 'delete') {
    return { icon: '🗑️', text: `Delete ${a.ids.length} task${a.ids.length === 1 ? '' : 's'}`, list: a.ids.map(titleFor) };
  }
  if (a.type === 'reorder') {
    return { icon: '↕️', text: 'Reorder all tasks', list: (a.orderedIds || []).slice(0, 4).map(titleFor) };
  }
  if (a.type === 'complete') {
    const verb = a.done === false ? 'Mark incomplete' : 'Mark done';
    return { icon: '✅', text: `${verb} — ${a.ids.length} task${a.ids.length === 1 ? '' : 's'}`, list: a.ids.map(titleFor) };
  }
  if (a.type === 'create') {
    return { icon: '➕', text: `Create: ${a.task?.title || 'new task'}`, list: [] };
  }
  if (a.type === 'update') {
    return { icon: '✏️', text: `Update: ${titleFor(a.id)}`, list: [] };
  }
  return { icon: '•', text: a.type, list: [] };
}

export default function VoiceCommandButton({ voice, tasks, isMobile }) {
  const { status, transcript, pendingConfirm, startListening, stopListening, confirmPending, cancelConfirm } = voice;

  const listening = status === 'listening';
  const processing = status === 'processing' || status === 'executing';
  const confirming = status === 'confirming' && pendingConfirm;

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={listening ? stopListening : startListening}
        disabled={processing}
        title={listening ? 'Stop & run' : 'Voice command'}
        style={{
          position: 'fixed',
          bottom: isMobile ? '84px' : '28px',
          right: isMobile ? '18px' : '28px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          border: 'none',
          cursor: processing ? 'wait' : 'pointer',
          zIndex: 99990,
          color: '#FFFFFF',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: listening ? '#EF4444' : VISUAL_THEME.accent,
          boxShadow: listening
            ? '0 0 0 8px rgba(239,68,68,0.18), 0 10px 30px rgba(239,68,68,0.35)'
            : '0 10px 30px rgba(99,102,241,0.4)',
          transition: 'background 0.2s, box-shadow 0.2s',
          animation: listening ? 'voicePulse 1.3s ease-in-out infinite' : 'none',
        }}
      >
        {processing ? '⏳' : listening ? '⏺️' : '🎙️'}
      </button>

      {/* Live transcript pill while listening / processing */}
      {(listening || processing) && (
        <div
          style={{
            position: 'fixed',
            bottom: isMobile ? '150px' : '98px',
            right: isMobile ? '18px' : '28px',
            maxWidth: isMobile ? 'calc(100vw - 36px)' : '360px',
            background: '#1E293B',
            color: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '13px',
            lineHeight: 1.5,
            zIndex: 99990,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '2px', fontWeight: 600 }}>
            {listening ? '🔴 Sun raha hoon…' : status === 'executing' ? '⚙️ Chal raha hai…' : '🧠 Samajh raha hoon…'}
          </div>
          {transcript || <span style={{ opacity: 0.5 }}>bolna shuru karein…</span>}
        </div>
      )}

      {/* Confirmation sheet for destructive actions */}
      {confirming && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(6px)',
            padding: isMobile ? 0 : '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) cancelConfirm(); }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: isMobile ? '20px 20px 0 0' : '18px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '22px' }}>🎙️</span>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: VISUAL_THEME.text }}>Confirm karein</h3>
            </div>
            <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '0 0 4px 0' }}>
              Aapne kaha: <em>"{pendingConfirm.transcript}"</em>
            </p>
            {pendingConfirm.speak && (
              <p style={{ fontSize: '13px', color: VISUAL_THEME.text, margin: '0 0 14px 0', fontWeight: 600 }}>
                {pendingConfirm.speak}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {pendingConfirm.actions.map((a, i) => {
                const d = describeAction(a, tasks);
                const danger = a.type === 'delete';
                return (
                  <div
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: danger ? '#FEF2F2' : '#F8FAFC',
                      border: `1px solid ${danger ? '#FECACA' : VISUAL_THEME.border}`,
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: danger ? '#DC2626' : VISUAL_THEME.text }}>
                      {d.icon} {d.text}
                    </div>
                    {d.list.length > 0 && (
                      <ul style={{ margin: '6px 0 0', paddingLeft: '20px', fontSize: '12px', color: '#64748B' }}>
                        {d.list.slice(0, 6).map((name, j) => (
                          <li key={j}>{name}</li>
                        ))}
                        {d.list.length > 6 && <li>+{d.list.length - 6} more…</li>}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={cancelConfirm}
                style={{
                  flex: 1, padding: '13px 0', borderRadius: '12px',
                  border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF',
                  color: VISUAL_THEME.textSec, fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPending}
                style={{
                  flex: 2, padding: '13px 0', borderRadius: '12px', border: 'none',
                  background: VISUAL_THEME.accent, color: '#FFFFFF', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Confirm & Run
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes voicePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }`}</style>
    </>
  );
}
