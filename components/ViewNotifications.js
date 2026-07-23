'use client';

import { useState, useEffect } from 'react';

export default function ViewNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [statusText, setStatusText] = useState('Disabled ❌');

  // Load initial notification status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const savedSetting = localStorage.getItem('notifications_enabled');
        const active = savedSetting !== 'false';
        setIsEnabled(active);
        setStatusText(active ? 'Enabled ✅' : 'Disabled ❌');
      } else {
        setIsEnabled(false);
        setStatusText('Disabled ❌');
      }
    }
  }, []);

  // Handle Toggle Click (Required user action for Mobile Chrome & Safari)
  const handleToggle = async () => {
    if (typeof window === 'undefined') return;

    // 1. Browser Support Check
    if (!('Notification' in window)) {
      alert("Aapka browser notifications support nahi karta. Please Chrome ya Browser update karein.");
      return;
    }

    // 2. Turning ON
    if (!isEnabled) {
      try {
        let currentPermission = Notification.permission;

        // Request Permission if not already granted
        if (currentPermission !== 'granted') {
          currentPermission = await Notification.requestPermission();
        }

        if (currentPermission === 'granted') {
          setIsEnabled(true);
          setStatusText('Enabled ✅');
          localStorage.setItem('notifications_enabled', 'true');

          // Send Test Notification
          try {
            new Notification("Task Planner", {
              body: "Notifications active ho gaye hain! Fast alerts ready hain.",
            });
          } catch (e) {
            console.log("Test notification error:", e);
          }
        } else {
          setIsEnabled(false);
          setStatusText('Disabled ❌');
          localStorage.setItem('notifications_enabled', 'false');
          alert(
            "Notification Permission Denied!\n\nMobile browser permissions block ho gayi hain. Isko fix karne ke liye:\n1. Browser ke 3 dots (Menu) par click karein.\n2. Settings > Site Settings > Notifications mein jaakar Permission 'Allow' karein."
          );
        }
      } catch (error) {
        console.error("Notification permission error:", error);
        alert("Error enabling notification: " + error.message);
      }
    } else {
      // 3. Turning OFF
      setIsEnabled(false);
      setStatusText('Disabled ❌');
      localStorage.setItem('notifications_enabled', 'false');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-2 sm:p-0">
      {/* Main Settings Box */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Desktop Notification & Sound Alerts
          </h2>
          <p className="text-sm font-medium mt-1">
            Status: <span className={isEnabled ? "text-green-600" : "text-red-500"}>{statusText}</span>
          </p>
        </div>

        {/* Toggle Switch & Status */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {isEnabled ? 'ON' : 'OFF'}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isEnabled ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={isEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Guide Box */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Kaise Kaam Karega?</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 leading-relaxed">
          <li>
            Aapke tasks mein aap jo exact time (jaise <span className="font-semibold text-gray-800">02:30 PM</span>) set karoge, wahi time par desktop popup sound ke sath trigger hoga.
          </li>
          <li>
            Jab aap ise <span className="font-bold text-gray-800">OFF</span> kar doge, toh koi pop-up ya sound nahi aayega.
          </li>
        </ul>
      </div>
    </div>
  );
}
