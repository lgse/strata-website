'use client';

import { useState } from 'react';
import {
  ChevronRight,
  File,
  FileCode2,
  FileImage,
  FileText,
  Folder,
  Search,
  X,
} from 'lucide-react';
import { PaneActions } from './pane-actions';

type ParentPaneProps = {
  collections: Record<string, readonly { name: string; type: 'image' | 'code' | 'text' }[]>;
  collection: string;
  onFolder: (name: string) => void;
};

export function MillerParentPane({ collections, collection, onFolder }: ParentPaneProps) {
  const [query, setQuery] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [ascending, setAscending] = useState(false);
  const [grouped, setGrouped] = useState(false);
  const [notice, setNotice] = useState('');
  const entries = [
    ...Object.keys(collections).map((name) => ({ name, folder: true, icon: Folder })),
    { name: 'Cargo.toml', folder: false, icon: FileCode2 },
    { name: 'README.md', folder: false, icon: FileText },
    { name: 'LICENSE', folder: false, icon: File },
  ]
    .filter((entry) => entry.name.toLowerCase().includes(query.toLowerCase()))
    .sort(
      (a, b) =>
        Number(b.folder) - Number(a.folder) ||
        (sorting ? a.name.localeCompare(b.name) * (ascending ? 1 : -1) : 0),
    );

  return (
    <div className="miller-parent">
      <div className="pane-title">
        <span className="pane-location">strata</span>
        <PaneActions
          label="strata"
          parent
          ascending={ascending}
          filtering={filtering}
          grouped={grouped}
          onRefresh={() => {
            setQuery('');
            setNotice('Parent pane refreshed');
          }}
          onSort={() => {
            setSorting(true);
            setAscending(!ascending);
          }}
          onFilter={() => {
            setFiltering(!filtering);
            setQuery('');
            setNotice('');
          }}
          onGroupChange={setGrouped}
        />
      </div>
      {filtering && (
        <label className="demo-search">
          <Search size={12} />
          <input
            aria-label="Filter parent entries"
            placeholder="Filter this pane…"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setNotice('');
            }}
          />
          <button
            aria-label="Close parent filter"
            onClick={() => {
              setFiltering(false);
              setQuery('');
            }}
          >
            <X size={12} />
          </button>
        </label>
      )}
      <div className="parent-entries">
        {entries.map(({ name, folder, icon: Icon }, index) => (
          <div key={name}>
            {grouped && (index === 0 || entries[index - 1].folder !== folder) && (
              <div className="file-group-heading">{folder ? 'Folders' : 'Files'}</div>
            )}
            {folder ? (
              <div className="folder-peek-anchor">
                <button
                  className={`file-row folder-row ${name === collection ? 'selected' : ''}`}
                  onClick={() => onFolder(name)}
                  aria-pressed={name === collection}
                >
                  <Folder size={16} />
                  <span>{name}</span>
                  <ChevronRight size={13} />
                </button>
                <div className="folder-peek" role="tooltip">
                  <span>
                    <Folder size={13} />
                    {name} · {collections[name].length} files
                  </span>
                  {collections[name].slice(0, 3).map((file) => (
                    <small key={file.name}>
                      {file.type === 'image' ? (
                        <FileImage size={12} />
                      ) : file.type === 'code' ? (
                        <FileCode2 size={12} />
                      ) : (
                        <FileText size={12} />
                      )}
                      {file.name}
                    </small>
                  ))}
                </div>
              </div>
            ) : (
              <div className="file-row muted-file">
                <Icon size={15} />
                <span>{name}</span>
              </div>
            )}
          </div>
        ))}
        {!entries.length && <p className="demo-empty">No matching entries.</p>}
      </div>
      {notice && (
        <span className="pane-notice" aria-live="polite">
          {notice}
        </span>
      )}
    </div>
  );
}
