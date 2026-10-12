'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  AudioLines,
  FileCode2,
  FileImage,
  FileText,
  Film,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { AudioPlayerDemo, VideoPlayerDemo } from './media-player-demo';
const types = [
  { id: 'image', label: 'Images', icon: FileImage },
  { id: 'code', label: 'Code', icon: FileCode2 },
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'video', label: 'Video', icon: Film },
  { id: 'audio', label: 'Audio', icon: AudioLines },
];
export function PreviewDemo() {
  const [type, setType] = useState('image');
  return (
    <div className="preview-demo">
      <div className="preview-demo-tabs" role="group" aria-label="Preview illustration format">
        {types.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setType(id)} aria-pressed={type === id}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
      <div className="sandbox-visual">
        <div className="sandbox-boundary">
          <span className="sandbox-label">
            <LockKeyhole size={11} /> {type === 'code' ? 'BOUNDED TEXT READER' : 'ISOLATED PROCESS'}
          </span>
          <div className={`format-preview format-${type}`} key={type}>
            {type === 'image' && (
              <>
                <Image
                  src="/art/night-drive.svg"
                  alt="Illustrated mountain landscape preview"
                  width={180}
                  height={220}
                />
                <div className="format-details">
                  <FileImage size={25} />
                  <strong>night-drive.png</strong>
                  <span>Images. RAW. The full picture.</span>
                  <small>Normalized, bounded output.</small>
                </div>
              </>
            )}
            {type === 'code' && (
              <pre>
                <span>{'// Your code, in full color.'}</span>
                {'\n'}
                <b>pub fn</b> explore(path: &Path) {'{'}
                {'\n'}
                {'  '}
                <b>let</b> files = read_dir(path)?;{'\n'}
                {'  '}files.stream().render();{'\n'}
                {'}'}
                <small>Syntax highlighting · capped at 1 MiB</small>
              </pre>
            )}
            {type === 'pdf' && (
              <>
                <div className="pdf-page">
                  <span>STRATA / FIELD NOTES</span>
                  <h4>
                    A fresh
                    <br />
                    perspective.
                  </h4>
                  <div />
                  <i />
                  <i />
                  <i />
                  <small>01 / Navigate every layer</small>
                </div>
                <div className="format-details">
                  <FileText size={25} />
                  <strong>field-notes.pdf</strong>
                  <span>Every page. Right here.</span>
                  <small>Isolated PDF rendering.</small>
                </div>
              </>
            )}
            {type === 'video' && <VideoPlayerDemo />}
            {type === 'audio' && <AudioPlayerDemo />}
          </div>
          <div className="sandbox-permissions">
            <span>
              <ShieldCheck size={12} /> {type === 'code' ? 'No native format parser' : 'No network'}
            </span>
            <span>
              <ShieldCheck size={12} />{' '}
              {type === 'code' ? 'Read limit enforced' : 'Read-only input'}
            </span>
            <span>
              <ShieldCheck size={12} /> {type === 'code' ? 'In-process text' : 'Fails closed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
