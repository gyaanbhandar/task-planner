'use client';

import { useState, useEffect } from 'react';

export default function ViewNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [statusText, setStatusText] = useState('Disabled ❌');
  const [isIOS, setIsIOS] = useState(false);

  // Load initial notification status safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is on iPhone / iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const ios = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(ios);

      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const savedSetting = localStorage.getItem('notifications_enabled');
          const active = savedSetting !== 'false';
          setIsEnabled(active);
          setStatusText(active ? 'Active ✓' : 'Disabled ❌');
        } else if (Notification.permission === 'denied') {
          setIsEnabled(false);
          setStatusText('Blocked ❌');
        } else {
          setIsEnabled(false);
          setStatusText('Disabled ❌');
        }
      } else {
        setStatusText('Not Supported ❌');
      }
    }
  }, []);

  // Handle Toggle Switch Click with Mobile Unblock Helper
  const handleToggle = async () => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      alert("Aapka mobile browser web notifications support nahi karta hai.");
      return;
    }

    // Special Guide for iPhone Users
    if (isIOS && Notification.permission !== 'granted') {
      alert(
        "📱 iPhone Users ke liye Guide:\n\niOS Safari normal browser tab me notifications block karta hai.\n\n1. Safari me niche Share button par tap karein.\n2. 'Add to Home Screen' chunein.\n3. Home Screen wali App icon se khol kar Toggle ON karein."
      );
      return;
    }

    // If Chrome Mobile automatically blocked permissions
    if (Notification.permission === 'denied') {
      alert(
        "🔒 Permission Browser Se Blocked Hai!\n\nMobile Chrome par Allow karne ke steps:\n\n1. Browser me URL ke paas 🔒 (Lock icon) ya 3 Dots par click karein.\n2. 'Permissions' ya 'Site Settings' kholne.\n3. 'Notifications' ko 'Allow' kar dein.\n4. Page Refresh karke wapis Toggle ON karein!"
      );
      return;
    }

    // Standard Toggle Flow
    if (!isEnabled) {
      try {
        let currentPermission = Notification.permission;

        if (currentPermission !== 'granted') {
          currentPermission = await Notification.requestPermission();
        }

        if (currentPermission === 'granted') {
          setIsEnabled(true);
          setStatusText('Active ✓');
          localStorage.setItem('notifications_enabled', 'true');

          try {
            new Notification("Task Planner", {
              body: "Notifications active ho gaye hain!",
            });
          } catch (e) {
            console.log("Notification trigger error:", e);
          }
        } else {
          setIsEnabled(false);
          setStatusText('Blocked ❌');
          localStorage.setItem('notifications_enabled', 'false');
        }
      } catch (error) {
        console.error("Permission request error:", error);
      }
    } else {
      setIsEnabled(false);
      setStatusText('Disabled ❌');
      localStorage.setItem('notifications_enabled', 'false');
    }
  };

  // Test Sound & Notification Trigger Button
  const handleTestAlert = () => {
    if (typeof window === 'undefined') return;

    // Play Beep Sound Tone
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log("Audio play error:", e);
    }

    // Trigger Test Popup
    if ('Notification' in window && Notification.permission === 'granted' && isEnabled) {
      new Notification("Task Planner Test Alert 🔔", {
        body: "Sound and Desktop Alert successfully test ho gaya hai!",
      });
    } else {
      alert("🔊 Sound Test Triggered!\n\n(Popup notification ke liye pehle toggle switch par click karke permissions allow karein)");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px', boxSizing: 'border-box' }}>
      
      {/* CARD 1: Toggle & Status Box */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
            Desktop Notification & Sound Alerts
          </h2>
          <p style={{ fontSize: '14px', margin: 0, color: '#64748b', fontWeight: '500' }}>
            Status: <span style={{ color: isEnabled ? '#16a34a' : '#ef4444', fontWeight: '700' }}>{statusText}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Test Sound Button */}
          <button
            type="button"
            onClick={handleTestAlert}
            style={{
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔊 Test Sound & Alert
          </button>

          {/* ON / OFF Toggle Switch */}
          <div 
            onClick={handleToggle}
            style={{
              width: '50px',
              height: '26px',
              backgroundColor: isEnabled ? '#6366f1' : '#cbd5e1',
              borderRadius: '20px',
              padding: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isEnabled ? 'flex-end' : 'flex-start',
              transition: 'background-color 0.2s ease',
              boxSizing: 'border-box'
            }}
          >
            <div 
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          </div>

        </div>
      </div>

      {/* CARD 2: Information Guide Box */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0' }}>
          Kaise Kaam Karega?
        </h3>
        
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '8px' }}>
            Aapke <strong>Today's Tasks</strong> mein jis task ka exact time (jaise 02:30 PM) aayega, tab browser automatic popup screen ke corner par bhejega.
          </li>
          <li>
            Notification ke sath ek 🔔 sound tone play hogi taaki aapka koi important task miss na ho.
          </li>
        </ul>
      </div>

    </div>
  );
}
