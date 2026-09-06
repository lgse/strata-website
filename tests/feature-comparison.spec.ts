import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  comparisonFeatures,
  comparisonProjects,
  comparisonReviewed,
  featureCategories,
  featureStatuses,
} from '../src/lib/feature-comparison';

const appNames = comparisonProjects.map(({ name }) => name);

test('all feature assessments have definitions, seven app entries and attributable sources', () => {
  expect(comparisonReviewed).toBe('2026-09-06');
  expect(comparisonFeatures).toHaveLength(13);
  expect(new Set(comparisonFeatures.map(({ id }) => id)).size).toBe(comparisonFeatures.length);
  const approvedHosts = ['github.com', 'docs.xfce.org', 'help.gnome.org', 'apps.kde.org'];
  for (const project of comparisonProjects) expect(project.revision).toMatch(/^[a-f0-9]{40}$/);
  for (const feature of comparisonFeatures) {
    expect(feature.definition.length).toBeGreaterThan(50);
    expect(Object.keys(feature.cells)).toEqual(comparisonProjects.map(({ id }) => id));
    for (const cell of Object.values(feature.cells)) {
      expect(cell.note.length).toBeGreaterThan(40);
      expect(cell.status in featureStatuses).toBe(true);
      expect(cell.sources.length).toBeGreaterThan(0);
      expect(new Set(cell.sources.map(({ url }) => url)).size).toBe(cell.sources.length);
      for (const source of cell.sources) {
        const url = new URL(source.url);
        expect(url.protocol).toBe('https:');
        expect(approvedHosts).toContain(url.hostname);
        if (url.hostname === 'github.com') expect(url.pathname).toMatch(/\/blob\/[a-f0-9]{40}\//);
      }
    }
  }
  const feature = (id: string) => comparisonFeatures.find((item) => item.id === id)!;
  for (const id of ['miller', 'fuzzy', 'omarchy', 'preview'])
    expect(feature(id).cells.flea.status).toBe('built-in');
  expect(feature('palette').cells.krusader.status).toBe('built-in');
  expect(feature('isolation').cells.flea.status).toBe('partial');
  expect(feature('isolation').cells.dolphin.status).toBe('unverified');
  for (const id of ['tabs', 'split', 'bulk', 'contents', 'terminal'])
    expect(feature(id).cells.strata.status).toBe('not-found');
  expect(feature('archives').cells.strata.status).toBe('built-in');
});

test('feature matrix filters and opens evidence for all 91 assessments', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/#comparison');
  const card = page.locator('#comparison');
  const table = card.getByRole('table');
  await expect(table.getByRole('columnheader')).toHaveText([
    'Capability',
    ...appNames.map((name) => (name === 'Strata' ? 'StrataThis app' : name)),
  ]);
  const dialog = page.getByRole('dialog', { name: /./ });
  for (const category of featureCategories) {
    await card.getByRole('button', { name: category, exact: true }).click();
    const count = comparisonFeatures.filter(
      (feature) => category === 'All features' || feature.category === category,
    ).length;
    await expect(table.locator('tbody > tr')).toHaveCount(count);
  }
  await card.getByRole('button', { name: 'All features', exact: true }).click();
  for (const feature of comparisonFeatures) {
    for (const app of comparisonProjects) {
      const cell = feature.cells[app.id];
      const button = table.getByRole('button', {
        name: `${app.name}: ${feature.title}.`,
        exact: false,
      });
      await button.click();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('heading')).toHaveText(feature.title);
      await expect(dialog.locator('#feature-evidence-note')).toHaveText(cell.note);
      await expect(dialog.getByRole('link')).toHaveCount(cell.sources.length);
      for (const { label, url } of cell.sources)
        await expect(dialog.getByRole('link', { name: label, exact: true })).toHaveAttribute(
          'href',
          url,
        );
      await dialog.getByRole('button', { name: 'Close feature evidence' }).click();
      await expect(dialog).not.toBeVisible();
      await expect(button).toBeFocused();
    }
  }
});

test('matrix has contained horizontal scrolling, sticky row labels and accessible evidence', async ({
  page,
}) => {
  await page.goto('/#comparison');
  const card = page.locator('#comparison');
  const scroller = card.getByRole('region', { name: 'Scrollable feature comparison' });
  for (const width of [320, 390, 620, 800, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `page overflow at ${width}px`,
    ).toBe(true);
    expect(await card.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await scroller.evaluate((node) => {
      node.scrollLeft = node.scrollWidth;
    });
    const labels = await scroller.locator('tbody th').first().boundingBox();
    const bounds = await scroller.boundingBox();
    expect(Math.abs(labels!.x - bounds!.x)).toBeLessThan(2);
    await scroller.evaluate((node) => {
      node.scrollLeft = 0;
    });
  }
  for (const theme of ['tokyo-night', 'solarized-light']) {
    await page.evaluate((value) => localStorage.setItem('strata-site-theme', value), theme);
    await page.reload();
    await card.scrollIntoViewIfNeeded();
    await card.getByText('Research scope & sources', { exact: false }).click();
    const results = await new AxeBuilder({ page })
      .include('#comparison')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    const trigger = card.getByRole('button', {
      name: 'Flea: Isolated native previews.',
      exact: false,
    });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Isolated native previews' });
    await expect(dialog).toBeVisible();
    const dialogResults = await new AxeBuilder({ page })
      .include('#feature-evidence')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(dialogResults.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});
