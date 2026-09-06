'use client';

import {
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  FileCode2,
  FileImage,
  FileText,
  Folder,
  Printer,
  Search,
  SquareArrowOutUpRight,
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
  const [previewWidth, setPreviewWidth] = useState(31);
  const [resizingPreview, setResizingPreview] = useState(false);
  const browserArea = useRef<HTMLDivElement>(null);
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
  function resizePreview(event: PointerEvent<HTMLDivElement>) {
    const bounds = browserArea.current?.getBoundingClientRect();
    if (!bounds) return;
    setPreviewWidth(
      Math.max(24, Math.min(55, ((bounds.right - event.clientX) / bounds.width) * 100)),
    );
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
            onSidebar={() =>
              narrow ? setMobileSidebarOpen(!mobileSidebarOpen) : setSidebarOpen(!sidebarOpen)
            }
            onView={changeMode}
            onClose={() => setClosed(true)}
            onCompact={setCompact}
            onGrouped={setGrouped}
          />
          <div className="app-content">
            <DemoSidebar
              onFolder={(name) => {
                openFolder(name);
                setMobileSidebarOpen(false);
              }}
            />
            <div
              ref={browserArea}
              className={`browser-area mode-${mode} ${previewOpen ? '' : 'preview-hidden'} ${resizingPreview ? 'preview-resizing' : ''}`}
            >
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
                                style={{ objectPosition: '50% 35%' }}
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
                {notice && (
                  <span className="pane-notice" aria-live="polite">
                    {notice}
                  </span>
                )}
              </div>
              {previewOpen && (
                <div
                  className="app-preview"
                  key={active.name}
                  style={{ '--preview-width': `${previewWidth}%` } as React.CSSProperties}
                >
                  <div
                    className="preview-resize-handle"
                    role="separator"
                    aria-label="Resize preview pane"
                    aria-orientation="vertical"
                    aria-valuemin={24}
                    aria-valuemax={55}
                    aria-valuenow={Math.round(previewWidth)}
                    tabIndex={0}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setResizingPreview(true);
                      resizePreview(event);
                    }}
                    onPointerMove={(event) => {
                      if (event.currentTarget.hasPointerCapture(event.pointerId))
                        resizePreview(event);
                    }}
                    onPointerUp={(event) => {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                      setResizingPreview(false);
                    }}
                    onPointerCancel={() => setResizingPreview(false)}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                      event.preventDefault();
                      setPreviewWidth((width) =>
                        Math.max(24, Math.min(55, width + (event.key === 'ArrowLeft' ? 2 : -2))),
                      );
                    }}
                  />
                  <div className="preview-title preview-meta">
                    <strong>
                      <FileIcon type={active.type} size={16} />
                      {active.name}
                    </strong>
                    <div className="preview-actions" aria-label="Preview controls">
                      <button aria-label="Open preview in a new window" title="Open externally">
                        <SquareArrowOutUpRight size={14} />
                      </button>
                      <button aria-label="Print preview" title="Print">
                        <Printer size={14} />
                      </button>
                      <button
                        aria-label="Close preview"
                        title="Close preview"
                        onClick={() => setPreviewOpen(false)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="preview-properties">
                    <span>
                      <small>SIZE</small>
                      {active.size}
                    </span>
                    <span>
                      <small>MODIFIED</small>
                      Aug 14, 11:42
                    </span>
                    <span>
                      <small>TYPE</small>
                      {active.type === 'image'
                        ? 'image/png'
                        : active.type === 'code'
                          ? 'text/plain'
                          : 'text/markdown'}
                    </span>
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
                    <div className="preview-code" aria-label={`Text preview of ${active.name}`}>
                      {[
                        '// A little closer to the metal.',
                        '',
                        'use strata::App;',
                        'use strata::theme::Theme;',
                        '',
                        'fn main() {',
                        '    let app = App::new();',
                        '',
                        '    app',
                        '        .native(true)',
                        '        .theme(Theme::TokyoNight)',
                        '        .navigate();',
                        '}',
                      ].map((line, index) => (
                        <div className="code-line" key={index}>
                          <span className="line-number">{index + 1}</span>
                          <code className={line.startsWith('//') ? 'code-comment' : ''}>
                            {line || ' '}
                          </code>
                        </div>
                      ))}
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
                </div>
              )}
            </div>
          </div>
          <div className="app-statusbar" aria-label="Keyboard shortcuts">
            <span>↕ ↔ &nbsp; Navigate</span>
            <span>← &nbsp; at first pane &nbsp; Sidebar</span>
            <span>↑ &nbsp; at top &nbsp; Header</span>
            <span>
              <kbd>Enter</kbd> Open
            </span>
            <span>
              <kbd>Space</kbd> Preview
            </span>
            <span>
              <kbd>Ctrl+F</kbd> Filter
            </span>
            <span>
              <kbd>Ctrl+C</kbd> Copy
            </span>
            <span>
              <kbd>F1</kbd> Shortcuts
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
