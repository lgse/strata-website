'use client';

import { ArrowDownWideNarrow, ArrowUpNarrowWide, Funnel, RotateCcw, Settings2 } from 'lucide-react';

type PaneActionsProps = {
  label: string;
  parent?: boolean;
  ascending: boolean;
  filtering: boolean;
  grouped: boolean;
  onRefresh: () => void;
  onSort: () => void;
  onFilter: () => void;
  onGroupChange: (grouped: boolean) => void;
};

// Match Strata's column header: refresh, sort direction, sort options, filter.
// Loading indicators and child-column close buttons are intentionally omitted.
export function PaneActions({
  label,
  parent = false,
  ascending,
  filtering,
  grouped,
  onRefresh,
  onSort,
  onFilter,
  onGroupChange,
}: PaneActionsProps) {
  const DirectionIcon = ascending ? ArrowUpNarrowWide : ArrowDownWideNarrow;
  return (
    <div className="pane-actions" role="group" aria-label={`${label} pane controls`}>
      <button
        data-pane-action="refresh"
        aria-label={parent ? 'Refresh parent pane' : 'Refresh demo folder'}
        title="Refresh this pane"
        onClick={onRefresh}
      >
        <RotateCcw size={13} />
      </button>
      <button
        data-pane-action="sort"
        aria-label={parent ? 'Sort parent pane by name' : 'Sort demo files by name'}
        aria-pressed={ascending}
        title="Toggle sort direction"
        onClick={onSort}
      >
        <DirectionIcon size={13} />
      </button>
      <details className="pane-sort-options" data-pane-action="options">
        <summary aria-label={`Sort options for ${label}`} title="Sort options">
          <Settings2 size={13} />
        </summary>
        <div className="pane-sort-popover">
          <span className="pane-sort-heading">SORT OPTIONS</span>
          <p>Sort by name</p>
          <button onClick={onSort}>
            {ascending ? 'Name: Z to A' : 'Name: A to Z'} <DirectionIcon size={13} />
          </button>
          <label>
            <input
              type="checkbox"
              checked={grouped}
              onChange={(event) => onGroupChange(event.target.checked)}
              aria-label={parent ? 'Group parent pane by type' : 'Group demo files by type'}
            />
            Group by file type
          </label>
        </div>
      </details>
      <button
        data-pane-action="filter"
        aria-label={parent ? 'Filter parent pane' : 'Filter demo folder'}
        aria-pressed={filtering}
        title="Filter this pane"
        onClick={onFilter}
      >
        <Funnel size={13} />
      </button>
    </div>
  );
}
