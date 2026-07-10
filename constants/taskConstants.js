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
    bg: '#070709',
    surface: '#0F0F13',
    sidebar: '#0D0D11',
    border: '#1F1F26',
    borderAlt: '#272732',
    text: '#F4F4F5',
    textSec: '#71717A',
    textDim: '#42424F',
    inputBg: '#050507',
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
    input: { background: t.inputBg, border: '1px solid ' + t.borderAlt, borderRadius: 10, padding: '11px 14px', color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    label: { fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', color: t.textSec, fontWeight: 600 },
    primaryBtn: { background: '#6C5CE7', border: 'none', borderRadius: 10, padding: '12px 0', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' },
  };
}
