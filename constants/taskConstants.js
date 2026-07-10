export const CATEGORIES = [
  { id: 'personal', name: 'Personal', icon: '🧘', color: '#a29bfe' },
  { id: 'work', name: 'Work', icon: '💼', color: '#00b894' },
  { id: 'websites', name: 'My Websites', icon: '🌐', color: '#0984e3' },
  { id: 'clients', name: 'Clients', icon: '👥', color: '#fdcb6e' },
  { id: 'leadgen', name: 'Lead Gen', icon: '🎯', color: '#e17055' },
];

export const PRIORITY_COLORS = { 
  high: '#ff6b6b', 
  medium: '#ffa502', 
  low: '#a4b0be' 
};

export const THEMES = {
  dark: {
    bg: '#0F1117', surface: '#1A1D27', sidebar: '#14161F', border: '#1e2130', borderAlt: '#2a2d3a',
    text: '#E8E8ED', textSec: '#8B8D97', textDim: '#555',
    inputBg: '#0F1117',
  },
  light: {
    bg: '#F5F5F7', surface: '#FFFFFF', sidebar: '#FAFAFA', border: '#E5E5EA', borderAlt: '#D1D1D6',
    text: '#1a1a2e', textSec: '#6b6b80', textDim: '#aaa',
    inputBg: '#F0F0F5',
  },
};

export function getS(t) {
  return {
    input: { background: t.inputBg, border: '1px solid ' + t.borderAlt, borderRadius: 8, padding: '10px 12px', color: t.text, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
    label: { fontSize: 11, color: t.textSec, fontWeight: 700, letterSpacing: 0.3 },
    primaryBtn: { background: '#6C5CE7', border: 'none', borderRadius: 10, padding: '12px 0', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' },
  };
}
