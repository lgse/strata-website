'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import Image from 'next/image';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from './theme-provider';
import './media-player-demo.css';

// Geometry, palette mixes and ballistics follow the app's audio, video and waveform
// preview widgets, so the illustration moves the way the real preview pane does.

type Palette = { accent: string; bright: string; peak: string; text: string; dim: string };
type Spectrum = { levels: Float32Array; peaks: Float32Array; holds: Float32Array; time: number };
type Section = [start: number, loudness: number];
type Track = {
  id: string;
  title: string;
  number: number;
  duration: number;
  seed: number;
  tint?: string;
  sections: Section[];
};
type Clip = {
  id: string;
  stem: string;
  position: number;
  duration: number;
  seed: number;
  tint?: string;
  badges: { label: string; hdr?: boolean }[];
  sections: Section[];
};

const POSTER = '/art/night-drive.svg';
// An original 8 s loop rendered from the same illustration (see docs/MEDIA_BRIEF.md).
const CLIP = { webm: '/media/night-drive.webm', mp4: '/media/night-drive.mp4', duration: 8 };
const SPECTRUM = { bar: 5, gap: 2, min: 12, max: 96, reflection: 0.2, rest: 2, peak: 2 };
const WAVE = { bar: 2, gap: 1, line: 3 };

const album = { artist: 'Strata', title: 'Field Notes', count: 11 };
const tracks: Track[] = [
  {
    id: 'night-drive',
    title: 'Night Drive',
    number: 3,
    duration: 204,
    seed: 7,
    sections: [
      [0, 0.32],
      [0.09, 0.62],
      [0.31, 0.9],
      [0.5, 0.58],
      [0.64, 0.96],
      [0.86, 0.72],
      [0.95, 0.3],
    ],
  },
  {
    id: 'switchbacks',
    title: 'Switchbacks',
    number: 4,
    duration: 187,
    seed: 11,
    tint: 'hue-rotate(28deg) saturate(1.05)',
    sections: [
      [0, 0.5],
      [0.2, 0.8],
      [0.45, 0.55],
      [0.6, 0.92],
      [0.9, 0.4],
    ],
  },
  {
    id: 'last-light',
    title: 'Last Light',
    number: 5,
    duration: 232,
    seed: 23,
    tint: 'hue-rotate(-30deg) saturate(0.9) brightness(1.05)',
    sections: [
      [0, 0.25],
      [0.15, 0.48],
      [0.4, 0.7],
      [0.7, 0.88],
      [0.92, 0.35],
    ],
  },
];
const clipCount = 9;
const clips: Clip[] = [
  {
    id: 'night-drive',
    stem: 'night-drive',
    position: 4,
    duration: 108,
    seed: 31,
    badges: [
      { label: '2160p' },
      { label: 'HDR10', hdr: true },
      { label: '24 fps' },
      { label: 'HEVC' },
      { label: 'AAC Stereo' },
    ],
    sections: [
      [0, 0.2],
      [0.12, 0.55],
      [0.3, 0.3],
      [0.42, 0.75],
      [0.7, 0.45],
      [0.88, 0.85],
    ],
  },
  {
    id: 'ridge-line',
    stem: 'ridge-line',
    position: 5,
    duration: 96,
    seed: 37,
    tint: 'hue-rotate(28deg) saturate(1.05)',
    badges: [{ label: '1080p' }, { label: '60 fps' }, { label: 'AV1' }, { label: 'Opus Stereo' }],
    sections: [
      [0, 0.4],
      [0.25, 0.7],
      [0.5, 0.35],
      [0.65, 0.8],
      [0.9, 0.5],
    ],
  },
  {
    id: 'tunnel-run',
    stem: 'tunnel-run',
    position: 6,
    duration: 143,
    seed: 41,
    tint: 'hue-rotate(-30deg) saturate(0.9) brightness(1.05)',
    badges: [
      { label: '720p' },
      { label: '30 fps' },
      { label: 'H.264' },
      { label: 'AAC 5.1' },
      { label: 'CC ×1' },
    ],
    sections: [
      [0, 0.3],
      [0.1, 0.65],
      [0.35, 0.45],
      [0.55, 0.9],
      [0.8, 0.6],
    ],
  },
];

export const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Loudness per bucket, shaped like a mastered track: quiet intro, verses, louder choruses. */
const levelCache = new Map<number, Float32Array>();
function levelsFor(seed: number, sections: Section[], buckets = 720) {
  const cached = levelCache.get(seed);
  if (cached) return cached;
  const rand = mulberry32(seed);
  const raw = new Float32Array(buckets);
  for (let i = 0; i < buckets; i++) {
    const at = i / buckets;
    let loudness = sections[0][1];
    for (const [start, value] of sections) if (at >= start) loudness = value;
    const beat = i % 8 < 2 ? 1 : 0.78;
    raw[i] = Math.min(1, loudness * beat * (0.5 + 0.5 * rand()));
  }
  const levels = new Float32Array(buckets);
  for (let i = 0; i < buckets; i++)
    levels[i] = (raw[Math.max(0, i - 1)] + 2 * raw[i] + raw[Math.min(buckets - 1, i + 1)]) / 4;
  levelCache.set(seed, levels);
  return levels;
}

function withAlpha(color: string, alpha: number) {
  if (color.startsWith('rgb')) {
    const [r, g, b] = color.match(/[\d.]+/g) ?? ['0', '0', '0'];
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const open = color.indexOf('(');
  const inner = color
    .slice(open + 1, -1)
    .split('/')[0]
    .trim();
  return `${color.slice(0, open)}(${inner} / ${alpha})`;
}

const paletteSlots: (keyof Palette)[] = ['accent', 'bright', 'peak', 'text', 'dim'];
function resolvePalette(probe: HTMLElement): Palette {
  const palette = {} as Palette;
  for (const slot of paletteSlots) {
    probe.style.color = `var(--mp-${slot})`;
    palette[slot] = getComputedStyle(probe).color;
  }
  return palette;
}

function fitCanvas(canvas: HTMLCanvasElement) {
  const scale = window.devicePixelRatio || 1;
  const width = Math.round(canvas.clientWidth * scale);
  const height = Math.round(canvas.clientHeight * scale);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
}

function begin(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const scale = window.devicePixelRatio || 1;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const width = canvas.width / scale;
  const height = canvas.height / scale;
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function paintWaveform(
  canvas: HTMLCanvasElement,
  levels: Float32Array,
  played: number,
  hover: number | null,
  palette: Palette,
) {
  const frame = begin(canvas);
  if (!frame) return;
  const { ctx, width, height } = frame;
  if (width <= 0 || height <= 0) return;
  const center = Math.round(height / 2);
  const pitch = WAVE.bar + WAVE.gap;
  const count = Math.max(1, Math.floor((width + WAVE.gap) / pitch));
  let loudest = 0.04;
  for (const level of levels) loudest = Math.max(loudest, level);
  const playedAt = played * width;
  const hoverAt = hover === null ? null : hover * width;
  const unplayed = withAlpha(palette.dim, 0.45);
  const hovered = withAlpha(palette.accent, 0.55);
  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor((i / count) * levels.length)];
    const bar = Math.max(WAVE.line, Math.min(1, level / loudest) * (height - 2));
    const x = i * pitch;
    const middle = x + WAVE.bar / 2;
    ctx.fillStyle =
      middle <= playedAt
        ? palette.accent
        : hoverAt !== null && middle <= hoverAt
          ? hovered
          : unplayed;
    ctx.fillRect(x, center - bar / 2, WAVE.bar, bar);
  }
  const head = Math.min(Math.max(playedAt, 1), width - 1);
  ctx.fillStyle = palette.peak;
  ctx.fillRect(head - 1, 0, 2, height);
  if (hoverAt !== null && Math.abs(hoverAt - head) > 2) {
    ctx.fillStyle = withAlpha(palette.text, 0.5);
    ctx.fillRect(Math.min(Math.max(hoverAt, 0), width - 1), 0, 1, height);
  }
}

const emptySpectrum = (): Spectrum => ({
  levels: new Float32Array(0),
  peaks: new Float32Array(0),
  holds: new Float32Array(0),
  time: 0.37,
});

function resizeSpectrum(sim: Spectrum, count: number) {
  if (sim.levels.length === count) return;
  const grow = (from: Float32Array) => {
    const next = new Float32Array(count);
    next.set(from.subarray(0, Math.min(count, from.length)));
    return next;
  };
  sim.levels = grow(sim.levels);
  sim.peaks = grow(sim.peaks);
  sim.holds = grow(sim.holds);
}

/** A music-shaped target: a bass-heavy envelope, a 120 bpm kick, off-beat snares and hats. */
function spectrumTarget(index: number, count: number, time: number) {
  const at = count > 1 ? index / (count - 1) : 0;
  const envelope = 0.12 + 0.8 * (1 - at) ** 0.7;
  const wobble =
    0.5 +
    0.5 *
      Math.sin(time * (1.7 + at * 3.1) + index * 1.3) *
      Math.sin(time * (0.9 + (index % 5) * 0.37) + index * 0.71);
  const kick = Math.exp(-(time % 0.5) / 0.09);
  const bar = time % 1;
  const snare = bar >= 0.5 ? Math.exp(-(bar - 0.5) / 0.08) : 0;
  const hat = Math.exp(-(time % 0.25) / 0.04);
  const low = Math.exp(-(((at - 0.05) / 0.14) ** 2));
  const mid = Math.exp(-(((at - 0.42) / 0.16) ** 2));
  const high = Math.exp(-(((at - 0.85) / 0.14) ** 2));
  const target =
    envelope * (0.35 + 0.55 * wobble) + kick * low * 0.55 + snare * mid * 0.4 + hat * high * 0.3;
  return Math.min(Math.max(target, 0), 1);
}

function advanceSpectrum(sim: Spectrum, dt: number, playing: boolean, still: boolean) {
  const count = sim.levels.length;
  if (still) {
    for (let i = 0; i < count; i++) {
      sim.levels[i] = playing ? spectrumTarget(i, count, sim.time) : 0;
      sim.peaks[i] = playing ? Math.min(1, sim.levels[i] + 0.06) : 0;
    }
    return false;
  }
  sim.time += dt;
  let busy = false;
  for (let i = 0; i < count; i++) {
    const target = playing ? spectrumTarget(i, count, sim.time) : 0;
    const level = sim.levels[i];
    const rate = target > level ? 28 : 7;
    sim.levels[i] = level + (target - level) * (1 - Math.exp(-rate * dt));
    if (sim.levels[i] >= sim.peaks[i]) {
      sim.peaks[i] = sim.levels[i];
      sim.holds[i] = 0.35;
    } else {
      sim.holds[i] -= dt;
      if (sim.holds[i] < 0) sim.peaks[i] = Math.max(sim.levels[i], sim.peaks[i] - 0.6 * dt);
    }
    if (sim.levels[i] > 0.004 || sim.peaks[i] > 0.015) busy = true;
  }
  return busy;
}

function paintSpectrum(canvas: HTMLCanvasElement, sim: Spectrum, palette: Palette) {
  const frame = begin(canvas);
  if (!frame) return;
  const { ctx, width, height } = frame;
  const count = sim.levels.length;
  if (!count || width <= 0 || height <= 0) return;
  const bar = Math.max(1, (width - SPECTRUM.gap * (count - 1)) / count);
  const pitch = bar + SPECTRUM.gap;
  const baseline = Math.floor(height * (1 - SPECTRUM.reflection));
  const reflectionTop = baseline + 2;
  const reflectionHeight = Math.max(0, height - reflectionTop);
  // Every bar spans the same gradient, so taller bars reach brighter colors.
  const bars = ctx.createLinearGradient(0, baseline, 0, 0);
  bars.addColorStop(0, palette.accent);
  bars.addColorStop(1, palette.bright);
  const reflection = ctx.createLinearGradient(0, reflectionTop, 0, height);
  reflection.addColorStop(0, withAlpha(palette.accent, 0.32));
  reflection.addColorStop(1, withAlpha(palette.accent, 0));
  for (let i = 0; i < count; i++) {
    const x = i * pitch;
    const rise = Math.max(sim.levels[i] * baseline, SPECTRUM.rest);
    ctx.fillStyle = bars;
    ctx.fillRect(x, baseline - rise, bar, rise);
    const mirrored = Math.min(rise * 0.4, reflectionHeight);
    if (mirrored > 1) {
      ctx.fillStyle = reflection;
      ctx.fillRect(x, reflectionTop, bar, mirrored);
    }
  }
  ctx.fillStyle = palette.peak;
  for (let i = 0; i < count; i++) {
    const peak = sim.peaks[i];
    if (peak <= 0.015) continue;
    const top = Math.max(0, baseline - peak * baseline - SPECTRUM.peak - 1);
    ctx.fillRect(i * pitch, top, bar, SPECTRUM.peak);
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return reduced;
}

type Paint = (dt: number, playing: boolean, position: number) => boolean;

/**
 * One animation loop per player: advances the clock, paints, and sleeps once nothing moves.
 * With a media element attached, playback, seeking and the clock follow the element itself.
 */
function usePlayer(
  root: RefObject<HTMLElement | null>,
  duration: number,
  paint: Paint,
  media?: RefObject<HTMLVideoElement | null>,
) {
  const [playing, setPlayingState] = useState(false);
  const [second, setSecond] = useState(0);
  const position = useRef(0);
  const playingRef = useRef(false);
  const visible = useRef(false);
  const frame = useRef(0);
  const last = useRef<number | null>(null);
  const paintRef = useRef(paint);
  const durationRef = useRef(duration);
  useEffect(() => {
    paintRef.current = paint;
    durationRef.current = duration;
  });
  const run = useCallback(
    function run(now: number) {
      const dt = last.current === null ? 0 : Math.min((now - last.current) / 1000, 0.1);
      last.current = now;
      if (playingRef.current) {
        const element = media?.current;
        position.current =
          element && element.readyState >= 2 && !element.paused
            ? element.currentTime
            : (position.current + dt) % durationRef.current;
        setSecond(Math.floor(position.current));
      }
      const busy = paintRef.current(dt, playingRef.current, position.current);
      if (visible.current && (playingRef.current || busy))
        frame.current = requestAnimationFrame(run);
      else {
        frame.current = 0;
        last.current = null;
      }
    },
    [media],
  );
  const wake = useCallback(() => {
    if (frame.current || !visible.current) return;
    last.current = null;
    frame.current = requestAnimationFrame(run);
  }, [run]);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) {
      visible.current = true;
      wake();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      const element = media?.current;
      if (visible.current) {
        if (element && playingRef.current) element.play().catch(() => {});
        wake();
      } else {
        element?.pause();
        if (frame.current) {
          cancelAnimationFrame(frame.current);
          frame.current = 0;
          last.current = null;
        }
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [root, wake, media]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const setPlaying = useCallback(
    (value: boolean) => {
      playingRef.current = value;
      setPlayingState(value);
      const element = media?.current;
      if (element) {
        if (value) element.play().catch(() => {});
        else element.pause();
      }
      wake();
    },
    [wake, media],
  );
  const seek = useCallback(
    (seconds: number) => {
      position.current = Math.min(Math.max(seconds, 0), Math.max(0, durationRef.current - 0.01));
      const element = media?.current;
      if (element && Number.isFinite(element.duration)) element.currentTime = position.current;
      setSecond(Math.floor(position.current));
      wake();
    },
    [wake, media],
  );
  useEffect(() => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(true);
  }, [setPlaying]);
  return { playing, second, position, setPlaying, seek, wake };
}

function usePalette(
  probe: RefObject<HTMLElement | null>,
  paletteRef: RefObject<Palette | null>,
  wake: () => void,
) {
  const { theme } = useTheme();
  useEffect(() => {
    if (!probe.current) return;
    paletteRef.current = resolvePalette(probe.current);
    wake();
  }, [probe, paletteRef, theme.id, wake]);
}

function useCanvas(canvas: RefObject<HTMLCanvasElement | null>, onResize: () => void) {
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      fitCanvas(node);
      onResize();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [canvas, onResize]);
}

function Scrubber({
  canvas,
  label,
  duration,
  second,
  onSeek,
  onHover,
  onResize,
  children,
}: {
  canvas: RefObject<HTMLCanvasElement | null>;
  label: string;
  duration: number;
  second: number;
  onSeek: (seconds: number) => void;
  onHover: (fraction: number | null) => void;
  onResize: () => void;
  children?: ReactNode;
}) {
  const dragging = useRef(false);
  useCanvas(canvas, onResize);
  const fraction = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 30 : 5;
    const targets: Record<string, number> = {
      ArrowRight: second + step,
      ArrowUp: second + step,
      ArrowLeft: second - step,
      ArrowDown: second - step,
      Home: 0,
      End: duration,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    onSeek(targets[event.key]);
  };
  return (
    <div
      className="mp-scrubber"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={second}
      aria-valuetext={`${clock(second)} of ${clock(duration)}`}
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        onSeek(fraction(event) * duration);
      }}
      onPointerMove={(event) => {
        const at = fraction(event);
        onHover(at);
        if (dragging.current) onSeek(at * duration);
      }}
      onPointerUp={(event) => {
        dragging.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onPointerLeave={() => onHover(null)}
      onKeyDown={onKeyDown}
    >
      <canvas ref={canvas} aria-hidden="true" />
      {children}
    </div>
  );
}

function Volume() {
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const shown = muted ? 0 : volume;
  return (
    <div className="mp-volume">
      <button
        type="button"
        className="mp-button"
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
        onClick={() => setMuted((value) => !value)}
      >
        {shown === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={shown}
        aria-label="Volume"
        style={{ '--fill': `${shown}%` } as CSSProperties}
        onChange={(event) => {
          setVolume(Number(event.target.value));
          setMuted(false);
        }}
      />
    </div>
  );
}

function Transport({
  playing,
  second,
  duration,
  noun,
  onToggle,
  onPrevious,
  onNext,
}: {
  playing: boolean;
  second: number;
  duration: number;
  noun: string;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mp-transport">
      <span className="mp-time">{clock(second)}</span>
      <div className="mp-buttons">
        <button
          type="button"
          className="mp-button"
          aria-label={`Previous ${noun}`}
          onClick={onPrevious}
        >
          <SkipBack size={14} />
        </button>
        <button
          type="button"
          className="mp-center"
          aria-label="Play or pause"
          aria-pressed={playing}
          onClick={onToggle}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button type="button" className="mp-button" aria-label={`Next ${noun}`} onClick={onNext}>
          <SkipForward size={14} />
        </button>
      </div>
      <span className="mp-time mp-time-end">{clock(duration)}</span>
    </div>
  );
}

type PlayerProps = {
  /** Stack the artwork above the panel, as the app does in a tall preview pane. */
  stacked?: boolean;
  /** Pin one item instead of cycling the demo list; previous and next then restart it. */
  only?: string;
  eyebrow?: string;
};

export function AudioPlayerDemo({ stacked, only, eyebrow }: PlayerProps) {
  const root = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLElement>(null);
  const wave = useRef<HTMLCanvasElement>(null);
  const spectrum = useRef<HTMLCanvasElement>(null);
  const sim = useRef(emptySpectrum());
  const hover = useRef<number | null>(null);
  const paletteRef = useRef<Palette | null>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      tracks.findIndex((t) => t.id === only),
    ),
  );
  const track = tracks[index];
  const levels = levelsFor(track.seed, track.sections);

  const paint = useCallback<Paint>(
    (dt, playing, position) => {
      const palette = paletteRef.current;
      if (!palette) return false;
      if (wave.current)
        paintWaveform(wave.current, levels, position / track.duration, hover.current, palette);
      let busy = false;
      if (spectrum.current) {
        busy = advanceSpectrum(sim.current, dt, playing, reduced);
        paintSpectrum(spectrum.current, sim.current, palette);
      }
      return busy;
    },
    [levels, track.duration, reduced],
  );
  const player = usePlayer(root, track.duration, paint);
  const { wake, seek, setPlaying, playing, second, position } = player;
  usePalette(probe, paletteRef, wake);
  useCanvas(
    spectrum,
    useCallback(() => {
      const width = spectrum.current?.clientWidth ?? 0;
      const count = Math.floor((width + SPECTRUM.gap) / (SPECTRUM.bar + SPECTRUM.gap));
      resizeSpectrum(sim.current, Math.min(Math.max(count, SPECTRUM.min), SPECTRUM.max));
      wake();
    }, [wake]),
  );

  const change = (next: number) => {
    if (!only) setIndex((next + tracks.length) % tracks.length);
    seek(0);
  };
  return (
    <div
      className={`media-player mp-audio ${stacked ? 'mp-stacked' : ''}`}
      ref={root}
      data-playing={playing}
    >
      <i className="mp-probe" ref={probe} aria-hidden="true" />
      <div className="mp-art" aria-hidden="true">
        <div className="mp-disc" />
        <div className="mp-cover" key={track.id} style={{ filter: track.tint }}>
          <Image src={POSTER} alt="" width={160} height={160} />
        </div>
      </div>
      <div className="mp-panel">
        <div className="mp-header">
          <div className="mp-eyebrow-row">
            <span className="mp-eyebrow">
              {eyebrow ?? `Track ${track.number} of ${album.count}`}
            </span>
            <Volume />
          </div>
          <strong className="mp-title">{track.title}</strong>
          <span className="mp-byline">
            <b>{album.artist}</b> — {album.title}
          </span>
        </div>
        <canvas className="mp-spectrum" ref={spectrum} aria-hidden="true" />
        <Scrubber
          canvas={wave}
          label="Seek"
          duration={track.duration}
          second={second}
          onSeek={seek}
          onHover={(at) => {
            hover.current = at;
            wake();
          }}
          onResize={wake}
        />
        <Transport
          playing={playing}
          second={second}
          duration={track.duration}
          noun="track"
          onToggle={() => setPlaying(!playing)}
          onPrevious={() => (position.current > 3 ? seek(0) : change(index - 1))}
          onNext={() => change(index + 1)}
        />
      </div>
    </div>
  );
}

export function VideoPlayerDemo({ stacked, only, eyebrow }: PlayerProps) {
  const root = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLElement>(null);
  const wave = useRef<HTMLCanvasElement>(null);
  const hover = useRef<number | null>(null);
  const paletteRef = useRef<Palette | null>(null);
  const [bubble, setBubble] = useState<number | null>(null);
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      clips.findIndex((c) => c.id === only),
    ),
  );
  const clip = clips[index];
  const levels = levelsFor(clip.seed, clip.sections);
  const video = useRef<HTMLVideoElement>(null);
  const [mediaDuration, setMediaDuration] = useState<number | null>(null);
  const duration = mediaDuration ?? CLIP.duration;

  const paint = useCallback<Paint>(
    (_dt, _playing, position) => {
      const palette = paletteRef.current;
      if (palette && wave.current)
        paintWaveform(wave.current, levels, position / duration, hover.current, palette);
      return false;
    },
    [levels, duration],
  );
  const { wake, seek, setPlaying, playing, second, position } = usePlayer(
    root,
    duration,
    paint,
    video,
  );
  usePalette(probe, paletteRef, wake);

  const change = (next: number) => {
    if (!only) setIndex((next + clips.length) % clips.length);
    seek(0);
  };
  return (
    <div
      className={`media-player mp-video ${stacked ? 'mp-stacked' : ''}`}
      ref={root}
      data-playing={playing}
    >
      <i className="mp-probe" ref={probe} aria-hidden="true" />
      <div className="mp-frame" aria-hidden="true">
        <div className="mp-glow" style={{ filter: clip.tint }} />
        <div className="mp-picture" style={{ filter: clip.tint }}>
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="metadata"
            poster={POSTER}
            onLoadedMetadata={(event) => {
              const length = event.currentTarget.duration;
              if (Number.isFinite(length) && length > 0) setMediaDuration(length);
            }}
          >
            <source src={CLIP.webm} type="video/webm" />
            <source src={CLIP.mp4} type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="mp-panel">
        <div className="mp-header">
          <div className="mp-eyebrow-row">
            <span className="mp-eyebrow">
              {eyebrow ?? `${clip.position} of ${clipCount} in folder`}
            </span>
            <Volume />
          </div>
          <strong className="mp-title">{clip.stem}</strong>
          <div className="mp-badges">
            {clip.badges.map((badge) => (
              <span key={badge.label} className={badge.hdr ? 'mp-badge mp-badge-hdr' : 'mp-badge'}>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
        <Scrubber
          canvas={wave}
          label="Seek"
          duration={duration}
          second={second}
          onSeek={seek}
          onHover={(at) => {
            hover.current = at;
            setBubble(at);
            wake();
          }}
          onResize={wake}
        >
          {bubble !== null && (
            <div className="mp-bubble" style={{ '--x': `${bubble * 100}%` } as CSSProperties}>
              <div
                className="mp-bubble-cell"
                style={{ backgroundPosition: `${bubble * 100}% 50%`, filter: clip.tint }}
              />
              <span>{clock(bubble * duration)}</span>
            </div>
          )}
        </Scrubber>
        <Transport
          playing={playing}
          second={second}
          duration={duration}
          noun="video"
          onToggle={() => setPlaying(!playing)}
          onPrevious={() => (position.current > 3 ? seek(0) : change(index - 1))}
          onNext={() => change(index + 1)}
        />
      </div>
    </div>
  );
}
