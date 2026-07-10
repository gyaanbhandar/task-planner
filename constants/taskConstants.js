export const CATEGORIES = [
  { id: 'personal', name: 'Personal', icon: '👤', color: '#a29bfe' },
  { id: 'work', name: 'Work', icon: '💼', color: '#00b894' },
  { id: 'websites', name: 'My Websites', icon: '🌐', color: '#0984e3' },
  { id: 'clients', name: 'Clients', icon: '🤝', color: '#fdcb6e' },
  { id: 'leadgen', name: 'Lead Gen', icon: '🎯', color: '#e17055' },
];

// Linear Premium Mono Tag Color Mapping
export const PRIORITY_COLORS = { 
  high: '#FF6B6B', 
  medium: '#FFA502', 
  low: '#A4B0BE' 
};

// Premium SaaS Glassmorphism Color Palette Variables
export const THEMES = {
  dark: {
    bg: '#070709',          // Pitch Black Slate Background (Linear/Vercel jaisa)
    surface: '#0F0F13',     // Matte Dark Raised Surface Panel
    sidebar: '#0D0D11',     // Split Deep Core Menu Sidebar
    border: '#1F1F26',      // Premium Ultra Thin Subtle Lines Border
    borderAlt: '#272732',   // Active Input Highlight Borders
    text: '#F4F4F5',        // Sharp Crisp High-contrast Text Font
    textSec: '#71717A',     // Modern Muted Slate Description Text
    textDim: '#42424F',     // Monospace Stamp Grid Inner Captions
    inputBg: '#050507',     // Solid Inner Inset Field
  },
  light: {
    bg: '#F5F5F7', 
    surface: '#FFFFFF', 
    sidebar: '#FAFAFA', 
    border: '#E5E5EA', 
    borderAlt: '#D1D1D6',
    text: '#1A1A2E', 
    textSec: '#636366', 
    textDim: '#8E8E93',
    inputBg: '#F5F5F7',
  }
};

export const getS = (t) => ({
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    background: t.inputBg,
    border: '1px solid ' + t.border,
    color: t.text,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border 0.2s ease',
  },
  label: {
    fontSize: '10px',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: t.textSec,
    marginBottom: '4px',
    marginTop: '10px',
    fontWeight: '600',
  },
});
