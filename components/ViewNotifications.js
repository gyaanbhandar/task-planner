'use client';
import React, { useState, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { notificationService } from '../services/notificationService';

export default function ViewNotifications({ setInspectedTask }) {
  const [permission, setPermission] = useState('default');
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (notificationService.hasSupport()) {
      setPermission(notificationService.getPermission());
    }
    const savedToggle = localStorage.getItem('app_notifications_enabled');
    if (savedToggle !== null) {
      setIsEnabled(savedToggle === 'true');
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const handleToggleState = async () => {
    if (!isEnabled) {
      const perm = await notificationService.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        setIsEnabled(true);
        localStorage.setItem('app_notifications_enabled', 'true');
        playNotificationSound();
        notificationService.send('Notifications Active! 🔔', 'Desktop Alerts & Sound enabled hain.');
      }
    } else {
      setIsEnabled(false);
      localStorage.setItem('app_notifications_enabled', 'false');
    }
  };

  const handleTestNotification = () => {
    if (!isEnabled) return;
    playNotificationSound();
    notificationService.send('Task Planner Test ⏰', 'Notification and sound test working perfectly!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
      
      {/* Permission & Toggle Switch Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: VISUAL_THEME.text }}>
            Desktop Notification & Sound Alerts
          </h3>
          <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
            Status: <strong style={{ color: isEnabled && permission === 'granted' ? '#10B981' : '#EF4444' }}>
              {isEnabled && permission === 'granted' ? 'Active ✓' : 'Disabled ✕'}
            </strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* ON / OFF Toggle Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: VISUAL_THEME.textSec }}>
              {isEnabled ? 'ON' : 'OFF'}
            </span>
            <button
              onClick={handleToggleState}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                background: isEnabled ? VISUAL_THEME.accent : '#CBD5E1',
                border: 'none',
                padding: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isEnabled ? 'flex-end' : 'flex-start',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          {isEnabled && permission === 'granted' && (
            <button onClick={handleTestNotification} style={{ padding: '8px 14px', background: '#ECFDF5', color: '#059669', border: '1px solid #10B981', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
              🔊 Test Sound & Alert
            </button>
          )}
        </div>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Kaise Kaam Karega?</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: VISUAL_THEME.textSec, lineHeight: 1.8 }}>
          <li>Aapke tasks mein aap jo exact time (jaise 02:30 PM) set karoge, wahi time par desktop popup sound ke sath trigger hoga.</li>
          <li>Jab aap ise **OFF** kar doge, toh koi pop-up ya sound nahi aayega.</li>
        </ul>
      </div>

    </div>
  );
}
