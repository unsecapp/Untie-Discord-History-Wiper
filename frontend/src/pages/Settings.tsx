import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Palette, Moon, Sun, Check } from 'lucide-react';

const ACCENT_COLORS = [
  { name: 'Purple', value: '#7c5cfc', hover: '#9478ff' },
  { name: 'Blue', value: '#3b82f6', hover: '#60a5fa' },
  { name: 'Green', value: '#10b981', hover: '#34d399' },
  { name: 'Pink', value: '#ec4899', hover: '#f472b6' },
  { name: 'Orange', value: '#f97316', hover: '#fb923c' },
  { name: 'Red', value: '#ef4444', hover: '#f87171' },
  { name: 'Cyan', value: '#06b6d4', hover: '#22d3ee' },
  { name: 'Yellow', value: '#eab308', hover: '#facc15' },
];

const THEMES = [
  { 
    name: 'Matte Black', 
    value: 'dark',
    colors: {
      'bg-primary': '#0a0a0a',
      'bg-secondary': '#141414',
      'bg-tertiary': '#1f1f1f',
      'bg-hover': '#2a2a2a',
      'border': '#2a2a2a',
      'text-primary': '#e4e4e7',
      'text-secondary': '#a1a1aa',
      'text-muted': '#71717a',
    }
  },
  { 
    name: 'Deep Blue', 
    value: 'blue',
    colors: {
      'bg-primary': '#0a0a0f',
      'bg-secondary': '#12121a',
      'bg-tertiary': '#1a1a26',
      'bg-hover': '#22222e',
      'border': '#2a2a3a',
      'text-primary': '#e4e4e7',
      'text-secondary': '#a1a1aa',
      'text-muted': '#71717a',
    }
  },
  { 
    name: 'Light', 
    value: 'light',
    colors: {
      'bg-primary': '#ffffff',
      'bg-secondary': '#f9fafb',
      'bg-tertiary': '#f3f4f6',
      'bg-hover': '#e5e7eb',
      'border': '#e5e7eb',
      'text-primary': '#18181b',
      'text-secondary': '#52525b',
      'text-muted': '#71717a',
    }
  },
];

export default function Settings() {
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [theme, setTheme] = useState(THEMES[0]);

  useEffect(() => {
    const savedAccent = localStorage.getItem('untie_accent');
    const savedTheme = localStorage.getItem('untie_theme');

    if (savedAccent) {
      const found = ACCENT_COLORS.find(c => c.value === savedAccent);
      if (found) setAccentColor(found);
    }

    if (savedTheme) {
      const found = THEMES.find(t => t.value === savedTheme);
      if (found) setTheme(found);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply accent colors
    root.style.setProperty('--color-accent', accentColor.value);
    root.style.setProperty('--color-accent-hover', accentColor.hover);
    
    // Apply theme colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    localStorage.setItem('untie_accent', accentColor.value);
    localStorage.setItem('untie_accent_hover', accentColor.hover);
    localStorage.setItem('untie_theme', theme.value);
  }, [accentColor, theme]);

  return (
    <div className="p-8 max-w-3xl">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-sm text-text-muted mb-8">Customize your Untie experience</p>
      </div>

      {/* Accent Color */}
      <div
        className="bg-bg-secondary border border-border rounded-2xl p-6 mb-6 animate-slide-up"
        style={{ animationDelay: '50ms' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Palette size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Accent Color</h2>
            <p className="text-xs text-text-muted">Choose your preferred accent color</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color)}
              className="group relative bg-bg-tertiary hover:bg-bg-hover border border-border rounded-xl p-4 transition-all"
            >
              <div
                className="w-full h-12 rounded-lg mb-3 transition-transform group-hover:scale-105"
                style={{ backgroundColor: color.value }}
              />
              <p className="text-xs font-medium text-text-secondary text-center">{color.name}</p>
              {accentColor.value === color.value && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Check size={14} style={{ color: color.value }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div
        className="bg-bg-secondary border border-border rounded-2xl p-6 animate-slide-up"
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            {theme.value === 'light' ? (
              <Sun size={18} className="text-accent" />
            ) : (
              <Moon size={18} className="text-accent" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Theme</h2>
            <p className="text-xs text-text-muted">Select your preferred color scheme</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t)}
              className="group relative bg-bg-tertiary hover:bg-bg-hover border border-border rounded-xl p-4 transition-all"
            >
              <div className="space-y-2 mb-3">
                <div
                  className="w-full h-3 rounded"
                  style={{ backgroundColor: t.colors['bg-primary'] }}
                />
                <div
                  className="w-full h-3 rounded"
                  style={{ backgroundColor: t.colors['bg-secondary'] }}
                />
                <div
                  className="w-3/4 h-3 rounded"
                  style={{ backgroundColor: t.colors['bg-tertiary'] }}
                />
              </div>
              <p className="text-xs font-medium text-text-secondary text-center">{t.name}</p>
              {theme.value === t.value && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accentColor.value }}
                >
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
