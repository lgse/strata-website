import { Columns3, Grid2X2, Rows3 } from 'lucide-react';

export type DemoMode = 'columns' | 'grid' | 'column';
export type DemoFile = { name: string; type: 'image' | 'code' | 'text'; size: string };

export const demoCollections: Record<string, DemoFile[]> = {
  assets: [
    { name: 'night-drive.png', type: 'image', size: '2.4 MB' },
    { name: 'brand-guide.md', type: 'text', size: '4.2 KB' },
    { name: 'colors.json', type: 'code', size: '824 B' },
    { name: 'readme.md', type: 'text', size: '1.2 KB' },
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
    label: 'Grid',
    icon: Grid2X2,
    description:
      'Think in pictures. Find the right image, design, or document at a glance with rich thumbnails.',
  },
  {
    id: 'column',
    label: 'Column',
    icon: Rows3,
    description:
      'Details, neatly lined up. Sort by name, size, or type and bring a little order to the everyday.',
  },
] as const;
