import { expect, test } from '@playwright/test';

test('demo actions and accent follow the hovered column without shifting the layout', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Touch controls remain available without hover');
  await page.goto('/');
  const app = page.locator('.app-window');
  const panes = [
    app.locator('.miller-parent'),
    app.locator('.file-pane'),
    app.locator('.app-preview'),
  ];
  const actions = panes.map((pane) => pane.locator('.pane-actions, .preview-actions'));
  const headers = panes.map((pane) => pane.locator('.pane-title, .preview-title'));
  await app.scrollIntoViewIfNeeded();
  await app.locator('.app-toolbar').hover();
  await expect(app).toHaveCSS('border-radius', '6px');
  const positions = await Promise.all(headers.map((header) => header.boundingBox()));
  await expect(headers[0]).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  for (const [index, controls] of actions.entries()) {
    await expect(controls).toHaveCSS('opacity', index === 0 ? '1' : '0');
  }

  for (const [index, pane] of panes.entries()) {
    // Hover the body, not just the header.
    await pane.hover({ position: { x: 20, y: 250 } });
    for (const [other, controls] of actions.entries()) {
      await expect(controls).toHaveCSS('opacity', other === index ? '1' : '0');
      if (other === index) {
        await expect(headers[other]).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      } else {
        await expect(headers[other]).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      }
      expect(await headers[other].boundingBox()).toEqual(positions[other]);
    }
    await app.locator('.app-toolbar').hover();
    await expect(headers[index]).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await expect(actions[index]).toHaveCSS('opacity', '1');
  }

  // Keyboard users can tab into controls even when the pointer is elsewhere.
  await app.locator('.app-sidebar button').last().focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Refresh parent pane' })).toBeFocused();
  await expect(actions[0]).toHaveCSS('opacity', '1');
  await expect(actions[1]).toHaveCSS('opacity', '0');
  await expect(headers[2]).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');

  await panes[1].hover();
  await expect(headers[0]).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await panes[1].locator('.pane-sort-options > summary').click();
  await app.locator('.app-toolbar').hover();
  await expect(actions[1]).toHaveCSS('opacity', '1');
  await expect(panes[1].locator('.pane-sort-popover')).toBeVisible();
});

test('only Miller mode keeps one column highlighted, including after preview close', async ({
  page,
}) => {
  await page.goto('/');
  const headers = page.locator('.browser-area > * > :is(.pane-title, .preview-title)');
  async function expectHighlights(count: number) {
    await expect
      .poll(() =>
        headers.evaluateAll(
          (nodes) =>
            nodes.filter((node) => {
              const style = getComputedStyle(node);
              return style.borderTopWidth !== '0px' && style.borderTopColor !== 'rgba(0, 0, 0, 0)';
            }).length,
        ),
      )
      .toBe(count);
  }
  await expect(page.locator('.miller-parent > .pane-title')).not.toHaveCSS(
    'border-top-color',
    'rgba(0, 0, 0, 0)',
  );
  await expectHighlights(1);
  for (const mode of ['Grid', 'Column', 'Miller column']) {
    await page.getByRole('button', { name: mode, exact: true }).click();
    await expectHighlights(mode === 'Miller column' ? 1 : 0);
  }
  await page.getByRole('button', { name: 'Close preview', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.app-preview')).toHaveCount(0);
  await expectHighlights(1);
  await expect(page.locator('.file-pane > .pane-title')).not.toHaveCSS(
    'border-top-color',
    'rgba(0, 0, 0, 0)',
  );
});

test('touch users can access column actions without hover', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Touch-specific fallback');
  await page.goto('/');
  for (const selector of [
    '.miller-parent .pane-actions',
    '.file-pane .pane-actions',
    '.preview-actions',
  ]) {
    await expect(page.locator(selector)).toHaveCSS('opacity', '1');
  }
  await page.getByRole('button', { name: 'Filter demo folder' }).tap();
  await expect(page.getByRole('textbox', { name: 'Filter demo files' })).toBeFocused();
});
