// Public, source-backed capability review. These are development snapshots, not
// the unidentified application versions in the supplied performance screenshots.
export const comparisonReviewed = '2026-09-06';
export const comparisonProjects = [
  {
    id: 'strata',
    name: 'Strata',
    repo: 'lgse/strata',
    revision: '7723db99bd62004e286933903fa59f5956ed0875',
  },
  {
    id: 'flea',
    name: 'Flea',
    repo: 'thisisgm/flea',
    revision: '6e9f9dae1992ee5be03a17d154a45d1cbed3c136',
  },
  {
    id: 'krusader',
    name: 'Krusader',
    repo: 'KDE/krusader',
    revision: 'cdfb4cacbbed75a641b65347f90ebb9727895e0f',
  },
  {
    id: 'dolphin',
    name: 'Dolphin',
    repo: 'KDE/dolphin',
    revision: '8fe4b14520937175f4fe038d9ef3a27e3e1e390a',
  },
  {
    id: 'nautilus',
    name: 'Nautilus',
    repo: 'GNOME/nautilus',
    revision: '1fa90f06d31ae2c3e582263357fb6ffee1433e7d',
  },
  {
    id: 'nemo',
    name: 'Nemo',
    repo: 'linuxmint/nemo',
    revision: 'c136845de8cdbd29fd2ef886d870f96568fe2ede',
  },
  {
    id: 'thunar',
    name: 'Thunar',
    repo: 'xfce-mirror/thunar',
    revision: 'b1d2264ccae761e6bd1384fb992c4ea3d4564c44',
  },
] as const;
export type ComparisonApp = (typeof comparisonProjects)[number]['id'];
export type FeatureStatus = 'built-in' | 'addon' | 'partial' | 'not-found' | 'unverified';
export const featureStatuses: Record<FeatureStatus, { label: string; definition: string }> = {
  'built-in': {
    label: 'Built in',
    definition:
      'Integrated in the app. Runtime libraries, codecs or protocol backends may still be required.',
  },
  addon: {
    label: 'Add-on',
    definition:
      'Provided through a separate extension or application, sometimes preinstalled by the distribution.',
  },
  partial: {
    label: 'Partial',
    definition:
      'Related functionality exists, but its behavior or scope differs from the row’s definition.',
  },
  'not-found': {
    label: 'Not found',
    definition:
      'No matching built-in feature found in the reviewed docs and implementation. Not a claim about every possible extension.',
  },
  unverified: {
    label: 'Unverified',
    definition: 'The reviewed sources do not establish this capability. This is not a “no”.',
  },
};
export const featureCategories = [
  'All features',
  'Navigation',
  'Previews & appearance',
  'File workflows',
] as const;
export type FeatureCategory = (typeof featureCategories)[number];
export type FeatureSource = { label: string; url: string };
export type FeatureCell = {
  status: FeatureStatus;
  label?: string;
  note: string;
  sources: FeatureSource[];
};
export type ComparisonFeature = {
  id: string;
  title: string;
  definition: string;
  category: Exclude<FeatureCategory, 'All features'>;
  cells: Record<ComparisonApp, FeatureCell>;
};
function source(app: ComparisonApp, path: string, label: string): FeatureSource {
  const project = comparisonProjects.find(({ id }) => id === app)!;
  return { label, url: `https://github.com/${project.repo}/blob/${project.revision}/${path}` };
}
function dependency(repo: string, revision: string, path: string, label: string): FeatureSource {
  return { label, url: `https://github.com/${repo}/blob/${revision}/${path}` };
}
function cell(
  status: FeatureStatus,
  note: string,
  sources: FeatureSource[],
  label?: string,
): FeatureCell {
  return { status, note, sources, ...(label ? { label } : {}) };
}
const strataReadme = source('strata', 'README.md', 'Strata: features and architecture');
const strataModes = source('strata', 'src/ui/browser_modes.rs', 'Strata: browser modes');
const fleaReadme = source('flea', 'README.md', 'Flea: features, settings and keyboard');
const fleaProtocol = source('flea', 'docs/protocol.md', 'Flea: search and operations protocol');
const krusaderFeatures = source(
  'krusader',
  'doc/handbook/features.docbook',
  'Krusader handbook: features',
);
const krusaderViews = source(
  'krusader',
  'doc/handbook/user-interface.docbook',
  'Krusader handbook: panels and views',
);
const dolphinHandbook = source('dolphin', 'doc/index.docbook', 'Dolphin handbook');
const nautilusSchema = source(
  'nautilus',
  'data/org.gnome.nautilus.gschema.xml',
  'Nautilus: view and search preferences',
);
const nemoPrefs = source(
  'nemo',
  'src/nemo-file-management-properties.c',
  'Nemo: preferences implementation',
);
const nemoWindow = source('nemo', 'src/nemo-window-menus.c', 'Nemo: window actions and views');
const thunarWindow = source(
  'thunar',
  'thunar/thunar-window.c',
  'Thunar: views, tabs and image preview',
);
const thunarDocs = {
  label: 'Xfce: Thunar documentation',
  url: 'https://docs.xfce.org/xfce/thunar/start',
};
const extensionsRevision = 'df7bd140bf7fb96d57e097ad56d07be4d7ab12bd';
const nemoExtension = (path: string, label: string) =>
  dependency('linuxmint/nemo-extensions', extensionsRevision, path, label);

export const comparisonFeatures: ComparisonFeature[] = [
  {
    id: 'miller',
    title: 'Miller columns',
    category: 'Navigation',
    definition:
      'Adjacent columns show successive levels of a folder hierarchy. A tree sidebar or a multi-column file list is not the same view.',
    cells: {
      strata: cell('built-in', 'Navigable Columns sit alongside Icons and List modes.', [
        strataReadme,
        strataModes,
      ]),
      flea: cell(
        'built-in',
        'Flea also ships a Miller-column board, alongside list and grid views. This is a shared strength, not a Strata exclusive.',
        [fleaReadme],
      ),
      krusader: cell(
        'not-found',
        'The documented file-panel modes are Detailed and Brief. Brief columns list one directory, rather than successive parent/child folders.',
        [krusaderViews],
      ),
      dolphin: cell(
        'not-found',
        'The handbook lists Icons, Compact and Details, plus a folder tree and split view; no Miller-column mode was found.',
        [dolphinHandbook],
      ),
      nautilus: cell(
        'not-found',
        'The reviewed view schema offers list and icon views, not Miller columns.',
        [nautilusSchema],
      ),
      nemo: cell(
        'not-found',
        'Icon, list and compact views are registered in the window actions; no Miller-column mode was found.',
        [nemoWindow],
      ),
      thunar: cell(
        'not-found',
        'Icon, detailed-list and compact views, a tree sidebar and split view are present; no Miller-column mode was found.',
        [thunarWindow],
      ),
    },
  },
  {
    id: 'fuzzy',
    title: 'Recursive fuzzy search',
    category: 'Navigation',
    definition:
      'Ranked subsequence matching across filenames and paths below a directory. Substring, wildcard and full-text search are different capabilities.',
    cells: {
      strata: cell(
        'built-in',
        'Indexes filenames and relative paths in the background and publishes the best 100 fuzzy-ranked matches progressively. It does not search file contents.',
        [strataReadme],
      ),
      flea: cell(
        'built-in',
        'Its recursive search matches case-insensitive subsequences across relative paths. Matches stream during the walk and are ranked when the walk finishes.',
        [fleaProtocol],
      ),
      krusader: cell(
        'partial',
        'KruSearcher supports recursive filename filters, wildcards and content search. Ranked path-subsequence search was not established.',
        [source('krusader', 'doc/handbook/search.docbook', 'Krusader: search filters')],
        'Patterns',
      ),
      dolphin: cell(
        'partial',
        'Recursive filename and content search supports wildcards and Baloo/KIO backends. This is not documented as ranked path-subsequence matching.',
        [dolphinHandbook],
        'Patterns',
      ),
      nautilus: cell(
        'partial',
        'The query implementation matches substrings and ranks their position. That is not the same as non-contiguous path-subsequence matching.',
        [source('nautilus', 'src/nautilus-query.c', 'Nautilus: query matching')],
        'Substring',
      ),
      nemo: cell(
        'partial',
        'The advanced search engine uses filename patterns and content matching, rather than the ranked path-subsequence model defined here.',
        [source('nemo', 'libnemo-private/nemo-search-engine-advanced.c', 'Nemo: search engine')],
        'Patterns',
      ),
      thunar: cell(
        'partial',
        'Thunar has recursive search. Its matching helper explicitly uses substring matching for all search terms, not fuzzy subsequences.',
        [
          source('thunar', 'thunar/thunar-util.c', 'Thunar: search-term matching'),
          {
            label: 'Xfce: recursive search',
            url: 'https://docs.xfce.org/xfce/thunar/the-file-manager-window#search',
          },
        ],
        'Substring',
      ),
    },
  },
  {
    id: 'palette',
    title: 'In-app palette editor',
    category: 'Previews & appearance',
    definition:
      'Edit and save application colors from inside the file manager, not just choose a desktop theme or edit CSS externally.',
    cells: {
      strata: cell(
        'built-in',
        'The Add a theme UI edits semantic colors with a live preview and saves shareable TOML palettes.',
        [source('strata', 'docs/themes.md', 'Strata: custom themes'), strataReadme],
      ),
      flea: cell(
        'not-found',
        'The documented settings cover text size, context menus and key presets. Appearance follows Omarchy; no application palette editor was found.',
        [fleaReadme],
      ),
      krusader: cell(
        'built-in',
        'Konfigurator exposes panel colors, color-scheme import/export and saved schemes. Strata is not the only app with color editing.',
        [source('krusader', 'doc/handbook/konfigurator.docbook', 'Krusader: Colors configuration')],
      ),
      dolphin: cell(
        'partial',
        'A Window Color Scheme menu selects installed schemes. Editing palette colors is a separate KDE configuration workflow, not this in-app selector.',
        [source('dolphin', 'src/dolphinmainwindow.cpp', 'Dolphin: Window Color Scheme menu')],
        'Selector',
      ),
      nautilus: cell(
        'not-found',
        'No app-specific palette authoring UI was found in the preferences implementation. Desktop appearance is a separate capability.',
        [source('nautilus', 'src/nautilus-preferences-dialog.c', 'Nautilus: preferences dialog')],
      ),
      nemo: cell(
        'not-found',
        'No application palette editor was found in Nemo’s preferences. Cinnamon/GTK theme customization is outside this row’s scope.',
        [nemoPrefs],
      ),
      thunar: cell(
        'not-found',
        'No application palette editor was found in the preferences dialog. GTK theme and CSS customization are separate workflows.',
        [source('thunar', 'thunar/thunar-preferences-dialog.c', 'Thunar: preferences dialog')],
      ),
    },
  },
  {
    id: 'omarchy',
    title: 'Live Omarchy palette',
    category: 'Previews & appearance',
    definition:
      'A direct integration reads and follows Omarchy’s current palette. Indirect changes through GTK or KDE desktop themes do not count as this integration.',
    cells: {
      strata: cell(
        'built-in',
        'Opt-in Follow Omarchy reads and monitors the Quattro palette. Legacy Omarchy theme layouts are not supported.',
        [source('strata', 'docs/themes.md', 'Strata: Omarchy Quattro integration')],
        'Quattro',
      ),
      flea: cell(
        'built-in',
        'Flea reads the live Omarchy palette and shell tokens. This is another feature shared with Strata.',
        [fleaReadme],
      ),
      krusader: cell(
        'not-found',
        'Krusader documents KDE colors and its own color profiles; a direct Omarchy palette integration was not found.',
        [
          krusaderFeatures,
          source('krusader', 'doc/handbook/konfigurator.docbook', 'Krusader: color settings'),
        ],
      ),
      dolphin: cell(
        'not-found',
        'The reviewed appearance path uses KDE color schemes. No direct Omarchy palette reader was found; system theme integration can still affect its appearance.',
        [source('dolphin', 'src/dolphinmainwindow.cpp', 'Dolphin: color scheme integration')],
      ),
      nautilus: cell(
        'not-found',
        'No direct Omarchy palette integration was found in the reviewed application/preferences code. This does not rule out desktop-level theming.',
        [
          source('nautilus', 'src/nautilus-application.c', 'Nautilus: application setup'),
          nautilusSchema,
        ],
      ),
      nemo: cell(
        'not-found',
        'Nemo belongs to the Cinnamon desktop. A direct Omarchy palette reader was not found; GTK/desktop themes are a separate route.',
        [source('nemo', 'README.md', 'Nemo: desktop integration'), nemoPrefs],
      ),
      thunar: cell(
        'not-found',
        'The reviewed Xfce application and preferences do not establish a direct Omarchy palette integration. GTK theming remains possible.',
        [thunarDocs, source('thunar', 'thunar/thunar-application.c', 'Thunar: application setup')],
      ),
    },
  },
  {
    id: 'isolation',
    title: 'Isolated native previews',
    category: 'Previews & appearance',
    definition:
      'Mandatory, fail-closed per-file isolation for native parsers of original image, RAW, PDF and media inputs. An out-of-process service alone is not a sandbox. This is an architecture review, not a security audit.',
    cells: {
      strata: cell(
        'built-in',
        'Original native-parser inputs go through mandatory Bubblewrap helpers with restricted filesystem access, no network and resource limits. Missing isolation fails closed. Bounded text stays in-process; normalized outputs are consumed by the UI, and accelerated media may receive GPU access.',
        [source('strata', 'docs/preview-sandbox.md', 'Strata: preview isolation policy')],
        'Required',
      ),
      flea: cell(
        'partial',
        'Thumbnailing is mandatory-sandboxed, as are several backend helpers. Full-size image, PDF and media previews load the original paths into Qt UI components, so the scope differs from Strata’s per-file preview-helper policy.',
        [
          fleaReadme,
          source('flea', 'ui/PreviewImage.qml', 'Flea: full-size image loading'),
          source('flea', 'ui/PreviewMedia.qml', 'Flea: media loading'),
          source('flea', 'ui/PreviewPdf.qml', 'Flea: original PDF loading'),
        ],
        'Scoped',
      ),
      krusader: cell(
        'unverified',
        'The handbook establishes KParts-based viewing and preview panels, but not an equivalent mandatory per-file parser sandbox. Do not read this as evidence that no component has isolation.',
        [krusaderFeatures, krusaderViews],
      ),
      dolphin: cell(
        'unverified',
        'Previews use the KDE preview infrastructure. The reviewed application sources do not establish the end-to-end mandatory policy defined in this row; provider and packaging details require a separate audit.',
        [
          dolphinHandbook,
          source(
            'dolphin',
            'src/panels/information/informationpanelcontent.cpp',
            'Dolphin: preview implementation',
          ),
        ],
      ),
      nautilus: cell(
        'partial',
        'GNOME Desktop implements thumbnailer sandboxing with build/runtime-dependent Bubblewrap or Flatpak paths. Rich Quick Look is a separate previewer service. This does not establish the same mandatory policy across every original preview input.',
        [
          source('nautilus', 'src/nautilus-thumbnails.c', 'Nautilus: thumbnail factory'),
          dependency(
            'GNOME/gnome-desktop',
            '735551288270e14fbc89ae690844cf5e3118346a',
            'libgnome-desktop/gnome-desktop-thumbnail-script.c',
            'GNOME Desktop: thumbnail sandbox paths',
          ),
          source('nautilus', 'src/nautilus-previewer.c', 'Nautilus: separate preview service'),
        ],
        'Scoped',
      ),
      nemo: cell(
        'partial',
        'Cinnamon Desktop has Bubblewrap thumbnailer support, but the reviewed implementation can run without that sandbox when unavailable. Nemo Preview is a separate service. This is not Strata’s mandatory per-file preview policy.',
        [
          source('nemo', 'libnemo-private/nemo-thumbnails.c', 'Nemo: thumbnail factory'),
          dependency(
            'linuxmint/cinnamon-desktop',
            '8bc14f9a51823db863d95b08948c9221adf4d3e1',
            'libcinnamon-desktop/gnome-desktop-thumbnail-script.c',
            'Cinnamon Desktop: optional thumbnail sandbox',
          ),
          nemoExtension('nemo-preview/README', 'Nemo Preview: service architecture'),
        ],
        'Scoped',
      ),
      thunar: cell(
        'unverified',
        'Thunar delegates thumbnails to Tumbler and has an image preview pane. A thumbnail service being separate does not establish the mandatory per-file sandbox defined here; that guarantee was not verified.',
        [
          thunarDocs,
          thunarWindow,
          { label: 'Xfce: Tumbler providers', url: 'https://docs.xfce.org/xfce/tumbler/start' },
        ],
      ),
    },
  },
  {
    id: 'preview',
    title: 'Rich file preview',
    category: 'Previews & appearance',
    definition:
      'View images and document pages or play media from a file-manager preview, rather than just show a thumbnail or launch the default full application.',
    cells: {
      strata: cell(
        'built-in',
        'Image/RAW, PDF pages, bounded text/code, audio and video previews are integrated. Video is a bounded preview, not full-length playback: the documented pipeline limits it to the first 30 seconds.',
        [strataReadme, source('strata', 'docs/preview-sandbox.md', 'Strata: preview limits')],
      ),
      flea: cell(
        'built-in',
        'Space opens Quick Look; its preview column handles images, text, paged PDFs and in-place audio/video. Archive contents are also previewed.',
        [fleaReadme],
      ),
      krusader: cell(
        'built-in',
        'The internal viewer and preview panel use installed KParts providers for supported formats. Actual document/media coverage depends on those components.',
        [krusaderFeatures, krusaderViews],
        'KParts',
      ),
      dolphin: cell(
        'partial',
        'The Information panel offers a large preview and media support. That is not the same as an integrated multipage document viewer for every preview format.',
        [
          dolphinHandbook,
          source(
            'dolphin',
            'src/panels/information/informationpanelcontent.cpp',
            'Dolphin: information panel preview',
          ),
        ],
        'Info panel',
      ),
      nautilus: cell(
        'addon',
        'Space-bar Quick Look is integrated through the separate Sushi/NautilusPreviewer service, often installed as part of GNOME. It is not absent merely because it is a companion component.',
        [
          source('nautilus', 'src/nautilus-previewer.c', 'Nautilus: preview service integration'),
          dependency(
            'GNOME/sushi',
            '1cb0d8d5ea5c485e3f5cf23d2716e4ee50847999',
            'README.md',
            'Sushi: Nautilus preview service',
          ),
          {
            label: 'GNOME: preview files',
            url: 'https://help.gnome.org/gnome-help/files-preview.html',
          },
        ],
        'Sushi',
      ),
      nemo: cell(
        'addon',
        'The nemo-preview package supplies the D-Bus-activated Quick Look service used by Nemo.',
        [nemoExtension('nemo-preview/README', 'Nemo Preview: integration')],
        'nemo-preview',
      ),
      thunar: cell(
        'partial',
        'Thunar has an image-preview pane. The reviewed core does not establish integrated paged PDF and audio/video playback equivalent to this row.',
        [thunarWindow],
        'Images',
      ),
    },
  },
  {
    id: 'network',
    title: 'Network locations',
    category: 'File workflows',
    definition:
      'Browse remote shares or servers through an integrated connection workflow. Protocol availability and authentication depend on installed backends and the server.',
    cells: {
      strata: cell(
        'built-in',
        'GIO/GVfs locations include authenticated SMB; the relevant GVfs protocol backends must be installed.',
        [strataReadme],
        'GIO / GVfs',
      ),
      flea: cell(
        'built-in',
        'Network mounts are integrated in the rail through gio, with GVfs backends for protocols such as SMB and SFTP.',
        [fleaReadme],
        'GIO / GVfs',
      ),
      krusader: cell(
        'built-in',
        'Remote connections include FTP, Samba and SFTP/SCP via KDE KIO workers.',
        [
          krusaderFeatures,
          source(
            'krusader',
            'doc/handbook/remote-connections.docbook',
            'Krusader: remote connections',
          ),
        ],
        'KIO',
      ),
      dolphin: cell(
        'built-in',
        'Dolphin integrates remote locations using KDE’s KIO infrastructure and network places.',
        [dolphinHandbook, source('dolphin', 'README.md', 'Dolphin: network locations')],
        'KIO',
      ),
      nautilus: cell(
        'built-in',
        'Files provides Connect to Server, including supported SSH, Windows shares, FTP and WebDAV connections through the desktop backends.',
        [
          {
            label: 'GNOME: connect to a server',
            url: 'https://help.gnome.org/gnome-help/nautilus-connect.html',
          },
        ],
        'GIO / GVfs',
      ),
      nemo: cell(
        'built-in',
        'Nemo documents SSH, FTP and GIO/GVfs integration. Protocol support depends on installed backends.',
        [source('nemo', 'README.md', 'Nemo: network support')],
        'GIO / GVfs',
      ),
      thunar: cell(
        'built-in',
        'The Network sidebar and location entry browse remote servers. GVfs is a separate runtime requirement for remote filesystems.',
        [
          thunarDocs,
          {
            label: 'Xfce: Network sidebar',
            url: 'https://docs.xfce.org/xfce/thunar/the-file-manager-window#side_pane',
          },
        ],
        'GIO / GVfs',
      ),
    },
  },
  {
    id: 'tabs',
    title: 'Folder tabs',
    category: 'Navigation',
    definition:
      'Keep independent folder locations in switchable tabs inside one window. Miller columns are not tabs.',
    cells: {
      strata: cell(
        'not-found',
        'The reviewed window hosts a browser with Columns, Icons and List. A directory-tab interface was not found in this snapshot.',
        [source('strata', 'src/ui/window.rs', 'Strata: window implementation'), strataModes],
      ),
      flea: cell(
        'built-in',
        'Open, close and switch up to nine directory tabs. Only the active listing is live.',
        [fleaReadme],
      ),
      krusader: cell('built-in', 'Tabbed panels include locked and pinned tabs.', [
        krusaderFeatures,
      ]),
      dolphin: cell(
        'built-in',
        'Supports multiple tabs, restoration of previous folders/tabs and reopening recently closed tabs.',
        [dolphinHandbook],
      ),
      nautilus: cell('built-in', 'The window uses an AdwTabView for folder slots.', [
        source('nautilus', 'src/nautilus-window.c', 'Nautilus: folder tabs'),
      ]),
      nemo: cell('built-in', 'New Tab and tab-navigation actions are part of the window.', [
        nemoWindow,
      ]),
      thunar: cell('built-in', 'Folder tabs are integrated, including within split views.', [
        thunarWindow,
      ]),
    },
  },
  {
    id: 'split',
    title: 'Independent split panes',
    category: 'Navigation',
    definition:
      'Browse two unrelated locations side by side, each with its own navigation. Parent/child Miller columns do not count as independent split panes.',
    cells: {
      strata: cell(
        'not-found',
        'Strata’s multi-column browser keeps successive locations in the same hierarchy. An independent two-location split mode was not found.',
        [strataReadme, strataModes],
      ),
      flea: cell(
        'not-found',
        'Flea has tabs and parent/child column peeks, but its README specifies one live listing and no independent split-pane mode.',
        [fleaReadme],
      ),
      krusader: cell(
        'built-in',
        'Two independent Orthodox File Manager panels are its core layout.',
        [krusaderFeatures],
      ),
      dolphin: cell(
        'built-in',
        'Split displays different folders in two independently navigable views.',
        [dolphinHandbook],
      ),
      nautilus: cell(
        'not-found',
        'The reviewed window switches between tab slots; an independent simultaneous split-view mode was not found.',
        [source('nautilus', 'src/nautilus-window.c', 'Nautilus: window layout')],
      ),
      nemo: cell('built-in', 'Extra Pane and split-view actions support independent locations.', [
        nemoWindow,
        source('nemo', 'src/nemo-window.c', 'Nemo: split-pane implementation'),
      ]),
      thunar: cell(
        'built-in',
        'Split view is implemented with independently navigable notebooks.',
        [thunarWindow],
      ),
    },
  },
  {
    id: 'bulk',
    title: 'Batch renaming',
    category: 'File workflows',
    definition:
      'Rename a selection of files using one pattern or transformation workflow, not repeated single-file edits.',
    cells: {
      strata: cell(
        'not-found',
        'The reviewed rename flow edits one selected item. No batch transformation UI was found.',
        [
          source('strata', 'src/ui/browser/inline_edit.rs', 'Strata: rename implementation'),
          source(
            'strata',
            'src/ui/browser/context_menu.rs',
            'Strata: single and multiple-selection actions',
          ),
        ],
      ),
      flea: cell(
        'not-found',
        'The rename protocol and UI operate on one path and one new name. No batch renamer was found in the reviewed interface.',
        [fleaProtocol, fleaReadme],
      ),
      krusader: cell(
        'addon',
        'Multi-rename integrates the separate KRename application.',
        [krusaderFeatures],
        'KRename',
      ),
      dolphin: cell(
        'built-in',
        'Selecting multiple files and pressing F2 opens its batch-rename dialog.',
        [dolphinHandbook],
      ),
      nautilus: cell(
        'built-in',
        'Includes a batch-rename dialog with formatting and find/replace modes.',
        [source('nautilus', 'src/nautilus-batch-rename-dialog.c', 'Nautilus: batch rename')],
      ),
      nemo: cell(
        'addon',
        'Invokes a configurable external bulk-rename utility for multiple files.',
        [source('nemo', 'src/nemo-view.c', 'Nemo: external bulk-rename integration')],
        'External tool',
      ),
      thunar: cell(
        'built-in',
        'Ships a Bulk Renamer dialog and bundled renaming providers. The plugin architecture does not mean the standard renamer is missing.',
        [
          source('thunar', 'thunar/thunar-renamer-dialog.c', 'Thunar: bulk rename'),
          {
            label: 'Xfce: Bulk Renamer',
            url: 'https://docs.xfce.org/xfce/thunar/bulk-renamer/start',
          },
        ],
      ),
    },
  },
  {
    id: 'contents',
    title: 'File-content search',
    category: 'File workflows',
    definition:
      'Search text inside files from the file manager’s search workflow. Matching filenames or previewing a document is not content search.',
    cells: {
      strata: cell(
        'not-found',
        'Strata explicitly documents filename/path search rather than file-content or metadata search.',
        [strataReadme],
      ),
      flea: cell(
        'not-found',
        'The documented search walks and matches relative paths. It does not describe reading file contents for search.',
        [fleaProtocol],
      ),
      krusader: cell(
        'built-in',
        'KruSearcher supports content searches, including remote filesystems and archives subject to the documented filters and backends.',
        [
          krusaderFeatures,
          source('krusader', 'doc/handbook/search.docbook', 'Krusader: content search'),
        ],
      ),
      dolphin: cell(
        'built-in',
        'Offers filename and file-content search using Baloo or the fallback KIO search worker. Indexed scope and supported formats vary.',
        [dolphinHandbook],
      ),
      nautilus: cell(
        'built-in',
        'Search can include full text. Results depend on the desktop search/indexing service and indexed content.',
        [
          nautilusSchema,
          {
            label: 'GNOME: full-text search',
            url: 'https://help.gnome.org/gnome-help/files-search.html',
          },
        ],
      ),
      nemo: cell(
        'built-in',
        'Includes content search, with text-extraction helpers expanding supported formats. Helper content search accepts local paths rather than arbitrary URIs.',
        [source('nemo', 'search-helpers/README.md', 'Nemo: content-search helpers')],
      ),
      thunar: cell(
        'addon',
        'Core recursive search matches names. The documented Search for Files action can launch Catfish; content searching is available through that companion workflow.',
        [
          {
            label: 'Xfce: file actions and Catfish integration',
            url: 'https://docs.xfce.org/xfce/thunar/working-with-files-and-folders',
          },
          {
            label: 'Xfce: Catfish content search',
            url: 'https://docs.xfce.org/apps/catfish/usage',
          },
        ],
        'Catfish',
      ),
    },
  },
  {
    id: 'archives',
    title: 'Create / extract archives',
    category: 'File workflows',
    definition:
      'Create archives from a selection and extract their contents through the file manager. This does not imply in-place archive editing or equal format coverage.',
    cells: {
      strata: cell(
        'built-in',
        'The reviewed source includes compression and extraction dialogs with format, destination and password handling where supported. This source feature may be newer than the benchmark build.',
        [
          source('strata', 'src/ui/browser/archive.rs', 'Strata: archive dialogs'),
          source('strata', 'src/services/operations.rs', 'Strata: archive formats and operations'),
        ],
      ),
      flea: cell(
        'built-in',
        'Compress and extract are integrated operations using external archive helpers such as bsdtar and 7z. Those runtime tools must be installed.',
        [fleaReadme, fleaProtocol],
      ),
      krusader: cell(
        'built-in',
        'Integrated archive browsing, packing, unpacking and testing use supported archive handlers/tools.',
        [krusaderFeatures],
      ),
      dolphin: cell(
        'addon',
        'Archive-as-folder browsing is separate from creation/extraction. The latter is supplied by Ark’s file-manager integration.',
        [
          dolphinHandbook,
          dependency(
            'KDE/ark',
            'af98e99aa360d6e97c3f17c5585e031af650680f',
            'app/compressfileitemaction.cpp',
            'Ark: Dolphin compression actions',
          ),
          { label: 'KDE: Ark', url: 'https://apps.kde.org/ark/' },
        ],
        'Ark',
      ),
      nautilus: cell(
        'built-in',
        'Compression and extraction run through integrated gnome-autoar operations.',
        [source('nautilus', 'src/nautilus-file-operations.c', 'Nautilus: archive operations')],
      ),
      nemo: cell(
        'addon',
        'nemo-fileroller adds compression and extraction actions backed by File Roller.',
        [nemoExtension('nemo-fileroller/README', 'Nemo: File Roller extension')],
        'File Roller',
      ),
      thunar: cell(
        'addon',
        'thunar-archive-plugin adds create/extract actions and invokes an installed archive manager such as Xarchiver, File Roller, Ark or Engrampa.',
        [
          {
            label: 'Xfce: Thunar Archive Plugin',
            url: 'https://docs.xfce.org/xfce/thunar/archive',
          },
        ],
        'Archive plugin',
      ),
    },
  },
  {
    id: 'terminal',
    title: 'Embedded terminal',
    category: 'File workflows',
    definition:
      'A terminal pane inside the file-manager window. “Open terminal here” launching another window does not meet this definition.',
    cells: {
      strata: cell(
        'not-found',
        'Open Terminal launches a separate terminal application at the selected location; no embedded terminal pane was found.',
        [source('strata', 'src/ui/browser/desktop.rs', 'Strata: terminal launcher')],
      ),
      flea: cell(
        'not-found',
        'Ctrl+T and the toolbar button call xdg-terminal-exec for a separate terminal. The unfinished TUI is not an embedded terminal.',
        [fleaReadme],
      ),
      krusader: cell(
        'built-in',
        'Offers an optional terminal-emulator panel below the file panels, using the relevant installed KDE component.',
        [krusaderFeatures, krusaderViews],
      ),
      dolphin: cell(
        'built-in',
        'The terminal panel follows local-folder navigation in both directions and uses the installed Konsole component.',
        [dolphinHandbook],
      ),
      nautilus: cell(
        'not-found',
        'No embedded terminal was found in the reviewed core window. This is not a claim that every third-party terminal extension is unavailable or compatible.',
        [source('nautilus', 'src/nautilus-window.c', 'Nautilus: window implementation')],
      ),
      nemo: cell(
        'addon',
        'nemo-terminal embeds a VTE terminal pane that follows folder navigation.',
        [nemoExtension('nemo-terminal/README', 'Nemo Terminal: embedded pane')],
        'nemo-terminal',
      ),
      thunar: cell(
        'not-found',
        'Core window actions launch a separate terminal rather than embedding one. User-defined external commands are outside this row.',
        [
          thunarWindow,
          {
            label: 'Xfce: custom actions',
            url: 'https://docs.xfce.org/xfce/thunar/custom-actions',
          },
        ],
      ),
    },
  },
];
