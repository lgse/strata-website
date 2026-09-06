// Transcribed from the six supplied comparison charts, preserved in public/benchmarks.
// Timings are median capture bounds, not exact point estimates or observed-run whiskers.
export const managers = [
  'Flea',
  'Strata',
  'Krusader',
  'Dolphin',
  'Nautilus',
  'Nemo',
  'Thunar',
] as const;
type Seven<T> = readonly [T, T, T, T, T, T, T];
type Timing = readonly [number, number] | string;

export type BenchmarkDatum = {
  manager: (typeof managers)[number];
  value: number | null;
  lower?: number;
  label: string;
  note?: string;
};

export type VisualBenchmark = {
  id: string;
  label: string;
  readyTitle: string;
  first?: BenchmarkDatum[];
  ready: BenchmarkDatum[];
  memory: BenchmarkDatum[];
  note: string;
  source: string;
};

function timings(values: Seven<Timing>): BenchmarkDatum[] {
  return values.map((value, i) => ({
    manager: managers[i],
    value: typeof value === 'string' ? null : value[1],
    lower: typeof value === 'string' ? undefined : value[0],
    label: typeof value === 'string' ? value : `${value[0].toFixed(2)}–${value[1].toFixed(2)} s`,
  }));
}

function memory(values: Seven<number>): BenchmarkDatum[] {
  return values.map((value, i) => ({ manager: managers[i], value, label: `${value} MiB` }));
}

export const largeFolder: VisualBenchmark = {
  id: 'large-folder',
  label: '100,000 entries',
  readyTitle: 'Content visually settled',
  ready: timings([
    [0.22, 0.5],
    [2.52, 2.82],
    [1.39, 1.69],
    [4.57, 4.92],
    [9.76, 10.09],
    [42.21, 42.57],
    [8.03, 8.36],
  ]),
  memory: memory([86, 135, 163, 238, 299, 302, 440]),
  note: '90,000 files + 10,000 folders. Strata uses the second-lowest sampled peak memory here and settles ahead of Dolphin, Nautilus, Nemo and Thunar. Flea and Krusader settle sooner.',
  source: 'large-folders-jpegs.png',
};

function preview(
  id: string,
  label: string,
  first: Seven<Timing>,
  ready: Seven<Timing>,
  peaks: Seven<number>,
  note: string,
  source: string,
): VisualBenchmark {
  return {
    id,
    label,
    first: timings(first),
    ready: timings(ready),
    memory: memory(peaks),
    readyTitle: 'All 12 thumbnails',
    note,
    source,
  };
}

export const previews: VisualBenchmark[] = [
  {
    ...preview(
      'jpeg-2000',
      '2,000 JPEGs',
      [
        [0.16, 0.5],
        [0.85, 1.17],
        [0.0, 0.26],
        [0.03, 0.37],
        [0.93, 1.36],
        [0.81, 1.21],
        [0.45, 0.77],
      ],
      [
        [1.26, 1.52],
        [2.22, 2.64],
        [0.05, 0.36],
        [0.15, 0.47],
        [2.04, 2.56],
        [3.41, 3.7],
        [0.73, 1.05],
      ],
      [127, 126, 73, 103, 257, 104, 76],
      'Visible viewport only, not all 2,000 thumbnails. Fully visible counts differ: Flea 70, Strata 30, Krusader 29, Dolphin 35, Nautilus 36, Nemo 48, Thunar 64. Native sizes and layouts differ, so this is not equal-work throughput. Strata trails several peers.',
      'large-folders-jpegs.png',
    ),
    readyTitle: 'Visible thumbnails ready',
  },
  preview(
    'jpg',
    '12 JPG files',
    [
      [0.08, 0.4],
      [0.23, 0.54],
      [0.0, 0.23],
      [0.0, 0.22],
      [0.37, 0.76],
      [0.44, 0.73],
      [0.13, 0.42],
    ],
    [
      [0.34, 0.61],
      [0.6, 0.87],
      [0.0, 0.23],
      [0.0, 0.22],
      [0.65, 0.95],
      [0.47, 0.78],
      [0.16, 0.46],
    ],
    [153, 148, 54, 67, 272, 128, 68],
    'Every manager completes the set. Strata is behind Krusader, Dolphin and Thunar on thumbnail readiness, and uses more sampled peak memory than those three.',
    'jpg-png.png',
  ),
  preview(
    'png',
    '12 PNG files',
    [
      [0.05, 0.37],
      [0.24, 0.56],
      [0.0, 0.31],
      [0.0, 0.28],
      [0.47, 0.83],
      [0.42, 0.71],
      [0.18, 0.47],
    ],
    [
      [0.26, 0.56],
      [0.58, 0.86],
      [0.11, 0.4],
      [0.06, 0.35],
      [0.61, 0.92],
      [0.42, 0.71],
      [0.48, 0.78],
    ],
    [160, 146, 110, 117, 278, 124, 80],
    'All 12 previews work, but Flea, Krusader and Dolphin finish sooner than Strata. Memory is below Nautilus, not the lightest in the group.',
    'jpg-png.png',
  ),
  preview(
    'webp',
    '12 WEBP files',
    [
      [0.15, 0.47],
      [0.25, 0.56],
      [0.0, 0.28],
      [0.0, 0.28],
      [0.47, 0.85],
      [0.46, 0.76],
      [0.18, 0.48],
    ],
    [
      [0.36, 0.65],
      [0.66, 0.96],
      [0.0, 0.28],
      [0.0, 0.28],
      [0.63, 0.96],
      [0.64, 0.94],
      [0.78, 1.07],
    ],
    [157, 143, 97, 121, 261, 137, 81],
    'Strata’s completion bounds overlap Nautilus and Nemo. Krusader and Dolphin finish sooner with lower sampled peak memory.',
    'webp-tiff.png',
  ),
  preview(
    'tiff',
    '12 TIFF files',
    [
      [0.15, 0.45],
      [0.29, 0.6],
      [0.0, 0.31],
      [0.0, 0.29],
      [0.64, 0.98],
      '0/12 verified',
      [0.19, 0.48],
    ],
    [
      [0.36, 0.64],
      [0.81, 1.07],
      [0.0, 0.33],
      [0.0, 0.29],
      [0.78, 1.09],
      '0/12 verified',
      [1.09, 1.39],
    ],
    [116, 238, 107, 118, 366, 49, 140],
    'Strata completes TIFF previews, but uses the second-highest sampled peak memory here. Nemo has no verified thumbnails in this installation; its low memory is not an equivalent result.',
    'webp-tiff.png',
  ),
  preview(
    'mp4',
    '12 MP4 files',
    [
      [0.15, 0.48],
      [0.27, 0.6],
      [0.05, 0.39],
      [0.09, 0.45],
      [0.51, 0.94],
      [0.43, 0.75],
      [0.14, 0.47],
    ],
    [
      [0.54, 0.84],
      [0.61, 0.9],
      [0.36, 0.62],
      [0.35, 0.66],
      [0.81, 1.15],
      [0.9, 1.18],
      [0.73, 1.03],
    ],
    [196, 219, 217, 213, 303, 187, 94],
    'Strata’s MP4 thumbnail completion bounds overlap several peers. Only Nautilus uses more sampled peak memory in this fixture. This measures thumbnails, not video playback.',
    'mp4-webm.png',
  ),
  preview(
    'webm',
    '12 WEBM files',
    [
      [0.06, 0.39],
      [0.14, 0.48],
      [0.04, 0.38],
      [0.0, 0.33],
      [0.41, 0.79],
      [0.45, 0.73],
      [0.15, 0.49],
    ],
    [
      [0.39, 0.7],
      [0.47, 0.75],
      [0.28, 0.56],
      [0.25, 0.53],
      [0.69, 1.06],
      [0.64, 0.95],
      [0.45, 0.78],
    ],
    [160, 171, 158, 159, 248, 139, 83],
    'WEBM completion bounds overlap most peers. Strata uses more sampled peak memory than every manager except Nautilus. This measures thumbnails, not video playback.',
    'mp4-webm.png',
  ),
  preview(
    'pdf',
    '12 PDF files',
    [
      [0.15, 0.49],
      [0.14, 0.48],
      [0.26, 0.59],
      [0.23, 0.56],
      [0.4, 0.78],
      [0.43, 0.75],
      [0.14, 0.47],
    ],
    [
      [0.53, 0.83],
      [0.47, 0.78],
      [0.93, 1.25],
      [0.94, 1.22],
      [0.8, 1.09],
      [0.72, 1.0],
      [0.54, 0.85],
    ],
    [120, 135, 160, 169, 238, 107, 89],
    'A stronger showing: Strata completes all PDF thumbnails ahead of Krusader, Dolphin and Nautilus on the reported bounds. Flea and Thunar overlap, so there is no clear win over them.',
    'pdf-raw.png',
  ),
  preview(
    'raw',
    '12 RAW files',
    [
      '0/12 verified',
      [0.17, 0.51],
      [0.0, 0.3],
      [0.0, 0.24],
      '0/12 verified',
      '0/12 verified',
      '0/12 verified',
    ],
    [
      '0/12 verified',
      [0.96, 1.22],
      '11/12 verified',
      '11/12 verified',
      '0/12 verified',
      '0/12 verified',
      '0/12 verified',
    ],
    [72, 227, 85, 105, 197, 49, 68],
    'Strata is the only manager with all 12 RAW thumbnails verified in this installation. Krusader and Dolphin reach 11/12; the others 0/12. That coverage comes with the highest sampled peak memory here. Missing previews are not zero-second completions.',
    'pdf-raw.png',
  ),
];

type CpuWorkload = {
  id: string;
  label: string;
  values: Seven<number | null>;
  rebound: number[];
  incomplete: number[];
};

export const cpuWorkloads: CpuWorkload[] = [
  {
    id: 'entries',
    label: '100,000 files and folders',
    values: [0.85, 1.01, 1.49, 5.99, 11.48, null, 28.39],
    rebound: [1],
    incomplete: [],
  },
  {
    id: 'mp4',
    label: '100 MP4 videos',
    values: [2.99, 1.73, 3.28, 3.15, 6.7, 4.36, 3.59],
    rebound: [0],
    incomplete: [],
  },
  {
    id: 'raw',
    label: '100 RAW files',
    values: [0.97, 2.59, 0.74, 0.76, 0.25, 0.74, 0.25],
    rebound: [4],
    incomplete: [0, 2, 3, 4, 5, 6],
  },
  {
    id: 'jpeg',
    label: '100 JPEG files',
    values: [1.71, 1.82, 0.36, 0.5, 3.41, 2.83, 0.62],
    rebound: [4, 5],
    incomplete: [],
  },
];

export function cpuTimings(workload: CpuWorkload): BenchmarkDatum[] {
  return workload.values.map((value, i) => ({
    manager: managers[i],
    value,
    label:
      value === null
        ? '>60 s (timeout)'
        : `${value.toFixed(2)} s${workload.incomplete.includes(i) ? ' †' : ''}${workload.rebound.includes(i) ? ' ‡' : ''}`,
    note:
      [
        workload.incomplete.includes(i) && 'RAW previews missing or incomplete.',
        workload.rebound.includes(i) && 'CPU crossed the threshold again during follow-up.',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  }));
}

export const benchmarkSources = [
  { file: 'large-folders-jpegs.png', label: 'Large folders / 2,000 JPEGs' },
  { file: 'jpg-png.png', label: 'JPG / PNG' },
  { file: 'webp-tiff.png', label: 'WEBP / TIFF' },
  { file: 'mp4-webm.png', label: 'MP4 / WEBM' },
  { file: 'pdf-raw.png', label: 'PDF / RAW' },
  { file: 'cpu-activity.png', label: 'CPU activity' },
];
