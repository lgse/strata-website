'use client';

import { useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  FileCode2,
  FileImage,
  FileText,
  Folder,
  PanelLeft,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Logo } from './logo';
import { DemoSidebar, DemoToolbar } from './demo-chrome';
import { MillerParentPane } from './miller-parent-pane';
import { PaneActions } from './pane-actions';
import { DemoSearch } from './demo-search';
import {
  demoCollections as collections,
  demoModes as modes,
  type DemoMode as Mode,
  type DemoFile,
} from '@/lib/demo-data';
import './explorer-demo.css';

function subscribeViewport(callback: () => void) {
  const media = window.matchMedia('(max-width: 620px)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function FileIcon({ type, size = 15 }: { type: DemoFile['type']; size?: number }) {
  return type === 'image' ? (
    <FileImage size={size} />
  ) : type === 'code' ? (
    <FileCode2 size={size} />
  ) : (
    <FileText size={size} />
  );
}

export function ExplorerDemo() {
  const [mode, setMode] = useState<Mode>('columns');
  const [collection, setCollection] = useState('assets');
  const [selected, setSelected] = useState('night-drive.png');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [ascending, setAscending] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [grouped, setGrouped] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const narrow = useSyncExternalStore(
    subscribeViewport,
    () => window.matchMedia('(max-width: 620px)').matches,
    () => false,
  );
  const [previewOpen, setPreviewOpen] = useState(true);
  const [compact, setCompact] = useState(true);
  const [closed, setClosed] = useState(false);
  const [history, setHistory] = useState(['assets']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const files = collections[collection].filter((file) =>
    file.name.toLowerCase().includes(query.toLowerCase()),
  );
  const displayed = [...files].sort((a, b) =>
    grouped
      ? a.type.localeCompare(b.type) ||
        a.name.localeCompare(b.name) * (sorting && !ascending ? -1 : 1)
      : sorting
        ? a.name.localeCompare(b.name) * (ascending ? 1 : -1)
        : 0,
  );
  const active =
    collections[collection].find((file) => file.name === selected) ?? collections[collection][0];
  function selectFolder(name: string) {
    setCollection(name);
    setSelected(collections[name][0].name);
    setQuery('');
    setNotice('');
  }
  function openFolder(name: string) {
    if (name !== collection) {
      setHistory([...history.slice(0, historyIndex + 1), name]);
      setHistoryIndex(historyIndex + 1);
    }
    selectFolder(name);
  }
  function navigateHistory(delta: number) {
    const next = historyIndex + delta;
    if (next < 0 || next >= history.length) return;
    setHistoryIndex(next);
    selectFolder(history[next]);
  }
  function changeMode(next: Mode) {
    setMode(next);
    setPreviewOpen(next !== 'column');
    setClosed(false);
  }
  function toggleSearch() {
    setSearching(!searching);
    setQuery('');
  }
  function moveSelection(event: KeyboardEvent<HTMLDivElement>) {
    if (
      (event.target as HTMLElement).tagName === 'INPUT' ||
      (event.target as HTMLElement).closest('.app-toolbar, .pane-actions')
    )
      return;
    if (event.key === ' ' && (event.target as HTMLElement).closest('.demo-files')) {
      event.preventDefault();
      setPreviewOpen(!previewOpen);
    }
    if (['ArrowDown', 'j', 'ArrowUp', 'k'].includes(event.key)) {
      event.preventDefault();
      const next =
        displayed.findIndex((file) => file.name === selected) +
        (['ArrowDown', 'j'].includes(event.key) ? 1 : -1);
      if (displayed.length)
        setSelected(displayed[(next + displayed.length) % displayed.length].name);
    }
  }
  return (
    <div className="explorer-showcase" id="explorer">
      <div className="app-halo" aria-hidden="true" />
      {closed ? (
        <div className="demo-closed">
          <Logo />
          <h3>Your next layer is waiting.</h3>
          <button className="button secondary" onClick={() => setClosed(false)}>
            Reopen Strata demo <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div
          className={`app-window ${compact ? 'density-compact' : 'density-airy'} ${sidebarOpen ? '' : 'sidebar-hidden'} ${mobileSidebarOpen ? 'sidebar-mobile-open' : ''}`}
          onKeyDown={moveSelection}
          role="region"
          aria-label="Interactive Strata illustration"
        >
          <DemoToolbar
            collection={collection}
            sidebarOpen={narrow ? mobileSidebarOpen : sidebarOpen}
            mode={mode}
            searchControl={
              <DemoSearch
                onOpen={(folder, file) => {
                  openFolder(folder);
                  if (file) {
                    setSelected(file);
                    setPreviewOpen(true);
                  }
                  setMobileSidebarOpen(false);
                }}
              />
            }
            compact={compact}
            grouped={grouped}
            previewOpen={previewOpen}
            onSidebar={() =>
              narrow ? setMobileSidebarOpen(!mobileSidebarOpen) : setSidebarOpen(!sidebarOpen)
            }
            onView={changeMode}
            onClose={() => setClosed(true)}
            onCompact={setCompact}
            onGrouped={setGrouped}
            onPreview={setPreviewOpen}
          />
          <div className="app-content">
            <DemoSidebar
              onFolder={(name) => {
                openFolder(name);
                setMobileSidebarOpen(false);
              }}
            />
            <div className={`browser-area mode-${mode} ${previewOpen ? '' : 'preview-hidden'}`}>
              {mode === 'columns' && (
                <MillerParentPane
                  collections={collections}
                  collection={collection}
                  onFolder={openFolder}
                />
              )}
              <div className="file-pane">
                <div className="pane-title">
                  <div className="pane-navigation">
                    <button
                      aria-label="Previous demo folder"
                      disabled={historyIndex === 0}
                      onClick={() => navigateHistory(-1)}
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <button
                      aria-label="Next demo folder"
                      disabled={historyIndex === history.length - 1}
                      onClick={() => navigateHistory(1)}
                    >
                      <ArrowRight size={13} />
                    </button>
                    <button aria-label="Show parent columns" onClick={() => changeMode('columns')}>
                      <ArrowUp size={13} />
                    </button>
                  </div>
                  <span className="pane-location">
                    {collection} <small>{files.length}</small>
                  </span>
                  <PaneActions
                    label={collection}
                    ascending={ascending}
                    filtering={searching}
                    grouped={grouped}
                    onRefresh={() => {
                      selectFolder(collection);
                      setNotice('Demo folder refreshed');
                    }}
                    onSort={() => {
                      setSorting(true);
                      setAscending(!ascending);
                    }}
                    onFilter={toggleSearch}
                    onGroupChange={setGrouped}
                  />
                </div>
                {searching && (
                  <label className="demo-search">
                    <Search size={12} />
                    <input
                      aria-label="Filter demo files"
                      placeholder="Filter files…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                    />
                    <button
                      aria-label="Close file search"
                      onClick={() => {
                        setSearching(false);
                        setQuery('');
                      }}
                    >
                      <X size={12} />
                    </button>
                  </label>
                )}
                {mode === 'grid' && (
                  <div className="folder-chips">
                    {Object.keys(collections).map((name) => (
                      <button
                        key={name}
                        aria-pressed={name === collection}
                        onClick={() => openFolder(name)}
                      >
                        <Folder size={13} />
                        {name}
                      </button>
                    ))}
                  </div>
                )}
                {mode === 'column' && (
                  <div className="table-heading">
                    <span>
                      Name <ChevronDown size={10} />
                    </span>
                    <span className="table-permissions">Mode</span>
                    <span className="table-size">Size</span>
                    <span className="table-type">Type</span>
                    <span className="table-modified">Modified</span>
                  </div>
                )}
                <div className="demo-files">
                  {displayed.map((file, index) => (
                    <div key={file.name} className="demo-file-wrap">
                      {grouped && (index === 0 || displayed[index - 1].type !== file.type) && (
                        <div className="file-group-heading">
                          {file.type === 'image'
                            ? 'Images'
                            : file.type === 'code'
                              ? 'Source code'
                              : 'Documents'}
                        </div>
                      )}
                      <button
                        className={`file-row ${active.name === file.name ? 'selected' : ''}`}
                        aria-pressed={active.name === file.name}
                        onClick={() => {
                          setSelected(file.name);
                          setPreviewOpen(true);
                        }}
                      >
                        {mode === 'grid' ? (
                          <span className={`grid-thumbnail thumbnail-${file.type}`}>
                            {file.type === 'image' ? (
                              <Image
                                src="/art/night-drive.svg"
                                alt=""
                                width={140}
                                height={100}
                                style={{
                                  objectPosition:
                                    file.name === 'landscape.png' ? '50% 80%' : '50% 35%',
                                }}
                              />
                            ) : (
                              <FileIcon type={file.type} size={34} />
                            )}
                          </span>
                        ) : (
                          <FileIcon type={file.type} />
                        )}
                        <span className="file-name">{file.name}</span>
                        {mode === 'column' && (
                          <>
                            <span className="file-permissions">-rw-r--r--</span>
                            <span className="file-size">{file.size}</span>
                            <span className="file-type">
                              {file.type === 'image'
                                ? 'PNG image'
                                : file.type === 'code'
                                  ? 'Source code'
                                  : 'Markdown'}
                            </span>
                            <span className="file-modified">
                              {file.name === 'night-drive.png' ? '2m ago' : 'Yesterday'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                  {!displayed.length && <p className="demo-empty">No matching files.</p>}
                </div>
                <div className="pane-bottom">
                  <span aria-live="polite">{notice || `${displayed.length} items`}</span>
                  <span>{grouped ? 'Grouped by type' : '↑ ↓ to explore'}</span>
                </div>
              </div>
              {previewOpen && (
                <div className="app-preview" key={active.name}>
                  <div className="preview-title">
                    <span>QUICK LOOK</span>
                    <ShieldCheck size={13} />
                  </div>
                  {active.type === 'image' ? (
                    <div className="preview-image">
                      <Image
                        src="/art/night-drive.svg"
                        alt="Illustrated moonlit mountain road in a purple night landscape"
                        width={800}
                        height={1000}
                        loading="eager"
                      />
                      <span className="image-label">THE LONG WAY HOME</span>
                    </div>
                  ) : active.type === 'code' ? (
                    <div className="preview-code">
                      <span className="code-comment">{'// A little closer to the metal.'}</span>
                      <br />
                      <span className="code-purple">fn</span>{' '}
                      <span className="code-blue">main</span>() {'{'}
                      <br />
                      {'  '}
                      <span className="code-purple">let</span> app = Strata::new();
                      <br />
                      <br />
                      {'  '}app
                      <br />
                      {'    '}.native(<span className="code-purple">true</span>)<br />
                      {'    '}.theme(<span className="code-green">&quot;tokyo-night&quot;</span>)
                      <br />
                      {'    '}.navigate();
                      <br />
                      {'}'}
                    </div>
                  ) : (
                    <div className="preview-markdown">
                      <span className="eyebrow">THE STRATA PROJECT</span>
                      <h3>Room to explore.</h3>
                      <p>A fast, keyboard-first file manager for modern Linux desktops.</p>
                      <hr />
                      <span>01 / Navigate every layer</span>
                      <span>02 / Stay in your flow</span>
                      <span>03 / Make it your own</span>
                      <Logo />
                    </div>
                  )}
                  <div className="preview-meta">
                    <strong>{active.name}</strong>
                    <span>
                      {active.type === 'image'
                        ? 'PNG image · 800 × 1000'
                        : active.type === 'code'
                          ? 'Source code · UTF-8'
                          : 'Markdown document'}
                      <b>{active.size}</b>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="app-statusbar">
            <span>
              <PanelLeft size={12} /> Built for your desktop. Not a browser in disguise.
            </span>
            <span>
              <ShieldCheck size={12} />{' '}
              {!previewOpen
                ? 'Space to preview'
                : active.type === 'image'
                  ? 'Sandboxed preview'
                  : 'Bounded text preview'}
              <Check size={11} />
            </span>
          </div>
        </div>
      )}
      <div className="explorer-controls">
        <span className="demo-label">
          <span className="live-dot" /> INTERACTIVE WEB DEMO
        </span>
        <div className="mode-tabs" role="group" aria-label="File view mode">
          {modes.map(({ id, label, icon: Icon }) => (
            <button key={id} aria-pressed={mode === id} onClick={() => changeMode(id)}>
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <span className="try-label">
          Go on, click around <ArrowRight size={14} />
        </span>
      </div>
      <p className="mode-description" aria-live="polite">
        {modes.find((item) => item.id === mode)?.description}
      </p>
      <span className="sr-only">
        This is an interactive web illustration, not the running Linux application.
      </span>
    </div>
  );
}
