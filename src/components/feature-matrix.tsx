'use client';

import { useRef, useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  CircleDot,
  Grid2X2,
  Minus,
  Puzzle,
  X,
} from 'lucide-react';
import {
  comparisonFeatures,
  comparisonProjects,
  comparisonReviewed,
  featureCategories,
  featureStatuses,
  type ComparisonApp,
  type FeatureCategory,
  type FeatureStatus,
} from '@/lib/feature-comparison';
import styles from './feature-matrix.module.css';

const statusIcons = {
  'built-in': Check,
  addon: Puzzle,
  partial: CircleDot,
  'not-found': Minus,
  unverified: CircleHelp,
};
function StatusIcon({ status }: { status: FeatureStatus }) {
  const Icon = statusIcons[status];
  return <Icon size={14} aria-hidden="true" />;
}

export function FeatureMatrix() {
  const [category, setCategory] = useState<FeatureCategory>('All features');
  const [selection, setSelection] = useState<{ featureId: string; app: ComparisonApp }>({
    featureId: 'isolation',
    app: 'strata',
  });
  const dialog = useRef<HTMLDialogElement>(null);
  const features = comparisonFeatures.filter(
    (feature) => category === 'All features' || feature.category === category,
  );
  const selectedFeature = comparisonFeatures.find(({ id }) => id === selection.featureId)!;
  const selectedApp = comparisonProjects.find(({ id }) => id === selection.app)!;
  const selectedCell = selectedFeature.cells[selection.app];

  return (
    <article id="comparison" className={styles.card} aria-labelledby="comparison-title" data-reveal>
      <div className={styles.header}>
        <div>
          <span className="eyebrow">
            <Grid2X2 size={14} aria-hidden="true" /> BEYOND THE BENCHMARK
          </span>
          <h3 id="comparison-title">
            Different tools.
            <br />
            <span>Different strengths.</span>
          </h3>
        </div>
        <div className={styles.intro}>
          <p>
            Miller columns aren’t ours alone. Neither is network browsing. Compare what’s built in,
            what needs a companion, and where Strata still has gaps.
          </p>
          <span>
            7 managers <i aria-hidden="true" /> {comparisonFeatures.length} capabilities{' '}
            <i aria-hidden="true" /> Sources for every cell
          </span>
        </div>
      </div>

      <div className={styles.controls}>
        <div role="group" aria-label="Feature comparison category" className={styles.filters}>
          {featureCategories.map((name) => (
            <button
              type="button"
              key={name}
              aria-pressed={category === name}
              aria-controls="feature-matrix-table"
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className={styles.legend} aria-label="Feature status legend">
          {(Object.keys(featureStatuses) as FeatureStatus[]).map((status) => (
            <span key={status} title={featureStatuses[status].definition}>
              <StatusIcon status={status} />
              {featureStatuses[status].label}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.tableHint} id="comparison-hint">
        <span>Select any cell for the definition, caveats and sources.</span>
        <span>
          <ArrowLeftRight size={12} aria-hidden="true" /> Scroll to compare
        </span>
      </div>
      <div
        className={styles.tableScroll}
        role="region"
        aria-label="Scrollable feature comparison"
        tabIndex={0}
        aria-describedby="comparison-hint"
      >
        <table id="feature-matrix-table" className={styles.table}>
          <caption className={styles.srOnly}>
            File manager feature comparison: {category}. Source snapshots reviewed{' '}
            {comparisonReviewed}.
          </caption>
          <thead>
            <tr>
              <th scope="col">Capability</th>
              {comparisonProjects.map(({ id, name }) => (
                <th scope="col" key={id} className={id === 'strata' ? styles.strata : undefined}>
                  {name}
                  {id === 'strata' && <span>This app</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.id}>
                <th scope="row">{feature.title}</th>
                {comparisonProjects.map(({ id, name }) => {
                  const cell = feature.cells[id];
                  return (
                    <td key={id} className={id === 'strata' ? styles.strata : undefined}>
                      <button
                        type="button"
                        className={styles.cell}
                        data-status={cell.status}
                        aria-haspopup="dialog"
                        aria-controls="feature-evidence"
                        aria-label={`${name}: ${feature.title}. ${featureStatuses[cell.status].label}${cell.label ? ` (${cell.label})` : ''}. View evidence.`}
                        onClick={() => {
                          setSelection({ featureId: feature.id, app: id });
                          dialog.current?.showModal();
                        }}
                      >
                        <StatusIcon status={cell.status} />
                        <span>{cell.label ?? featureStatuses[cell.status].label}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.takeaways}>
        <div>
          <span>WHY STRATA</span>
          <p>
            Miller navigation, an in-app palette editor, and mandatory isolation for original
            native-parser preview inputs. A particular combination, not a claim to own every
            feature.
          </p>
        </div>
        <div>
          <span>WHY SOMETHING ELSE</span>
          <p>
            Flea shares the keyboard-first column workflow. Krusader, Dolphin, Nemo and Thunar offer
            independent split panes. Strata’s reviewed build lacks folder tabs, batch renaming and
            content search.
          </p>
        </div>
      </div>
      <details className={styles.methodology}>
        <summary>
          Research scope & sources <span aria-hidden="true">+</span>
        </summary>
        <div>
          <p>
            <strong>
              Reviewed <time dateTime={comparisonReviewed}>6 September 2026</time>.
            </strong>{' '}
            Official documentation and public source were inspected for all seven managers and
            relevant companion components. The pinned revisions below are development snapshots, not
            a promise about the latest stable packages and not the unidentified builds in the
            benchmark screenshots.
          </p>
          <p>
            This is a source review, not a hands-on certification of every feature or a security
            audit. “Not found” is limited to the reviewed built-in implementation; “Unverified”
            means the evidence is insufficient. Neither rules out third-party extensions. RAW
            results above describe the tested installation, not universal format support.
          </p>
          <dl>
            {(Object.keys(featureStatuses) as FeatureStatus[]).map((status) => (
              <div key={status}>
                <dt>
                  <StatusIcon status={status} />
                  {featureStatuses[status].label}
                </dt>
                <dd>{featureStatuses[status].definition}</dd>
              </div>
            ))}
          </dl>
          <nav aria-label="Reviewed file manager source revisions">
            {comparisonProjects.map(({ id, name, repo, revision }) => (
              <a
                key={id}
                href={`https://github.com/${repo}/tree/${revision}`}
                target="_blank"
                rel="noreferrer"
              >
                {name} <code>{revision.slice(0, 7)}</code>
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </details>
      <div className={styles.reviewDate}>
        Source review · <time dateTime={comparisonReviewed}>06 Sep 2026</time> · Development
        snapshots, not benchmark versions.
      </div>

      <dialog
        ref={dialog}
        id="feature-evidence"
        className={styles.dialog}
        aria-labelledby="feature-evidence-title"
        aria-describedby="feature-evidence-note"
      >
        <div className={styles.dialogHeader}>
          <span className="eyebrow">THE DETAIL BEHIND THE CELL</span>
          <form method="dialog">
            <button type="submit" aria-label="Close feature evidence">
              <X size={19} aria-hidden="true" />
            </button>
          </form>
        </div>
        <span className={styles.appName}>{selectedApp.name}</span>
        <h4 id="feature-evidence-title">{selectedFeature.title}</h4>
        <div className={styles.dialogStatus}>
          <StatusIcon status={selectedCell.status} />
          {featureStatuses[selectedCell.status].label}
          {selectedCell.label && ` · ${selectedCell.label}`}
        </div>
        <p id="feature-evidence-note">{selectedCell.note}</p>
        <div className={styles.definition}>
          <strong>What this row means</strong>
          <p>{selectedFeature.definition}</p>
        </div>
        <div className={styles.sourceLinks}>
          <strong>Evidence</strong>
          {selectedCell.sources.map(({ label, url }) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {label}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className={styles.dialogFootnote}>
          Reviewed 6 September 2026. Source links are pinned to the reviewed revision where
          available; live documentation can change.
        </p>
      </dialog>
    </article>
  );
}
