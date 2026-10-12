import { Columns3, LayoutGrid, List } from 'lucide-react';

export type DemoMode = 'columns' | 'grid' | 'column';
export type DemoFileType =
  | 'image'
  | 'code'
  | 'text'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'archive'
  | 'model'
  | 'sheet'
  | 'document';
export type DemoFile = { name: string; type: DemoFileType; size: string };
export type DemoEntry = DemoFile | { name: string; type: 'folder'; size: string };

/** How each kind is named in list columns, grouped headings and the preview header. */
export const demoFileKinds: Record<DemoFileType, { label: string; group: string; mime: string }> = {
  image: { label: 'PNG image', group: 'Images', mime: 'image/png' },
  code: { label: 'Source code', group: 'Source code', mime: 'text/plain' },
  text: { label: 'Markdown', group: 'Documents', mime: 'text/markdown' },
  audio: { label: 'FLAC audio', group: 'Audio', mime: 'audio/flac' },
  video: { label: 'MP4 video', group: 'Video', mime: 'video/mp4' },
  pdf: { label: 'PDF document', group: 'Documents', mime: 'application/pdf' },
  archive: { label: 'ZIP archive', group: 'Archives', mime: 'application/zip' },
  model: { label: '3D model', group: '3D models', mime: 'model/3mf' },
  sheet: { label: 'TSV spreadsheet', group: 'Spreadsheets', mime: 'text/tab-separated-values' },
  document: {
    label: 'Word document',
    group: 'Documents',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
};

export const demoCollections: Record<string, DemoFile[]> = {
  // One of every preview kind, so the pane can show each renderer.
  assets: [
    { name: 'night-drive.png', type: 'image', size: '2.4 MB' },
    { name: 'brand-guide.md', type: 'text', size: '4.2 KB' },
    { name: 'colors.json', type: 'code', size: '824 B' },
    { name: 'night-drive.flac', type: 'audio', size: '31.8 MB' },
    { name: 'ridge-line.mp4', type: 'video', size: '48.2 MB' },
    { name: 'field-notes.pdf', type: 'pdf', size: '1.6 MB' },
    { name: 'pyramids.3mf', type: 'model', size: '1 KB' },
    { name: 'inventory.tsv', type: 'sheet', size: '559 B' },
    { name: 'quarterly-report.docx', type: 'document', size: '2.4 KB' },
    { name: 'project.zip', type: 'archive', size: '931 B' },
  ],
  src: [
    { name: 'main.rs', type: 'code', size: '2.1 KB' },
    { name: 'theme.rs', type: 'code', size: '8.4 KB' },
    { name: 'browser.rs', type: 'code', size: '12.6 KB' },
  ],
  docs: [
    { name: 'getting-started.md', type: 'text', size: '6.2 KB' },
    { name: 'architecture.md', type: 'text', size: '3.8 KB' },
  ],
};

export const demoRootEntries: DemoEntry[] = [
  ...Object.entries(demoCollections).map(([name, files]) => ({
    name,
    type: 'folder' as const,
    size: `${files.length} items`,
  })),
  { name: 'Cargo.toml', type: 'code', size: '824 B' },
  { name: 'README.md', type: 'text', size: '1.2 KB' },
  { name: 'LICENSE', type: 'text', size: '1.1 KB' },
];

export const demoModes = [
  {
    id: 'columns',
    label: 'Miller column',
    icon: Columns3,
    description:
      'Keep the whole path in view. Every folder opens a new layer, without losing where you came from.',
  },
  {
    id: 'grid',
    label: 'Icons',
    icon: LayoutGrid,
    description:
      'Think in pictures. Find the right image, design, or document at a glance with rich thumbnails.',
  },
  {
    id: 'column',
    label: 'List',
    icon: List,
    description:
      'Details, neatly lined up. Sort by name, size, or type and bring a little order to the everyday.',
  },
] as const;
