'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { THEMES } from '../constants/taskConstants';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('tp-theme');
    if (saved) {
      setTheme(saved);
      document.body.className = saved;
    } else {
      document.body.className = 'dark';
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('tp-theme', next);
      document.body.className = next;
      return next;
    });
  };

  const t = THEMES[theme];

  return (
    <ThemeContext.Provider value={{ theme, t, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
