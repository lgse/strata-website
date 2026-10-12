'use client';

import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import Image from 'next/image';
import { demoCode, highlightDemoLine } from '@/lib/demo-code';
import { demoFileKinds, type DemoEntry } from '@/lib/demo-data';
import { AudioPlayerDemo, VideoPlayerDemo } from './media-player-demo';

// Each renderer mirrors the matching preview in the app: source with a gutter, rendered
// Markdown and Word documents, a spreadsheet grid, archive contents, a PDF page, a flat-shaded
// mesh, image metadata, and the audio and video players.

export const previewMime = (file: DemoEntry) =>
  file.type === 'folder'
    ? 'inode/directory'
    : file.type === 'code'
      ? (demoCode[file.name]?.mime ?? 'text/plain')
      : demoFileKinds[file.type].mime;

export function CodePreview({ name }: { name: string }) {
  const fixture = demoCode[name];
  if (!fixture) return null;
  return (
    <div className="preview-code" aria-label={`Text preview of ${name}`}>
      {fixture.text.split('\n').map((line, index) => (
        <div className="code-line" key={index}>
          <span className="line-number" aria-hidden="true">
            {index + 1}
          </span>
          <code>
            {highlightDemoLine(line, fixture.language).map((token, tokenIndex) => (
              <span className={token.kind ? `syntax-${token.kind}` : undefined} key={tokenIndex}>
                {token.text}
              </span>
            ))}
          </code>
        </div>
      ))}
    </div>
  );
}

const imageMetadata = [
  ['Dimensions', '2400 × 3000 pixels'],
  ['Camera', 'Fujifilm X-T5'],
  ['Lens', 'XF 23mm f/1.4 R'],
  ['Focal length', '23 mm'],
  ['Shutter speed', '1/125 s'],
  ['ISO', '400'],
  ['GPS coordinates', 'N/A'],
];

function ImagePreview() {
  return (
    <>
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
      <dl className="preview-metadata">
        {imageMetadata.map(([label, value]) => (
          <div key={label}>
            <dt>{label.toUpperCase()}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function MarkdownPreview() {
  return (
    <article className="preview-markdown">
      <h1>Brand guide</h1>
      <p>How Strata looks and sounds, so every screen feels like one product.</p>
      <h2>Voice</h2>
      <p>
        This is <strong>bold</strong>, <em>italic</em>, <s>struck through</s>, and{' '}
        <code>inline code</code>.
      </p>
      <blockquote>
        <p>
          Say less. <em>Show the file.</em>
        </p>
      </blockquote>
      <ul className="checklist">
        <li data-checked="">Pick the palette</li>
        <li>Export the wordmark</li>
        <li>Check the light themes</li>
      </ul>
      <table>
        <thead>
          <tr>
            <th>
              Token <ChevronDown size={9} />
            </th>
            <th>Used for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Accent</td>
            <td>Selection, links, the active pane</td>
          </tr>
          <tr>
            <td>Surface</td>
            <td>Panels and dialogs</td>
          </tr>
          <tr>
            <td>Dim text</td>
            <td>Metadata and hints</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function DocumentPreview() {
  return (
    <article className="preview-document">
      <h1>Quarterly Report</h1>
      <h2>Regional summary</h2>
      <p>
        Plain <strong>bold</strong> <em>italic</em> <u>underlined</u> <s>struck</s> and A &amp; B
        &lt; C.
      </p>
      <blockquote>
        <p>Growth held steady.</p>
      </blockquote>
      <ul>
        <li>
          First bullet
          <ul>
            <li>Nested bullet</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>First step</li>
        <li>Second step</li>
      </ol>
      <table>
        <thead>
          <tr>
            <th>Region</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>North</td>
            <td>42</td>
          </tr>
          <tr>
            <td>South</td>
            <td>17</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

const inventory = [
  ['Cable', '30', '9.99', 'Office', 'Braided, 2 m'],
  ['Chair', '3', '175', 'Office', 'Quoted text: "ergonomic"'],
  ['Desk', '1', '450', 'Office', 'Standing frame, long description to exercise column resizing'],
  ['Keyboard', '2', '89.5', 'Engineering', 'Mechanical, quiet switches'],
  ['Monitor', '10', '249.99', 'Engineering', 'Wide display; adjustable stand'],
  ['Mouse', '20', '35', 'Engineering', 'Wireless'],
  ['Unassigned', '', '', '', 'Empty values sort after populated values'],
];

function SheetPreview() {
  return (
    <table className="preview-table">
      <thead>
        <tr>
          {['Item', 'Quantity', 'Price', 'Department', 'Notes'].map((column, index) => (
            <th key={column} aria-sort={index === 0 ? 'ascending' : undefined}>
              {column}
              {index === 0 && <ChevronDown size={9} />}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {inventory.map((row) => (
          <tr key={row[0]}>
            {row.map((cell, index) => (
              <td key={index}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const archiveEntries = [
  { name: 'docs/', folder: true },
  { name: 'images/', folder: true },
  { name: 'src/', folder: true },
  { name: 'README.md', size: '1.2 KB' },
  { name: 'LICENSE', size: '1.1 KB' },
];

function ArchivePreview() {
  return (
    <div className="preview-archive">
      <div className="archive-crumbs">Contents</div>
      <div className="archive-count">2 files, 3 folders</div>
      <div className="archive-list">
        {archiveEntries.map((entry) => (
          <div className="archive-row" key={entry.name}>
            {entry.folder ? <Folder size={13} /> : <FileText size={13} />}
            <span className="archive-name">{entry.name}</span>
            {entry.folder ? (
              <ChevronRight size={12} />
            ) : (
              <span className="archive-size">{entry.size}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PdfPreview() {
  return (
    <div className="preview-pdf">
      <div className="pdf-sheet" aria-label="Page 1 of field-notes.pdf">
        <header>
          <span>
            Strata <i>|</i> Field notes
          </span>
          <span className="pdf-tag">Guide</span>
        </header>
        <h1>
          Field notes
          <br />
          for Strata
        </h1>
        <p>A pocket reference for navigating every layer</p>
      </div>
    </div>
  );
}

function ModelPreview() {
  // Two flat-shaded pyramids: a lit face toward the light and a shaded face away from it.
  const pyramids = [
    { apex: [150, 46], left: [52, 196], front: [166, 236], right: [250, 166] },
    { apex: [282, 120], left: [196, 262], front: [300, 298], right: [378, 236] },
  ];
  const point = (p: number[]) => p.join(',');
  return (
    <div className="preview-model" aria-label="3D model preview of two pyramids">
      <svg viewBox="0 0 400 320" role="img" aria-hidden="true">
        {pyramids.map(({ apex, left, front, right }, index) => (
          <g key={index}>
            <polygon
              className="face-lit"
              points={`${point(apex)} ${point(left)} ${point(front)}`}
            />
            <polygon
              className="face-shade"
              points={`${point(apex)} ${point(front)} ${point(right)}`}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function PreviewBody({ file }: { file: DemoEntry }) {
  switch (file.type) {
    case 'image':
      return <ImagePreview />;
    case 'code':
      return <CodePreview name={file.name} />;
    case 'text':
      return <MarkdownPreview />;
    case 'audio':
      return <AudioPlayerDemo stacked only="night-drive" />;
    case 'video':
      return <VideoPlayerDemo stacked only="ridge-line" eyebrow="1 of 1 in folder" />;
    case 'pdf':
      return <PdfPreview />;
    case 'model':
      return <ModelPreview />;
    case 'sheet':
      return <SheetPreview />;
    case 'document':
      return <DocumentPreview />;
    case 'archive':
      return <ArchivePreview />;
    default:
      return null;
  }
}
