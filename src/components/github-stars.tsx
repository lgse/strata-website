'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Github } from './github-icon';

const compactCount = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const exactCount = new Intl.NumberFormat('en');

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    async function load() {
      try {
        const response = await fetch('/api/github-stars', { signal: controller.signal });
        if (!response.ok) return;
        const data: unknown = await response.json();
        const count = data && typeof data === 'object' && 'stars' in data ? data.stars : null;
        if (
          !controller.signal.aborted &&
          typeof count === 'number' &&
          Number.isSafeInteger(count) &&
          count >= 0
        )
          setStars(count);
      } catch {
        /* Keep a useful GitHub link if the count is unavailable. */
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  const label =
    stars === null
      ? 'Star Strata on GitHub'
      : `Strata on GitHub: ${exactCount.format(stars)} ${stars === 1 ? 'star' : 'stars'}`;
  return (
    <a
      className="github-link"
      href="https://github.com/lgse/strata"
      aria-label={label}
      title={label}
      target="_blank"
      rel="noreferrer"
    >
      <Github size={16} className="github-brand-icon" />
      <span className="github-star-divider" aria-hidden="true" />
      <span className="github-star-metric" aria-hidden="true">
        <Star size={13} className="github-star-icon" />
        <span className="github-star-count">
          {stars === null ? 'Star' : compactCount.format(stars)}
        </span>
      </span>
    </a>
  );
}
