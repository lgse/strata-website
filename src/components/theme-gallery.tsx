'use client';

import { Check, Sparkles } from 'lucide-react';
import { themes } from '@/lib/themes';
import { useTheme } from './theme-provider';
import { ThemePicker } from './theme-picker';

const ids = ['tokyo-night', 'catppuccin', 'rose-pine', 'everforest', 'dracula', 'solarized-light'];
export function ThemeGallery() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <div className="theme-gallery">
        {ids
          .map((id) => themes.find((theme) => theme.id === id))
          .filter((theme) => !!theme)
          .map((item) => (
            <button
              key={item.id}
              className={`theme-card ${theme.id === item.id ? 'active' : ''}`}
              onClick={() => setTheme(item)}
              aria-pressed={theme.id === item.id}
            >
              <div
                className="mini-app"
                style={{ background: item.background, color: item.text, borderColor: item.border }}
              >
                <div className="mini-toolbar" style={{ borderColor: item.border }}>
                  <i style={{ background: item.accent }} />
                  <i style={{ background: item.muted }} />
                  <i style={{ background: item.muted }} />
                  <span style={{ background: item.surface }} />
                </div>
                <div className="mini-body">
                  <div className="mini-sidebar" style={{ background: item.surface }}>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        style={{
                          background: n === 1 ? item.accent : item.dim_text,
                          opacity: n === 1 ? 0.7 : 0.25,
                          width: `${70 - n * 7}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mini-files">
                    {[0, 1, 2, 3].map((n) => (
                      <div key={n} style={{ background: n === 1 ? item.highlight : 'transparent' }}>
                        <i style={{ background: item.accent }} />
                        <span style={{ background: item.text, width: `${55 - n * 5}%` }} />
                      </div>
                    ))}
                  </div>
                  <div
                    className="mini-art"
                    style={{
                      background: `linear-gradient(150deg, ${item.surface}, ${item.accent})`,
                    }}
                  >
                    <div style={{ background: item.text }} />
                    <span style={{ background: item.background }} />
                  </div>
                </div>
              </div>
              <div className="theme-card-label">
                <span>
                  <i style={{ background: item.accent }} />
                  {item.name}
                </span>
                {theme.id === item.id && <Check size={14} />}
              </div>
            </button>
          ))}
      </div>
      <div className="theme-gallery-bottom">
        <span>
          <Sparkles size={15} /> You’re looking at <strong>{theme.name}</strong>. Yes, the whole
          site.
        </span>
        <ThemePicker variant="full" />
      </div>
    </>
  );
}
