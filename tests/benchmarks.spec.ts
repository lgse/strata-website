import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  benchmarkSources,
  cpuTimings,
  cpuWorkloads,
  largeFolder,
  managers,
  previews,
} from '../src/lib/benchmarks';

// Explicit source values guard the headline claims and incomplete-result semantics.
test('benchmark data preserves capture bounds, coverage and CPU caveats', () => {
  expect(largeFolder.ready[1]).toMatchObject({ manager: 'Strata', lower: 2.52, value: 2.82 });
  expect(largeFolder.memory.map(({ value }) => value)).toEqual([86, 135, 163, 238, 299, 302, 440]);
  const raw = previews.find(({ id }) => id === 'raw')!;
  expect(raw.ready.map(({ label }) => label)).toEqual([
    '0/12 verified',
    '0.96–1.22 s',
    '11/12 verified',
    '11/12 verified',
    '0/12 verified',
    '0/12 verified',
    '0/12 verified',
  ]);
  expect(raw.ready.filter(({ value }) => value !== null)).toHaveLength(1);
  expect(previews.find(({ id }) => id === 'tiff')!.ready[5].value).toBeNull();
  expect(cpuTimings(cpuWorkloads[0])[5]).toMatchObject({ value: null, label: '>60 s (timeout)' });
  expect(cpuTimings(cpuWorkloads[0])[1].label).toBe('1.01 s ‡');
  expect(cpuTimings(cpuWorkloads[2])[4].label).toBe('0.25 s † ‡');
  for (const fixture of [largeFolder, ...previews]) {
    for (const rows of [fixture.ready, fixture.memory, ...(fixture.first ? [fixture.first] : [])]) {
      expect(rows.map(({ manager }) => manager)).toEqual(managers);
      for (const row of rows) {
        if (row.lower !== undefined) expect(row.value!).toBeGreaterThanOrEqual(row.lower);
      }
    }
  }
});

test('benchmark controls expose every fixture and preserve honest comparisons', async ({
  page,
  request,
}) => {
  await page.goto('/#benchmarks');
  const card = page.getByRole('article', { name: 'The fast parts. The honest parts.' });
  await expect(
    card.getByRole('group', { name: 'Benchmark category' }).getByRole('button'),
  ).toHaveText(['CPU activity', 'Large folders', 'Thumbnails']);
  await expect(card.getByRole('button', { name: 'CPU activity', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(card.getByRole('combobox', { name: 'Fixture', exact: true })).toHaveValue('mp4');
  const cpuList = card.getByRole('list', { name: 'CPU activity settled', exact: true });
  await expect(cpuList.getByRole('listitem').first()).toContainText('Strata');
  await expect(cpuList.getByRole('listitem').first()).toContainText('1.73 s');
  await expect(cpuList.getByRole('listitem')).toHaveText([
    /Strata/,
    /Flea/,
    /Dolphin/,
    /Krusader/,
    /Thunar/,
    /Nemo/,
    /Nautilus/,
  ]);
  await card.getByRole('button', { name: 'Large folders', exact: true }).click();
  await expect(
    card.getByRole('list', { name: 'Content visually settled', exact: true }).getByRole('listitem'),
  ).toHaveCount(7);
  await expect(card.getByText('2.52–2.82 s', { exact: true })).toBeVisible();
  await expect(
    card
      .getByRole('list', { name: 'Sampled peak memory', exact: true })
      .getByText('135 MiB', { exact: true }),
  ).toBeVisible();
  await expect(card.getByText('WHERE WE SHINE', { exact: true })).toBeVisible();
  await expect(card.getByText('WHERE WE NEED WORK', { exact: true })).toBeVisible();
  await card.getByRole('button', { name: 'Thumbnails', exact: true }).click();
  for (const fixture of previews) {
    await card.getByRole('combobox', { name: 'Fixture', exact: true }).selectOption(fixture.id);
    for (const metric of ['ready', 'first']) {
      await card.getByRole('combobox', { name: 'Timing', exact: true }).selectOption(metric);
      const rows = metric === 'ready' ? fixture.ready : fixture.first!;
      const list = card.getByRole('list', {
        name: metric === 'ready' ? fixture.readyTitle : 'First verified thumbnail',
        exact: true,
      });
      await expect(list.getByRole('listitem')).toHaveCount(7);
      for (let i = 0; i < rows.length; i++) {
        await expect(list.getByRole('listitem').nth(i)).toContainText(rows[i].label);
        // No graphical bar for a missing or incomplete completion.
        if (rows[i].value === null)
          await expect(
            list.getByRole('listitem').nth(i).locator('[aria-hidden="true"] > span'),
          ).toHaveCount(0);
      }
    }
  }
  await card.getByRole('button', { name: 'CPU activity', exact: true }).click();
  for (const workload of cpuWorkloads) {
    await card.getByRole('combobox', { name: 'Fixture', exact: true }).selectOption(workload.id);
    const list = card.getByRole('list', { name: 'CPU activity settled', exact: true });
    const sorted = cpuTimings(workload).toSorted(
      (a, b) => (a.value ?? Infinity) - (b.value ?? Infinity),
    );
    for (const [i, datum] of sorted.entries()) {
      await expect(list.getByRole('listitem').nth(i)).toContainText(datum.manager);
      await expect(list.getByRole('listitem').nth(i)).toContainText(datum.label);
    }
  }
  await expect(card.getByText('Quiet doesn’t mean ready.', { exact: true })).toBeVisible();
  await card.getByText('How to read these results', { exact: false }).click();
  await expect(
    card.getByText('The source charts do not specify hardware', { exact: false }),
  ).toBeVisible();
  for (const { file } of benchmarkSources) {
    const response = await request.get(`/benchmarks/${file}`);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
  }
});

test('benchmark graphs reflow, support keyboard controls, and pass dark/light accessibility checks', async ({
  page,
}) => {
  await page.goto('/#benchmarks');
  const card = page.locator('#benchmarks');
  const thumbnails = card.getByRole('button', { name: 'Thumbnails', exact: true });
  await thumbnails.focus();
  await page.keyboard.press('Enter');
  await expect(thumbnails).toHaveAttribute('aria-pressed', 'true');
  await card.getByRole('combobox', { name: 'Fixture', exact: true }).selectOption('raw');
  for (const width of [320, 390, 520, 620, 800, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const category of ['Large folders', 'Thumbnails', 'CPU activity']) {
      await card.getByRole('button', { name: category, exact: true }).click();
      expect(
        await card.evaluate((node) => node.scrollWidth <= node.clientWidth),
        `card overflow at ${width}px`,
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const labelsFit = await card
        .locator('li')
        .evaluateAll((rows) => rows.every((row) => row.scrollWidth <= row.clientWidth));
      expect(labelsFit, `chart row overflow at ${width}px`).toBe(true);
      for (const select of await card.getByRole('combobox').all()) {
        const geometry = await select.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          const chevron = node.parentElement!.querySelector('svg')!;
          const icon = chevron.getBoundingClientRect();
          return {
            appearance: getComputedStyle(node).appearance,
            padding: parseFloat(getComputedStyle(node).paddingRight),
            inset: rect.right - icon.right,
            centered: Math.abs((rect.top + rect.bottom) / 2 - (icon.top + icon.bottom) / 2),
            square: Math.abs(icon.width - icon.height),
            pointerEvents: getComputedStyle(chevron).pointerEvents,
          };
        });
        expect(geometry.appearance).toBe('none');
        expect(geometry.padding).toBeGreaterThanOrEqual(36);
        expect(geometry.inset).toBeGreaterThanOrEqual(12);
        expect(geometry.centered).toBeLessThan(1);
        expect(geometry.square).toBeLessThan(1);
        expect(geometry.pointerEvents).toBe('none');
      }
    }
  }
  for (const theme of ['tokyo-night', 'solarized-light']) {
    await page.evaluate((theme) => localStorage.setItem('strata-site-theme', theme), theme);
    await page.reload();
    await card.scrollIntoViewIfNeeded();
    await card.getByText('How to read these results', { exact: false }).click();
    for (const category of ['Large folders', 'Thumbnails', 'CPU activity']) {
      await card.getByRole('button', { name: category, exact: true }).click();
      const result = await new AxeBuilder({ page })
        .include('#benchmarks')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  }
});
