'use client';
import React, { useState, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { notificationService } from '../services/notificationService';

export default function ViewNotifications({ setInspectedTask }) {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (notificationService.hasSupport()) {
      setPermission(notificationService.getPermission());
    }
  }, []);

  // Web Audio API to play a clean chime sound without needing an external MP3 file
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const handleEnableNotifications = async () => {
    const perm = await notificationService.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      playNotificationSound();
      notificationService.send('Notifications Enabled! ⚡', 'Aapke scheduled tasks par browser desktop alert sound ke sath aayega.');
    }
  };

  const handleTestNotification = () => {
    playNotificationSound();
    notificationService.send('Task Planner Reminder ⏰', 'Yeh ek test notification hai sound ke sath!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
      
      {/* Permission Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: VISUAL_THEME.text }}>
            Desktop Notification & Sound Alerts
          </h3>
          <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
            Status: <strong style={{ color: permission === 'granted' ? '#10B981' : permission === 'denied' ? '#EF4444' : '#F59E0B' }}>
              {permission === 'granted' ? 'Active ✓' : permission === 'denied' ? 'Blocked ✕' : 'Action Required ⚠️'}
            </strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {permission !== 'granted' ? (
            <button onClick={handleEnableNotifications} style={{ padding: '10px 18px', background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              🔔 Enable Notifications
            </button>
          ) : (
            <button onClick={handleTestNotification} style={{ padding: '10px 18px', background: '#ECFDF5', color: '#059669', border: '1px solid #10B981', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              🔊 Test Sound & Alert
            </button>
          )}
        </div>
      </div>

      {/* Reminder Info Box */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Kaise Kaam Karega?</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: VISUAL_THEME.textSec, lineHeight: 1.8 }}>
          <li>Aapke <strong>Today's Tasks</strong> mein jis task ka exact time (jaise 02:30 PM) aayega, tab browser automatic desktop popup screen ke corner par bhejega.</li>
          <li>Notification ke sath ek 🔔 sound tone play hogi taaki aapka koi important task miss na ho.</li>
        </ul>
      </div>

    </div>
  );
}
