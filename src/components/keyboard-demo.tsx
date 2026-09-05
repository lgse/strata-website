'use client';

import { useState } from 'react';
import { CornerDownLeft, FileCode2, FileText, Folder, Search } from 'lucide-react';
const items = [
  { name: 'theme.rs', path: 'strata / src / ui', icon: FileCode2 },
  { name: 'themes.md', path: 'strata / docs', icon: FileText },
  { name: 'themes', path: 'strata / data', icon: Folder },
  { name: 'tokyo-night.toml', path: 'strata / themes', icon: FileCode2 },
];
export function KeyboardDemo() {
  const [query, setQuery] = useState('theme');
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState('');
  const matches = items.filter((item) =>
    [item.name, item.path].some((source) => {
      let index = -1;
      return [...query.toLowerCase()].every((char) => {
        index = source.toLowerCase().indexOf(char, index + 1);
        return index !== -1;
      });
    }),
  );
  return (
    <div className="search-playground">
      <label className="playground-input">
        <Search size={19} />
        <input
          value={query}
          aria-label="Try fuzzy filename search"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpened('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) =>
                matches.length
                  ? (a + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length
                  : 0,
              );
            }
            if (e.key === 'Enter' && matches[active]) setOpened(matches[active].name);
          }}
        />
        <kbd>ctrl K</kbd>
      </label>
      <div className="search-results">
        {matches.map(({ name, path, icon: Icon }, i) => (
          <button
            key={name}
            className={active === i ? 'active' : ''}
            onClick={() => {
              setActive(i);
              setOpened(name);
            }}
          >
            <Icon size={18} />
            <span>
              <strong>{name}</strong>
              <small>{path}</small>
            </span>
            {i === active && <CornerDownLeft size={15} />}
          </button>
        ))}
        {!matches.length && <p>No matches. Try “tm” or “rs”.</p>}
      </div>
      <div className="search-playground-footer">
        <span aria-live="polite">
          {opened
            ? `Selected ${opened} · demo only`
            : `${matches.length} results · filename + path search`}
        </span>
        <span>
          ↑ ↓ <span className="hide-small">navigate</span> ↵{' '}
          <span className="hide-small">select</span>
        </span>
      </div>
    </div>
  );
}
