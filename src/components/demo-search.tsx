'use client';

import { useId, useRef, useState } from 'react';
import {
  ArrowDownUp,
  CornerDownLeft,
  FileCode2,
  FileImage,
  FileText,
  Folder,
  Search,
  X,
} from 'lucide-react';
import { demoCollections } from '@/lib/demo-data';
import './demo-search.css';

const entries = Object.entries(demoCollections).flatMap(([folder, files]) => [
  { name: folder, path: folder, folder, file: undefined as string | undefined, icon: Folder },
  ...files.map((file) => ({
    name: file.name,
    path: `${folder}/${file.name}`,
    folder,
    file: file.name,
    icon: file.type === 'image' ? FileImage : file.type === 'code' ? FileCode2 : FileText,
  })),
]);

function matches(path: string, query: string) {
  let at = 0;
  for (const char of path.toLowerCase()) if (char === query[at]) at++;
  return at === query.length;
}

export function DemoSearch({ onOpen }: { onOpen: (folder: string, file?: string) => void }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const id = useId();
  const normalized = query.toLowerCase().trim();
  const results = normalized ? entries.filter((entry) => matches(entry.path, normalized)) : [];
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  function openResult(index: number) {
    const result = results[index];
    if (!result) return;
    onOpen(result.folder, result.file);
    close();
  }
  return (
    <>
      <button
        ref={trigger}
        aria-label="Search demo files"
        title="Search files and folders"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setQuery('');
          setActive(0);
          setOpen(true);
          requestAnimationFrame(() => input.current?.focus());
        }}
      >
        <Search size={18} />
      </button>
      <div
        className="demo-search-overlay"
        hidden={!open}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <dialog
          open={open}
          className="demo-search-dialog"
          aria-label="Search files and folders"
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === 'Escape') {
              event.preventDefault();
              close();
            }
          }}
        >
          <div className="demo-search-inner">
            <div className="demo-search-heading">
              <Search size={20} />
              <input
                ref={input}
                role="combobox"
                aria-label="Search files and folders"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={`${id}-results`}
                aria-activedescendant={results[active] ? `${id}-${active}` : undefined}
                placeholder="Search files and folders…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    if (results.length) {
                      const next =
                        (active + (event.key === 'ArrowDown' ? 1 : -1) + results.length) %
                        results.length;
                      setActive(next);
                      document
                        .getElementById(`${id}-${next}`)
                        ?.scrollIntoView({ block: 'nearest' });
                    }
                  }
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    openResult(active);
                  }
                }}
              />
              <button aria-label="Close file search dialog" onClick={close}>
                <X size={17} />
              </button>
            </div>
            <div
              className="demo-tree-results"
              role="listbox"
              aria-label="Matching demo files and folders"
              id={`${id}-results`}
            >
              {results.map((result, index) => (
                <button
                  key={result.path}
                  id={`${id}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openResult(index)}
                >
                  <result.icon size={18} />
                  <span>
                    <strong>{result.name}</strong>
                    <small>strata / {result.path}</small>
                  </span>
                  <CornerDownLeft size={14} />
                </button>
              ))}
            </div>
            {!results.length && (
              <p className="demo-tree-empty" role="status">
                {normalized
                  ? 'No matching files or folders.'
                  : 'Type to search the whole demo tree'}
              </p>
            )}
            <div className="demo-search-footer">
              <span>
                <ArrowDownUp size={12} /> navigate
              </span>
              <span>
                <CornerDownLeft size={12} /> open
              </span>
              <small>
                Demo files only <span aria-hidden="true">·</span> esc to close
              </small>
            </div>
          </div>
        </dialog>
      </div>
    </>
  );
}
