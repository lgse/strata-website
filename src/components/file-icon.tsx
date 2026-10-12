import Image from 'next/image';
import {
  FileArchive,
  FileBox,
  FileCode2,
  FileImage,
  FileMusic,
  FileSpreadsheet,
  FileText,
  FileVideoCamera,
  Folder,
  type LucideIcon,
} from 'lucide-react';
import type { DemoEntry } from '@/lib/demo-data';

const icons: Record<DemoEntry['type'], LucideIcon> = {
  folder: Folder,
  image: FileImage,
  code: FileCode2,
  text: FileText,
  audio: FileMusic,
  video: FileVideoCamera,
  pdf: FileText,
  archive: FileArchive,
  model: FileBox,
  sheet: FileSpreadsheet,
  document: FileText,
};

export const demoFileIcon = (type: DemoEntry['type']) => icons[type];

/** Media rows carry a tiny thumbnail like the app's listing; everything else gets a glyph. */
const tints: Partial<Record<DemoEntry['type'], string | undefined>> = {
  image: undefined,
  audio: 'hue-rotate(28deg) saturate(1.05)',
  video: 'hue-rotate(-30deg) saturate(0.9) brightness(1.05)',
};

export function FileIcon({
  type,
  size = 15,
  thumbnails = false,
}: {
  type: DemoEntry['type'];
  size?: number;
  thumbnails?: boolean;
}) {
  if (thumbnails && type in tints)
    return (
      <i className={`file-thumb thumb-${type}`} style={{ width: size, height: size }}>
        <Image
          src="/art/night-drive.svg"
          alt=""
          width={size}
          height={size}
          style={{ filter: tints[type] }}
        />
      </i>
    );
  if (thumbnails && type === 'pdf')
    return <i className="file-thumb thumb-pdf" style={{ width: size, height: size }} />;
  const Icon = icons[type];
  return <Icon size={size} />;
}
