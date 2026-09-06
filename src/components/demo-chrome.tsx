'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { demoModes, type DemoMode } from '@/lib/demo-data';
import {
  Check,
  Rows3,
  Download,
  Eject,
  EyeOff,
  FileText,
  Folder,
  HardDrive,
  Home,
  Image as ImageIcon,
  List,
  ListChecks,
  Network,
  PanelLeft,
  Settings,
  Trash2,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react';

interface ToolbarProps {
  collection: string;
  sidebarOpen: boolean;
  searchControl: ReactNode;
  mode: DemoMode;
  compact: boolean;
  grouped: boolean;
  onSidebar: () => void;
  onView: (mode: DemoMode) => void;
  onClose: () => void;
  onCompact: (value: boolean) => void;
  onGrouped: (value: boolean) => void;
}

export function DemoToolbar(props: ToolbarProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [hiddenFiles, setHiddenFiles] = useState(false);
  const view = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!viewOpen) return;
    function dismiss(event: PointerEvent) {
      if (!view.current?.contains(event.target as Node)) setViewOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setViewOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [viewOpen]);
  return (
    <div className="app-toolbar">
      <button
        className="app-sidebar-toggle"
        aria-label="Toggle demo sidebar"
        aria-pressed={props.sidebarOpen}
        onClick={props.onSidebar}
      >
        <PanelLeft size={18} />
      </button>
      <div className="app-breadcrumb">
        <span className="breadcrumb-root">~</span>
        <span className="breadcrumb-parent">/ Projects / strata /</span>
        <strong>{props.collection}</strong>
      </div>
      <div className="app-tools">
        {props.searchControl}
        <div
          className="app-view-options"
          ref={view}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setViewOpen(false);
          }}
        >
          <button
            ref={trigger}
            aria-label="View options"
            title="View options"
            aria-expanded={viewOpen}
            aria-controls="demo-view-options"
            onClick={() => setViewOpen(!viewOpen)}
          >
            <List size={18} />
          </button>
          {viewOpen && (
            <div
              className="app-view-popover"
              id="demo-view-options"
              role="group"
              aria-label="View options"
            >
              <span className="view-section-label">VIEW</span>
              {demoModes.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  aria-pressed={props.mode === id}
                  onClick={() => {
                    props.onView(id);
                    setViewOpen(false);
                    trigger.current?.focus();
                  }}
                >
                  <Icon size={16} />
                  <span>{id === 'columns' ? 'Columns' : id === 'grid' ? 'Icons' : 'List'}</span>
                  {props.mode === id && <Check size={15} />}
                </button>
              ))}
              <div className="view-section" role="group" aria-label="Density">
                <span className="view-section-label">DENSITY</span>
                {[true, false].map((compact) => (
                  <button
                    key={String(compact)}
                    aria-pressed={props.compact === compact}
                    onClick={() => props.onCompact(compact)}
                  >
                    <Rows3 size={16} />
                    <span>{compact ? 'Compact' : 'Airy'}</span>
                    {props.compact === compact && <Check size={15} />}
                  </button>
                ))}
              </div>
              <div className="view-section appearance-toggles">
                <label>
                  <input
                    type="checkbox"
                    checked={props.grouped}
                    onChange={(event) => props.onGrouped(event.target.checked)}
                  />
                  <ListChecks size={16} />
                  <span>Group by file type</span>
                  {props.grouped && <Check size={15} />}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={hiddenFiles}
                    onChange={(event) => setHiddenFiles(event.target.checked)}
                  />
                  <EyeOff size={16} />
                  <span>Hidden files</span>
                  <kbd>Ctrl+H</kbd>
                  {hiddenFiles && <Check size={15} />}
                </label>
              </div>
            </div>
          )}
        </div>
        <button aria-label="Settings" title="Settings (available in the desktop app)" disabled>
          <Settings size={18} />
        </button>
        <button aria-label="Close demo window" onClick={props.onClose}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  children,
  onClick,
  active = false,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const content = (
    <>
      <Icon size={15} />
      {children}
    </>
  );
  const className = `sidebar-item ${active ? 'sidebar-active' : ''}`;
  return onClick ? (
    <button className={className} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

export function DemoSidebar({ onFolder }: { onFolder: (name: string) => void }) {
  return (
    <aside className="app-sidebar" aria-label="Demo places and devices">
      <section className="sidebar-group">
        <SidebarItem icon={Home} active onClick={() => onFolder('assets')}>
          Home
        </SidebarItem>
        <SidebarItem icon={Trash2}>Trash</SidebarItem>
        <SidebarItem icon={Network}>Network</SidebarItem>
      </section>
      <section className="sidebar-group">
        <SidebarItem icon={FileText} onClick={() => onFolder('docs')}>
          Documents
        </SidebarItem>
        <SidebarItem icon={Download}>Downloads</SidebarItem>
        <SidebarItem icon={ImageIcon} onClick={() => onFolder('assets')}>
          Pictures
        </SidebarItem>
        <SidebarItem icon={Video}>Videos</SidebarItem>
      </section>
      <section className="sidebar-group">
        <span className="sidebar-heading">PINNED</span>
        <SidebarItem icon={Folder} onClick={() => onFolder('assets')}>
          Moonshot
        </SidebarItem>
        <SidebarItem icon={Folder} onClick={() => onFolder('src')}>
          Workbench
        </SidebarItem>
        <SidebarItem icon={Folder} onClick={() => onFolder('docs')}>
          Field Notes
        </SidebarItem>
      </section>
      <section className="sidebar-group">
        <span className="sidebar-heading">DEVICES</span>
        <SidebarItem icon={HardDrive}>Aurora SSD</SidebarItem>
        <SidebarItem icon={HardDrive}>Orbit Archive</SidebarItem>
        <SidebarItem icon={HardDrive}>
          <span className="device-name">NOVA_USB</span>
          <Eject size={12} />
        </SidebarItem>
      </section>
    </aside>
  );
}
