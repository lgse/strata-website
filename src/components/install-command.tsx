'use client';
import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
export const installCommand =
  'curl -fsSL https://raw.githubusercontent.com/lgse/strata/main/install.sh | bash';
export function InstallCommand({ variant = 'full' }: { variant?: 'full' | 'hero' }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
      setError(true);
    }
  }
  return (
    <div
      className={`install-terminal ${variant === 'hero' ? 'hero-terminal' : ''}`}
      role="region"
      aria-label={variant === 'hero' ? 'Quick install Strata' : 'Install Strata'}
    >
      <div className="terminal-heading">
        <span>
          <Terminal size={14} />{' '}
          {variant === 'hero' ? 'THE INTERACTIVE INSTALLER' : 'YOUR TERMINAL. ONE COMMAND.'}
        </span>
        {variant === 'hero' ? (
          <a
            href="https://github.com/lgse/strata/blob/main/install.sh"
            target="_blank"
            rel="noreferrer"
          >
            Review script ↗
          </a>
        ) : (
          <span>bash</span>
        )}
      </div>
      <div className="terminal-command">
        <span className="terminal-dollar">$</span>
        <code>{installCommand}</code>
        <button
          onClick={copy}
          aria-label={copied ? 'Install command copied' : 'Copy install command'}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
      <div className="terminal-note" aria-live="polite">
        {error ? (
          'Clipboard unavailable. Select and copy the command above.'
        ) : copied ? (
          'Copied. Review the installer before running it.'
        ) : (
          <>
            <Check size={12} /> Architecture detection <span>·</span> Verified downloads{' '}
            <span>·</span> Asks before sudo
          </>
        )}
      </div>
    </div>
  );
}
