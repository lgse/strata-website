# Feature comparison

The website’s comparison is a public-source review dated **6 September 2026**, not a benchmark, hands-on compatibility certification, or security audit. The data and per-cell citations live in `src/lib/feature-comparison.ts`.

## Scope

- All seven applications are compared against the same explicit row definitions.
- Review targets are pinned development snapshots, not necessarily stable releases or the unidentified versions in the performance screenshots.
- Official handbooks, configuration schemas and implementation paths were checked. Companion components were examined when a feature crosses application boundaries.
- Built-in functionality can require normal runtime libraries, codecs or protocol backends. An add-on is a separately supplied extension/application, including one a distribution installs by default.
- “Partial” identifies different behavior or scope, not a performance penalty.
- “Not found” is limited to the reviewed built-in implementation. “Unverified” is insufficient evidence, not absence. Neither is a blanket claim about third-party extensions.
- No total score is calculated: these features have different purposes and cannot fairly be added into a winner count.

## Review targets

| Application | Public source revision                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Strata      | [7723db9](https://github.com/lgse/strata/tree/7723db99bd62004e286933903fa59f5956ed0875)        |
| Flea        | [6e9f9da](https://github.com/thisisgm/flea/tree/6e9f9dae1992ee5be03a17d154a45d1cbed3c136)      |
| Krusader    | [cdfb4ca](https://github.com/KDE/krusader/tree/cdfb4cacbbed75a641b65347f90ebb9727895e0f)       |
| Dolphin     | [8fe4b14](https://github.com/KDE/dolphin/tree/8fe4b14520937175f4fe038d9ef3a27e3e1e390a)        |
| Nautilus    | [1fa90f0](https://github.com/GNOME/nautilus/tree/1fa90f06d31ae2c3e582263357fb6ffee1433e7d)     |
| Nemo        | [c136845](https://github.com/linuxmint/nemo/tree/c136845de8cdbd29fd2ef886d870f96568fe2ede)     |
| Thunar      | [b1d2264](https://github.com/xfce-mirror/thunar/tree/b1d2264ccae761e6bd1384fb992c4ea3d4564c44) |

Dependency citations additionally pin GNOME Desktop, Cinnamon Desktop, Sushi, Nemo extensions and Ark. Xfce and GNOME user-help pages are live documentation and may change after the review.

## Important findings

- Flea shares Miller columns, ranked recursive fuzzy path search, rich Quick Look, direct Omarchy palette following and sandboxed thumbnailing. These are not all Strata-exclusive features.
- Strata documents mandatory fail-closed helpers for original native-parser preview inputs. Flea’s thumbnail sandbox is not the same scope as its Qt full-size image/PDF/media preview paths. GNOME and Cinnamon thumbnailer sandbox implementations also deserve explicit credit; their presence does not establish equivalent policy across all preview types.
- Krusader also has an in-app color editor and scheme import/export. Dolphin has an in-app scheme selector, a different capability from palette authoring.
- Strata’s reviewed source includes archive creation/extraction even though its README feature list does not enumerate it. Source review must not treat README omissions as proof of absence.
- Flea and the five established managers have folder tabs. Independent split panes are present in Krusader, Dolphin, Nemo and Thunar, not equivalent to Strata/Flea’s parent-child columns.
- Batch renaming is integrated in Dolphin, Nautilus and Thunar; Krusader integrates KRename and Nemo can invoke a configurable external renamer.
- Krusader, Dolphin, Nautilus and Nemo offer content search; Thunar can use Catfish. Strata and Flea’s reviewed search paths match names/paths instead.
- A missing RAW thumbnail in one installed benchmark fixture is not evidence that a manager universally lacks RAW support. The matrix deliberately does not repeat that inference.

## Updating

Recheck each affected definition, cell, note and citation before advancing a revision. Keep the review date and revision list synchronized with the published data. Preserve qualifications about scope, optional components, unavailable evidence and development-only functionality. Do not convert an unverified feature into “Not found” solely because a text search misses its name.

Run the build, lint, formatting checks and Playwright suite. Comparison tests cover all cells, source-link structure, keyboard dismissal/focus restoration, filtering, responsive scrolling and automated accessibility in light and dark palettes.
