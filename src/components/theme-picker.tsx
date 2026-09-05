'use client';

import { useRef, useState } from 'react';
import { Check, ChevronDown, Moon, Palette, Search, Sun, X } from 'lucide-react';
import { isLight, siteThemes } from '@/lib/themes';
import { useTheme } from './theme-provider';

const normalizeSearch = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function ThemePicker({ variant = 'nav' }: { variant?: 'nav' | 'full' }) {
  const { theme, setTheme } = useTheme();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = siteThemes.filter(
    (item) =>
      normalizeSearch(item.name).includes(normalizeSearch(query)) &&
      (filter === 'all' || isLight(item) === (filter === 'light')),
  );
  function open() {
    setQuery('');
    setFilter('all');
    dialog.current?.showModal();
  }
  return (
    <>
      <button
        className={variant === 'nav' ? 'theme-trigger' : 'button secondary'}
        onClick={open}
        aria-haspopup="dialog"
        aria-label={
          variant === 'nav' ? `Change website theme, current theme: ${theme.name}` : undefined
        }
      >
        {variant === 'nav' ? (
          <>
            <span className="theme-dot" />
            <span className="theme-trigger-name">{theme.name}</span>
            <ChevronDown size={13} />
          </>
        ) : (
          <>
            <Palette size={17} /> Try {siteThemes.length} favorites{' '}
            <span aria-hidden="true">↗</span>
          </>
        )}
      </button>
      <dialog
        ref={dialog}
        className="theme-dialog"
        aria-labelledby={`theme-title-${variant}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-heading">
            <div>
              <span className="eyebrow">MAKE YOURSELF AT HOME</span>
              <h2 id={`theme-title-${variant}`}>A different atmosphere.</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Close theme picker"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </div>
          <p>Ten community favorites, straight from Strata. Pick one. Change everything.</p>
          <label className="theme-search">
            <Search size={18} />
            <input
              autoFocus
              placeholder="Find your favorite theme…"
              aria-label="Search themes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>esc</kbd>
          </label>
          <div className="theme-filters" role="group" aria-label="Theme brightness">
            {[
              ['all', 'All favorites'],
              ['dark', 'Dark'],
              ['light', 'Light'],
            ].map(([id, label]) => (
              <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>
                {id === 'dark' && <Moon size={13} />}
                {id === 'light' && <Sun size={13} />}
                {label}
              </button>
            ))}
            <span aria-live="polite">{filtered.length} themes</span>
          </div>
          <div className="theme-results">
            {filtered.map((item) => (
              <button
                key={item.id}
                className="theme-result"
                aria-pressed={theme.id === item.id}
                onClick={() => setTheme(item)}
              >
                <span className="palette-strip" style={{ background: item.background }}>
                  <i style={{ background: item.accent }} />
                  <i style={{ background: item.text }} />
                  <i style={{ background: item.danger }} />
                  <i style={{ background: item.highlight }} />
                </span>
                <span>{item.name}</span>
                {theme.id === item.id && <Check size={16} />}
              </button>
            ))}
            {!filtered.length && (
              <div className="empty-themes">
                No themes found. Try “Tokyo”, “Catppuccin”, or “light”.
              </div>
            )}
          </div>
          <div className="dialog-footer">
            <span>
              <span className="live-dot" /> Applied live · saved on this device
            </span>
            <button onClick={() => dialog.current?.close()}>
              Looks good <Check size={14} />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
