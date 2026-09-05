# Website verification

Verified locally on 2026-09-04 with Node 24, Next.js 16.3.4, and Chromium.

## Automated checks

- `npm run themes:sync`: all 95 source palettes imported successfully.
- `npm run lint`: passed without warnings.
- `npm run typecheck`: passed.
- `npm run format:check`: passed.
- `npm run build`: passed; landing page, social image, and robots are prerendered.
- `npm test`: **70 passed**, across desktop and mobile projects.

Browser coverage includes all 10 curated theme selections, dark/light filtering, accent-insensitive theme search, pre-hydration theme restoration (including saved themes outside the shortlist), invalid/blocked storage, cross-tab synchronization, dialog focus restoration, all three explorer modes, file selection, sorting/grouping/filtering, keyboard movement, fuzzy search, preview-format boundaries, the splash installer and clipboard success/failure, native-style toolbar controls, sidebar toggle, back/forward history, view-options menu/density controls, Settings placeholder, close/reopen, mobile navigation, FAQs, local-only asset requests, and social image delivery.

Automated axe WCAG A/AA checks (including 2.2 targets) pass for the page and theme dialog in **all 10 curated palettes**, on both desktop and mobile. This is automated coverage, not a claim of comprehensive accessibility certification.

The GitHub badge is additionally covered for compact formatting, exact accessible labels, zero counts, API failure fallback, stable loading width, a fixed 6 px star-to-number gap, small-screen layout, upstream cache options, malformed data, rate limits, and timeouts. Miller-pane tests verify matching icon shapes and ordering, matching responsive subsets, and independent parent/child sorting, grouping, filtering, and refresh. The live same-origin endpoint was manually verified against the public GitHub count.

## Responsive / visual checks

- No horizontal page overflow at settled viewport widths of 320, 360, 390, 620, 621, 768, 850, 1024, and 1440 px.
- Desktop Tokyo Night and Solarized Light layouts inspected in Chromium screenshots.
- Mobile hero, explorer illustration, and theme dialog inspected at 390 px.
- Revised Miller-column and full-width Column chrome compared to the supplied app reference. Fictional pinned folders/devices replace reference names. Icon aspect ratios, non-overlapping pane controls, and table header/cell alignment (with and without previews) have responsive regression coverage.
- List toolbar button opens view options; Settings has no menu. Whole-tree search is a compact native dialog with keyboard navigation, empty states, folder/file selection, focus restoration, and automated axe coverage.
- Narrow preview cards stack landscape artwork above readable details, with reflowing permission labels and five equal-width format buttons. All formats checked for overflow at 320, 390, 620, and 900 px.
- Splash command verified against the current canonical GitHub README, rather than the adjacent checkout's different revision.
- Reduced-motion disables the splash animation and smooth scrolling.
- No browser runtime errors in tested interactions.

## Local mobile Lighthouse sample (first iteration)

Production build, default mobile throttling, local HTTP server:

| Category       | Score |
| -------------- | ----: |
| Performance    |    96 |
| Accessibility  |   100 |
| Best Practices |   100 |
| SEO            |   100 |

Largest Contentful Paint: **2.9 s**. Cumulative Layout Shift: **0**.

These are single-run website measurements, not Strata application benchmarks or a guarantee of deployed real-world performance. Re-run after configuring the final public origin and adding real media.

```bash
npm run build
npm start -- --port 3102
# In another terminal:
npx lighthouse http://localhost:3102 --chrome-flags='--headless' \
  --only-categories=performance,accessibility,best-practices,seo
```
