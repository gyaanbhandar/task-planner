import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Empty({ text }) {
  const { t } = useTheme();
  return (
    <div style={{ textAlign: 'center', padding: 32, color: t.textSec, fontSize: 14 }}>
      {text}
    </div>
  );
}
