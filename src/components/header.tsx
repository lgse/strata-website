'use client';

import { useState } from 'react';
import { ArrowUpRight, Download, Menu, X } from 'lucide-react';
import { GitHubStars } from './github-stars';
import { Logo } from './logo';
import { ThemePicker } from './theme-picker';
import { discordInvite } from '@/lib/site-links';

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-shell">
        <a className="wordmark" href="#" aria-label="Strata home">
          <Logo />
          <span>
            strata<span className="wordmark-dot">.</span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#themes">Themes</a>
          <a href="https://github.com/lgse/strata#installation" target="_blank" rel="noreferrer">
            Docs <ArrowUpRight size={11} />
          </a>
          <a href={discordInvite} target="_blank" rel="noreferrer">
            Discord <ArrowUpRight size={11} aria-hidden="true" />
          </a>
        </nav>
        <div className="nav-actions">
          <ThemePicker />
          <GitHubStars />
          <a className="nav-download" href="#download">
            Get Strata <Download size={14} aria-hidden="true" />
          </a>
          <button
            className="mobile-menu-button icon-button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {open && (
          <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
            <a onClick={() => setOpen(false)} href="#features">
              Features
            </a>
            <a onClick={() => setOpen(false)} href="#themes">
              Themes
            </a>
            <a onClick={() => setOpen(false)} href="#download">
              Download
            </a>
            <a href="https://github.com/lgse/strata#installation">
              Documentation <ArrowUpRight size={13} />
            </a>
            <a href={discordInvite} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              Discord <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
