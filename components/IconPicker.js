'use client';
import React, { useState } from 'react';
import { VISUAL_THEME, EMOJI_LIBRARY } from '../constants/taskConstants';

export default function IconPicker({ selectedIcon, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? EMOJI_LIBRARY.filter(e => e.includes(search))
    : EMOJI_LIBRARY;

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 10000,
      background: '#FFFFFF',
      borderRadius: '12px',
      border: `1px solid ${VISUAL_THEME.border}`,
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      padding: '12px',
      width: '280px',
      maxHeight: '300px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: VISUAL_THEME.textSec }}>Choose Icon</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: VISUAL_THEME.textSec }}>✕</button>
      </div>
      
      <input
        type="text"
        placeholder="Search emoji..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: '8px',
          border: `1px solid ${VISUAL_THEME.border}`,
          fontSize: '12px',
          marginBottom: '8px',
          boxSizing: 'border-box'
        }}
      />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '2px'
      }}>
        {filtered.map((emoji, i) => (
          <button
            key={i}
            onClick={() => { onSelect(emoji); onClose(); }}
            style={{
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              border: selectedIcon === emoji ? `2px solid ${VISUAL_THEME.accent}` : '1px solid transparent',
              borderRadius: '6px',
              background: selectedIcon === emoji ? 'rgba(99,102,241,0.08)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: VISUAL_THEME.textSec, padding: '12px 0' }}>No matching icons</p>
      )}
    </div>
  );
}
