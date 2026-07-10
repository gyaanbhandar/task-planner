export const CATEGORIES = [
  { id: 'personal', name: 'Personal', icon: '👤', color: '#a29bfe' },
  { id: 'work', name: 'Work', icon: '💼', color: '#00b894' },
  { id: 'websites', name: 'My Websites', icon: '🌐', color: '#0984e3' },
  { id: 'clients', name: 'Clients', icon: '🤝', color: '#fdcb6e' },
  { id: 'leadgen', name: 'Lead Gen', icon: '🎯', color: '#e17055' },
];

export const PRIORITY_COLORS = { 
  high: '#ff6b6b', 
  medium: '#ffa502', 
  low: '#a4b0be' 
};

export const THEMES = {
  dark: {
    bg: '#000000',
    surface: '#0A0A0C',
    sidebar: '#050505',
    border: '#18181C',
    borderAlt: '#222227',
    text: '#F4F4F5',
    textSec: '#8E8E93',
    textDim: '#3A3A3C',
    inputBg: '#020202',
  },
  light: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    sidebar: '#F4F4F5',
    border: '#E4E4E7',
    borderAlt: '#E4E4E7',
    text: '#09090B',
    textSec: '#71717A',
    textDim: '#A1A1AA',
    inputBg: '#FFFFFF',
  },
};

export function getS(t) {
  return {
    input: { 
      background: t.inputBg, 
      border: '1px solid ' + t.border, 
      borderRadius: '8px', 
      padding: '10px 12px', 
      color: t.text, 
      fontSize: '13px', 
      outline: 'none', 
      width: '100%', 
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    label: { 
      fontSize: '11px', 
      fontFamily: 'monospace', 
      textTransform: 'uppercase', 
      letterSpacing: '0.5px', 
      color: t.textSec, 
      fontWeight: '600' 
    },
  };
}
