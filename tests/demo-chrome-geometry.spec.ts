import { expect, test, type Locator, type Page } from '@playwright/test';

const modes = ['Miller column', 'Grid', 'Column'] as const;

async function expectHeight(locator: Locator, height: number) {
  const boxes = await locator.evaluateAll((nodes) =>
    nodes
      .filter((node) => getComputedStyle(node).display !== 'none')
      .map((node) => node.getBoundingClientRect().height),
  );
  expect(boxes.length).toBeGreaterThan(0);
  for (const measured of boxes) expect(measured).toBeCloseTo(height, 1);
}

async function checkChrome(page: Page, width: number) {
  await page.setViewportSize({ width, height: 1000 });
  const app = page.getByRole('region', { name: 'Interactive Strata illustration' });
  const toolbar = app.locator('.app-toolbar');

  await expectHeight(toolbar, 41);
  await expectHeight(
    toolbar.locator(
      ':scope > .app-sidebar-toggle, :scope > .app-tools > button, :scope > .app-tools > .app-view-options > button',
    ),
    24,
  );
  await expect(toolbar.locator('.app-sidebar-toggle svg')).toHaveCSS('width', '17px');
  await expect(toolbar.getByRole('button', { name: 'View options' }).locator('svg')).toHaveCSS(
    'width',
    '16px',
  );

  const toggle = toolbar.locator('.app-sidebar-toggle');
  if (width < 621) await toggle.click();
  const iconCenters = () =>
    app.evaluate((node) => {
      const center = (selector: string) => {
        const box = node.querySelector(selector)!.getBoundingClientRect();
        return box.x + box.width / 2;
      };
      return Math.abs(center('.app-sidebar-toggle svg') - center('.sidebar-item svg'));
    });
  await expect.poll(iconCenters).toBeLessThan(0.5);
  if (width < 621) await toggle.click();

  for (const mode of modes) {
    await page.getByRole('button', { name: mode, exact: true }).click();
    await expectHeight(app.locator('.file-pane > .pane-title'), 41);
    await expectHeight(app.locator('.pane-title .pane-actions button:visible'), 24);
    await expect(
      app.locator('.pane-title .pane-actions button:visible').first().locator('svg'),
    ).toHaveCSS('width', width <= 620 ? '14px' : '16px');
    if (mode === 'Miller column') {
      await expectHeight(app.locator('.miller-parent > .pane-title'), 41);
      await expectHeight(app.locator('.preview-title'), 41);
    }
  }
}

test('interactive explorer chrome matches the native 41px hierarchy on desktop and mobile', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await checkChrome(page, 1440);
  await checkChrome(page, 900);
  await checkChrome(page, 390);
});

test('mobile chrome stays visible while Miller panes scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/');
  const app = page.locator('.app-window');
  await expect(page.getByRole('button', { name: 'Column', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(app.getByRole('button', { name: 'Toggle demo sidebar' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Miller column', exact: true }).click();
  const before = await app.locator('.app-toolbar').boundingBox();
  await app.locator('.browser-area').evaluate((node) => {
    node.scrollLeft = node.scrollWidth;
  });
  expect(await app.locator('.browser-area').evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  expect(await app.locator('.app-toolbar').boundingBox()).toEqual(before);
  for (const button of await app.locator('.app-toolbar button').all()) {
    const box = await button.boundingBox();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Miller starts with equal file columns and a larger preview', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const parent = page.locator('.miller-parent');
  const files = page.locator('.file-pane');
  const preview = page.locator('.app-preview');
  const widths = await Promise.all(
    [parent, files, preview].map((pane) =>
      pane.evaluate((node) => node.getBoundingClientRect().width),
    ),
  );
  expect(Math.abs(widths[0] - widths[1])).toBeLessThan(1);
  expect(widths[2] / widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(0.44, 2);
});

test('preview image fits within the pane without cropping or overflowing', async ({ page }) => {
  await page.goto('/');
  for (const width of [390, 900, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole('button', { name: 'Miller column', exact: true }).click();
    const image = page.locator('.app-preview .preview-image img');
    await expect(image).toHaveCSS('object-fit', 'contain');
    await expect(page.locator('.preview-image')).toHaveCSS('border-top-width', '0px');
    const frame = await page.locator('.preview-image').boundingBox();
    expect(frame!.width / frame!.height).toBeCloseTo(0.8, 2);
    const metadata = page.locator('.preview-properties');
    await expect(metadata).toHaveCSS('height', width <= 620 ? '40px' : '48px');
    const offsets = await metadata.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return [...node.children].map((child) => {
        const box = child.getBoundingClientRect();
        return Math.abs(box.y + box.height / 2 - (bounds.y + bounds.height / 2));
      });
    });
    for (const offset of offsets) expect(offset).toBeLessThan(1);
    const geometry = await page.locator('.app-preview').evaluate((pane) => {
      const outer = pane.getBoundingClientRect();
      const frame = pane.querySelector('.preview-image')!.getBoundingClientRect();
      return {
        left: frame.left - outer.left,
        right: outer.right - frame.right,
        bottom: outer.bottom - frame.bottom,
      };
    });
    expect(geometry.left).toBeGreaterThan(0);
    expect(geometry.right).toBeGreaterThan(0);
    expect(geometry.bottom).toBeGreaterThan(0);
  }
});

test('Miller headers are inset and compact rows use native spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const app = page.locator('.app-window');
  for (const pane of ['.miller-parent', '.file-pane']) {
    const header = app.locator(`${pane} > .pane-title`);
    await expect(header).toHaveCSS('padding-left', '12px');
    await expect(header).toHaveCSS('padding-right', '6px');
    await expectHeight(app.locator(`${pane} .file-row`), 26);
  }
});

test('Miller marks the parent path without a second selected row', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Miller column', exact: true }).click();
  const browser = page.locator('.browser-area');
  await expect(browser.locator('.file-row.selected')).toHaveCount(1);
  await expect(browser.locator('.miller-parent [aria-current="location"]')).toContainText('assets');
  await page.getByRole('button', { name: 'src', exact: true }).click();
  await expect(browser.locator('.file-row.selected')).toHaveCount(1);
  await expect(browser.locator('.miller-parent [aria-current="location"]')).toContainText('src');
  await expect(browser.locator('.miller-parent .selected')).toHaveCount(0);
});

test('file actions line up with the toolbar icons', async ({ page }) => {
  await page.goto('/');
  for (const width of [390, 900, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const mode of ['Grid', 'Column']) {
      await page.getByRole('button', { name: mode, exact: true }).click();
      const centers = await page.locator('.app-window').evaluate((app) => {
        const x = (node: Element) => {
          const box = node.getBoundingClientRect();
          return box.x + box.width / 2;
        };
        const upper = [
          ...app.querySelectorAll('.app-tools > button, .app-view-options > button'),
        ].map(x);
        const lower = [
          ...app.querySelectorAll(
            '.file-pane .pane-actions > button, .file-pane .pane-sort-options > summary',
          ),
        ].map(x);
        return { upper: upper.slice(-3), lower: lower.slice(-3) };
      });
      centers.upper.forEach((x, index) =>
        expect(Math.abs(x - centers.lower[index])).toBeLessThan(1),
      );
    }
  }
});

test('preview header matches column inset and toolbar action alignment', async ({ page }) => {
  await page.goto('/');
  for (const width of [900, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole('button', { name: 'Miller column', exact: true }).click();
    const header = page.locator('.preview-title');
    await expect(header).toHaveCSS('padding-left', '12px');
    const offsets = await page.locator('.app-window').evaluate((app) => {
      const center = (node: Element) => {
        const bounds = node.getBoundingClientRect();
        return bounds.x + bounds.width / 2;
      };
      const upper = [
        ...app.querySelectorAll('.app-tools > button, .app-view-options > button'),
      ].slice(-3);
      const lower = [...app.querySelectorAll('.preview-actions button')];
      return lower.map((node, index) => Math.abs(center(node) - center(upper[index])));
    });
    for (const offset of offsets) expect(offset).toBeLessThan(1);
  }
});
