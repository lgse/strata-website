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
