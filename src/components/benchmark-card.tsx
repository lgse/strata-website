'use client';

import { useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  CircleHelp,
  SlidersHorizontal,
} from 'lucide-react';
import {
  benchmarkSources,
  cpuTimings,
  cpuWorkloads,
  largeFolder,
  previews,
  type BenchmarkDatum,
} from '@/lib/benchmarks';
import styles from './benchmark-card.module.css';

function Chart({
  title,
  rows,
  unit,
  ranges = false,
}: {
  title: string;
  rows: BenchmarkDatum[];
  unit: 's' | 'MiB';
  ranges?: boolean;
}) {
  const max = Math.max(...rows.map((row) => row.value ?? 0));
  const step = max > 100 ? 100 : max > 10 ? 10 : max > 2 ? 1 : 0.5;
  const ceiling = Math.ceil(max / step) * step;
  return (
    <figure className={styles.chart}>
      <figcaption>
        <h4>{title}</h4>
        <span>
          <ArrowDown size={11} aria-hidden="true" /> Lower is better
        </span>
      </figcaption>
      <ul className={styles.rows} aria-label={title}>
        {rows.map(({ manager, value, lower, label, note }) => (
          <li key={manager} className={manager === 'Strata' ? styles.strata : undefined}>
            <span className={styles.manager}>
              {manager}
              {manager === 'Strata' && <span className={styles.srOnly}> (this app)</span>}
            </span>
            <span className={styles.track} aria-hidden="true">
              {value !== null && (
                <>
                  <span
                    className={styles.bar}
                    style={{ width: `${((lower ?? value) / ceiling) * 100}%` }}
                  />
                  {lower !== undefined && (
                    <span
                      className={styles.interval}
                      style={{
                        left: `${(lower / ceiling) * 100}%`,
                        width: `${((value - lower) / ceiling) * 100}%`,
                      }}
                    />
                  )}
                </>
              )}
            </span>
            <span className={styles.value}>
              {label}
              {note && <span className={styles.srOnly}> {note}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.axis} aria-hidden="true">
        <span>0</span>
        <span>{ceiling / 2}</span>
        <span>
          {ceiling} {unit}
        </span>
      </div>
      <p className={styles.chartNote}>
        {unit === 'MiB'
          ? 'Sampled peak app-group memory, including cache.'
          : ranges
            ? 'Seconds from navigation. Capped segments show median capture bounds.'
            : 'Elapsed seconds to the first CPU quiet period, not visual readiness.'}
      </p>
    </figure>
  );
}

const views = [
  { id: 'cpu', label: 'CPU activity' },
  { id: 'folders', label: 'Large folders' },
  { id: 'previews', label: 'Thumbnails' },
] as const;

export function BenchmarkCard() {
  const [view, setView] = useState<(typeof views)[number]['id']>('cpu');
  const [previewId, setPreviewId] = useState('jpg');
  const [cpuId, setCpuId] = useState('mp4');
  const [metric, setMetric] = useState('ready');
  const visual = view === 'folders' ? largeFolder : previews.find((item) => item.id === previewId)!;
  const cpu = cpuWorkloads.find((item) => item.id === cpuId)!;
  const cpuRows = cpuTimings(cpu).toSorted((a, b) => (a.value ?? Infinity) - (b.value ?? Infinity));
  const isCpu = view === 'cpu';
  const first = view === 'previews' && metric === 'first';
  const source = isCpu ? 'cpu-activity.png' : visual.source;

  return (
    <article id="benchmarks" className={styles.card} aria-labelledby="benchmark-title" data-reveal>
      <div className={styles.header}>
        <div>
          <span className="eyebrow">
            <ChartNoAxesCombined size={14} aria-hidden="true" /> PERFORMANCE, IN PERSPECTIVE
          </span>
          <h3 id="benchmark-title">
            The fast parts.
            <br />
            <span>The honest parts.</span>
          </h3>
          <p>
            Seven file managers. Real workloads. A closer look at where Strata shines, and where
            there’s work to do.
          </p>
        </div>
        <div className={styles.highlights}>
          <div>
            <strong>
              135 <span>MiB</span>
            </strong>
            <span>100k entries · sampled peak memory</span>
          </div>
          <div>
            <strong>
              12<span>/12</span>
            </strong>
            <span>RAW thumbnails verified · only complete set here</span>
          </div>
          <p>
            Results from these test fixtures. <br />
            Not a promise for every machine.
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.viewButtons} role="group" aria-label="Benchmark category">
          {views.map(({ id, label }) => (
            <button
              type="button"
              key={id}
              aria-pressed={view === id}
              aria-controls="benchmark-results"
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className={styles.legend}>
          <i aria-hidden="true" /> Strata highlighted
        </span>
      </div>

      <div id="benchmark-results" className={styles.results}>
        <div className={styles.resultHeading}>
          <div>
            <span className={styles.overline}>
              {isCpu ? 'ACTIVITY ≠ READINESS' : 'VISUAL READINESS + MEMORY'}
            </span>
            <h4>{isCpu ? cpu.label : visual.label}</h4>
          </div>
          {view === 'previews' && (
            <div className={styles.selects}>
              <label>
                Fixture
                <span className={styles.selectControl}>
                  <select value={previewId} onChange={(event) => setPreviewId(event.target.value)}>
                    {previews.map(({ id, label }) => (
                      <option value={id} key={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} aria-hidden="true" />
                </span>
              </label>
              <label>
                Timing
                <span className={styles.selectControl}>
                  <select value={metric} onChange={(event) => setMetric(event.target.value)}>
                    <option value="ready">Set ready</option>
                    <option value="first">First thumbnail</option>
                  </select>
                  <ChevronDown size={14} aria-hidden="true" />
                </span>
              </label>
            </div>
          )}
          {isCpu && (
            <label className={styles.cpuSelect}>
              Fixture
              <span className={styles.selectControl}>
                <select value={cpuId} onChange={(event) => setCpuId(event.target.value)}>
                  {cpuWorkloads.map(({ id, label }) => (
                    <option value={id} key={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </span>
            </label>
          )}
        </div>
        <div className={styles.charts}>
          <Chart
            title={
              isCpu
                ? 'CPU activity settled'
                : first
                  ? 'First verified thumbnail'
                  : visual.readyTitle
            }
            rows={isCpu ? cpuRows : first ? visual.first! : visual.ready}
            unit="s"
            ranges={!isCpu}
          />
          {isCpu ? (
            <div className={styles.cpuContext}>
              <CircleHelp size={23} aria-hidden="true" />
              <h4>Quiet doesn’t mean ready.</h4>
              <p>
                One run per manager. The quiet threshold is 5% of one CPU core for one second,
                including app-group helpers. It does not measure when content appears.
              </p>
              <p>
                <strong>† Missing or incomplete RAW previews.</strong> A low time is not evidence of
                working previews in this installation.
              </p>
              <p>
                <strong>‡ CPU activity resumed</strong> above the threshold during the two-second
                follow-up. This is the first quiet period, not permanent inactivity.
              </p>
            </div>
          ) : (
            <Chart title="Sampled peak memory" rows={visual.memory} unit="MiB" />
          )}
        </div>
        <div className={styles.readout}>
          <p>
            {isCpu
              ? 'Strata reaches the first quiet period soonest for 100 MP4s in this run. It is not the quickest for JPEGs, and RAW comparisons are limited by missing or incomplete previews in the other managers.'
              : visual.note}
          </p>
          <a href={`/benchmarks/${source}`} target="_blank" rel="noreferrer">
            Source chart <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className={styles.verdicts}>
        <div>
          <span className={styles.verdictLabel}>
            <Check size={15} aria-hidden="true" /> WHERE WE SHINE
          </span>
          <h4>Big folders. Broader previews.</h4>
          <p>
            Second-lowest sampled peak memory at 100k entries. The only complete 12-file RAW preview
            set in this installation. A strong showing on PDFs, too.
          </p>
        </div>
        <div>
          <span className={styles.verdictLabel}>
            <SlidersHorizontal size={15} aria-hidden="true" /> WHERE WE NEED WORK
          </span>
          <h4>Thumbnail speed. Media memory.</h4>
          <p>
            Several peers render common image thumbnails sooner. Strata has the highest RAW memory
            peak here, and the second-highest for TIFF, MP4 and WEBM.
          </p>
        </div>
      </div>

      <details className={styles.methodology}>
        <summary>
          How to read these results <span aria-hidden="true">+</span>
        </summary>
        <div>
          <p>
            Values are transcribed from the six source comparison charts. Visual timings show the
            reported median capture bounds, not exact completion times. Bars run from zero to the
            lower bound; capped segments span the lower and upper bounds. Overlapping bounds should
            not be treated as clear wins. The source charts also show observed-run whiskers; those
            are not reproduced here.
          </p>
          <p>
            Memory is sampled peak app-group charged memory, including cache, not just the main
            process’s RSS. Missing or incomplete previews are labeled, never plotted as zero-second
            results. Preview coverage describes this installation, not universal format support. The
            2,000-JPEG fixture compares different visible thumbnail counts and layouts.
          </p>
          <p>
            The source charts do not specify hardware, OS and application versions, cache state, or
            visual-test run counts. Treat these as fixture-specific observations, not a universal
            ranking or a reproducible benchmark report. CPU results are a separate, single-run
            measurement.
          </p>
          <nav aria-label="Original benchmark charts">
            {benchmarkSources.map(({ file, label }) => (
              <a key={file} href={`/benchmarks/${file}`} target="_blank" rel="noreferrer">
                {label} <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </details>
    </article>
  );
}
