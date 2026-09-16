import { expect, test } from '@playwright/test';

test('shortcuts have equal gaps and align with both edges at every viewport', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 390, 620, 768, 850, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const layout = await page.locator('.app-statusbar').evaluate((bar) => {
      const bounds = bar.getBoundingClientRect();
      const style = getComputedStyle(bar);
      const items = [...bar.children]
        .filter((item) => getComputedStyle(item).display !== 'none')
        .map((item) => item.getBoundingClientRect());
      return {
        left: items[0].left - bounds.left - parseFloat(style.paddingLeft),
        right: bounds.right - items.at(-1)!.right - parseFloat(style.paddingRight),
        gaps: items.slice(1).map((item, index) => item.left - items[index].right),
      };
    });
    expect(Math.abs(layout.left), `left edge at ${width}px`).toBeLessThan(1);
    expect(Math.abs(layout.right), `right edge at ${width}px`).toBeLessThan(1);
    expect(Math.min(...layout.gaps), `no overlap at ${width}px`).toBeGreaterThanOrEqual(12);
    expect(Math.max(...layout.gaps) - Math.min(...layout.gaps)).toBeLessThan(1);
  }
});

test('shortcuts panel opens by click and F1, and closes with Escape', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('.demo-shortcuts summary');
  const panel = page.getByRole('region', { name: 'Keyboard shortcuts' });
  await expect(panel).toBeHidden();
  await trigger.click();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await page.keyboard.press('F1');
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('.app-statusbar')).toContainText('1 file selected');
});
