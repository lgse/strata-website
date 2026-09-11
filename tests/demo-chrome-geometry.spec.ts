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
    ).toHaveCSS('width', '16px');
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
