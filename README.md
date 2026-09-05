# Strata website

A Tokyo Night–first, fully themeable landing page for [Strata](https://github.com/lgse/strata). Built with **Next.js 16.3.4**, React 19, TypeScript, and CSS. No UI framework, animation library, remote font requests, analytics, or separate backend service required.

## Run locally

Requires Node.js 20.9+ (tested with Node 24).

```bash
npm ci
npm run dev
```

Open **http://localhost:3000**.

```bash
npm run build       # statically prerender the site and social image
npm start           # serve the production build
npm run lint
npm run typecheck
npm run format:check
npm test            # production-build Playwright suite; run build first
```

Tests use `/usr/bin/chromium` when available. Otherwise run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an existing browser. The test server uses port 3100 and does not interfere with the dev server.

## The experience

- Animated folder layers, soft moving light, gradient headline, and scroll reveals.
- Functional web explorer illustration: Miller column, Grid, Column, folder switching, file selection, previews, keyboard movement, filtering, sorting, type grouping, and hover peeks.
- Fuzzy filename/path search playground and five preview-format illustrations.
- **10 curated theme favorites** in the site picker, with searchable dark/light filters. The full 95-theme app catalog remains available as source data and for existing saved preferences.
- Site-wide theme changes, local persistence, cross-tab synchronization, and a pre-paint theme bootstrap. Storage failures gracefully fall back to session-only selection.
- The README’s **interactive installer on the splash**, with one-click copying and a review-script link; also available in the download section.
- Native-style demo toolbar, fictional pinned folders/devices, navigation history, a view-options menu, and a Column table with permissions and modified dates. The Settings cog is a labeled, disabled desktop-app placeholder, not a menu.
- Compact whole-tree search dialog with keyboard selection, folder/file opening, Escape dismissal, and focus restoration. Pane filters remain independent.
- Accurate features, documented performance numbers, Linux installation, FAQs, and GitHub links.
- Responsive layouts, reduced-motion support, native accessible theme dialogs, keyboard operation, local fonts, and a generated social sharing image.

The explorer and media visuals are **web illustrations**, not the running GTK application. No local files are accessed, uploaded, parsed, or executed. The video/audio illustrations do not play media. See [media brief](docs/MEDIA_BRIEF.md) for suggested real-app captures.

## GitHub stars

The header's star badge loads asynchronously from `/api/github-stars`, keeping the landing page prerendered and independent of GitHub availability. The endpoint fetches the public `lgse/strata` repository server-side with a four-second timeout and a one-hour Next.js data cache. Successful responses are also CDN-cacheable; errors are not cached by the endpoint. No token is required, and visitors never contact GitHub directly.

Counts use compact notation with the exact count in the link's accessible label and tooltip. While loading or unavailable, the badge remains a useful **Star** link rather than inventing a number. A fixed-width metric group prevents layout shift while keeping the star and number a consistent 6 px apart. Implementation: `src/components/github-stars.tsx`, `src/app/api/github-stars/route.ts`; coverage: `tests/github-stars.spec.ts`.

## Theme maintenance

The website checks in its catalog snapshot, so it builds independently of the Strata repository. Refresh it when the app changes:

```bash
npm run themes:sync
# Or supply another checkout:
npm run themes:sync -- /path/to/strata/data/themes/catalog.toml
```

The importer validates all nine semantic color tokens and refuses invalid or duplicate entries. Product theme counts automatically reflect the new catalog. The site picker intentionally stays limited to the ten IDs in `siteThemeIds` (`src/lib/themes.ts`); edit that list to change the shortlist. Original palette colors are preserved; the website derives accessible foregrounds, surface blends, and accents in `src/lib/themes.ts` and `src/app/globals.css`.

The six gallery palettes are selected in `src/components/theme-gallery.tsx`, all drawn from the ten picker favorites. The shortlist is editorial, not a measured popularity ranking. The default is `tokyo-night` in `src/lib/themes.ts` and the server-rendered layout.

## Editing guide

| Area                                                 | Files                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| Marketing copy, feature list, FAQs                   | `src/app/page.tsx`                                                    |
| Design, responsive layouts, animation                | `src/app/globals.css`                                                 |
| Palette data, derived variables, pre-paint bootstrap | `src/lib/themes.json`, `src/lib/themes.ts`                            |
| Persistence and cross-tab changes                    | `src/components/theme-provider.tsx`                                   |
| Theme dialog and gallery                             | `src/components/theme-picker.tsx`, `src/components/theme-gallery.tsx` |
| Interactive explorer                                 | `src/components/explorer-demo.tsx`                                    |
| Search and preview illustrations                     | `src/components/keyboard-demo.tsx`, `src/components/preview-demo.tsx` |
| Install command / clipboard feedback                 | `src/components/install-command.tsx`                                  |
| Logo and original landscape illustration             | `public/brand/strata.svg`, `public/art/night-drive.svg`               |
| Social image and metadata                            | `src/app/opengraph-image.tsx`, `src/app/layout.tsx`                   |
| Browser checks                                       | `tests/website.spec.ts`, `playwright.config.ts`                       |

Native demo chrome is isolated in `src/components/demo-chrome.tsx` and `src/components/explorer-demo.css`. Both Miller columns use `src/components/pane-actions.tsx` for the same refresh → sort direction → sort options → filter controls; parent-pane behavior lives in `src/components/miller-parent-pane.tsx`. Mode names and fictional file fixtures live in `src/lib/demo-data.ts`; toolbar search lives in `src/components/demo-search.tsx` and its CSS. Each pane filters and sorts independently. Both simplify to the same sort-options/filter pair on phones. It follows the supplied app screenshot without publishing the user's personal folder listing.

Review [the source audit](docs/FEATURE_AUDIT.md) before changing product claims. This source checkout does not yet substantiate several features in the initial brief.

## Deployment

### Vercel

1. Import **`lgse/strata-website`** into Vercel and use the **Next.js** framework preset.
2. Keep the root directory at the repository root, the build command at `npm run build`, and the default output directory. Node **24.x** is declared in `package.json`; the committed npm lockfile pins dependencies.
3. Use `main` as the production branch. Vercel will build preview deployments for pull requests and production deployments for pushes to `main` after the Git integration is connected.
4. No environment variables or GitHub token are required. The metadata origin automatically uses `VERCEL_PROJECT_PRODUCTION_URL`. When attaching a custom domain, set `NEXT_PUBLIC_SITE_URL` to its full HTTPS origin and redeploy. **Do not copy the example's localhost URL into Vercel.**
5. Verify `/opengraph-image`, `/api/github-stars`, download links, and mobile navigation on the deployed origin.

No `vercel.json`, custom server, or static export is needed. Vercel handles the prerendered landing page and the server-side GitHub stars route; keep the standard Next.js deployment rather than `output: 'export'`. Local Vercel project metadata is ignored by Git.

### Other Node hosts

Use Node 24, install with `npm ci`, set `NEXT_PUBLIC_SITE_URL` to the final public origin, then run `npm run build` and `npm start`. Local development defaults to `http://localhost:3000`.

No custom domain has been assumed. No app versions, binary sizes, download counts, or universal performance claims are invented. Download buttons point to the canonical latest release; the install command is copied, never executed by the website.

## Credits

Strata branding is sourced from the Strata repository. Theme palettes derive from Strata / Tinted Theming; the MIT notice is retained in `public/licenses/Tinted-Theming-MIT.txt`. Geist and JetBrains Mono are self-hosted from their font packages under SIL OFL. Lucide icons retain their package license. Third-party notices are available under `public/licenses/`.
