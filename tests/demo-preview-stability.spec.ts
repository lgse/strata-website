import { expect, test } from '@playwright/test';

test('changing preview files does not animate the panel or move the page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Miller column', exact: true }).click();
  const preview = page.locator('.app-preview');
  await expect(preview).toBeVisible();
  // Finish the initial hero entrance; file changes themselves must be immediate.
  await page.locator('.hero-app').evaluate(async (node) => {
    await Promise.all(node.getAnimations().map((animation) => animation.finished));
  });
  await page.locator('.app-window').scrollIntoViewIfNeeded();
  const original = await preview.elementHandle();
  const bounds = await preview.boundingBox();
  const scroll = await page.evaluate(() => window.scrollY);
  for (const name of ['brand-guide.md', 'night-drive.png', 'colors.json', 'readme.md']) {
    await page.locator('.demo-files .file-row').filter({ hasText: name }).click();
    await expect(page.locator('.preview-meta strong')).toHaveText(name);
    expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
    expect(await preview.evaluate((node) => getComputedStyle(node).animationName)).toBe('none');
    expect(await preview.boundingBox()).toEqual(bounds);
    expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
