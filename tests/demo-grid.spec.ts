import { expect, test } from '@playwright/test';

test('icon view uses centered uncropped thumbnails and reflows without clipping', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Grid', exact: true }).click();
  await expect(page.locator('.app-preview')).toHaveCount(0);
  await expect(page.locator('.folder-chips')).toHaveCount(0);
  await expect(page.locator('.grid-thumbnail img')).toHaveCSS('object-fit', 'contain');
  const files = page.locator('.demo-files');
  const first = files.locator('.file-row').first();
  await expect(first).toHaveCSS('text-align', 'center');
  await expect(first.locator('.file-name')).toHaveCSS('white-space', 'normal');
  await expect(first.locator('.grid-thumbnail')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  for (const width of [320, 390, 620, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const preview of [false, true]) {
      if (preview) await first.click();
      await expect
        .poll(() => files.evaluate((node) => node.scrollWidth <= node.clientWidth))
        .toBe(true);
      const alignment = await first.evaluate((node) => {
        const image = node.querySelector('.grid-thumbnail')!.getBoundingClientRect();
        const name = node.querySelector('.file-name')!.getBoundingClientRect();
        return Math.abs(image.left + image.width / 2 - name.left - name.width / 2);
      });
      expect(alignment).toBeLessThan(1);
      await expect(page.locator('.pane-navigation')).toBeVisible();
    }
    await first.focus();
    await page.keyboard.press('Space');
  }
});

test('List and Icons retain navigation arrows and omit the Miller accent with previews open', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'src', exact: true }).click();
  for (const mode of ['Grid', 'Column']) {
    await page.getByRole('button', { name: mode, exact: true }).click();
    await expect(page.locator('.pane-navigation')).toBeVisible();
    const up = page.getByRole('button', { name: 'Navigate up', exact: true });
    await expect(up).toBeVisible();
    const back = page.getByRole('button', { name: 'Previous demo folder' });
    const forward = page.getByRole('button', { name: 'Next demo folder' });
    await back.click();
    await expect(page.locator('.file-pane .pane-location')).toHaveText('assets');
    await forward.click();
    await expect(page.locator('.file-pane .pane-location')).toHaveText('src');
    await page.locator('.demo-files .file-row').first().click();
    await expect(page.locator('.app-preview')).toBeVisible();
    await expect(back).toBeVisible();
    await expect(forward).toBeVisible();
    await expect(up).toBeVisible();
    await expect(page.locator('.file-pane > .pane-title')).toHaveCSS('border-top-width', '0px');
    await expect(page.locator('.preview-title')).toHaveCSS('border-top-width', '0px');
  }
});
