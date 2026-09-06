import { expect, test } from '@playwright/test';
import { discordInvite } from '../src/lib/site-links';

test('the permanent Discord invite is linked from the hero, navigation, FAQ and footer', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  expect(discordInvite).toBe('https://discord.gg/JAcuPEKDaE');
  const hero = page.locator('.hero-actions');
  await expect(hero.getByRole('link')).toHaveCount(3);
  for (const name of ['Join us on Discord', 'Ask on Discord']) {
    const icon = page.getByRole('link', { name, exact: true }).locator('svg[data-icon="discord"]');
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('fill', 'currentColor');
  }
  await expect(page.locator('.lucide-message-circle')).toHaveCount(0);
  await expect(hero.getByRole('link', { name: 'Join us on Discord', exact: true })).toHaveAttribute(
    'href',
    discordInvite,
  );
  await expect(
    page.locator('.faq-heading').getByRole('link', { name: 'Ask on Discord' }),
  ).toHaveAttribute('href', discordInvite);
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'Discord', exact: true }),
  ).toHaveAttribute('href', discordInvite);
  if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click();
  const nav = page.getByRole('navigation', {
    name: isMobile ? 'Mobile navigation' : 'Main navigation',
    exact: true,
  });
  await expect(nav.getByRole('link', { name: 'Discord', exact: true })).toBeVisible();
  for (const link of await page.locator(`a[href="${discordInvite}"]`).all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noreferrer');
  }
  // Validate the navigation without contacting Discord from the automated test.
  await page
    .context()
    .route(`${discordInvite}**`, (route) =>
      route.fulfill({ contentType: 'text/html', body: '<title>Discord invite test</title>' }),
    );
  const popupPromise = page.waitForEvent('popup');
  await nav.getByRole('link', { name: 'Discord', exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(discordInvite);
  await popup.close();
  if (isMobile) await expect(nav).not.toBeVisible();
});

test('the extra community links fit the hero and header at responsive widths', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('strata-site-theme', 'gruvbox-dark-hard'));
  await page.goto('/');
  for (const width of [320, 390, 620, 850, 851, 900, 1024, 1101, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `overflow at ${width}px`,
    ).toBe(true);
    const hero = page.locator('.hero-actions');
    expect(
      await hero.evaluate((node) => node.scrollWidth <= node.clientWidth),
      `hero overflow at ${width}px`,
    ).toBe(true);
    const rects = await hero.getByRole('link').evaluateAll((links) =>
      links.map((link) => {
        const { left, right, top, bottom } = link.getBoundingClientRect();
        return { left, right, top, bottom };
      }),
    );
    for (let i = 1; i < rects.length; i++) {
      const a = rects[i - 1],
        b = rects[i];
      expect(b.left >= a.right || b.top >= a.bottom, `hero button overlap at ${width}px`).toBe(
        true,
      );
    }
    const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    if (await nav.isVisible()) {
      const navRect = await nav.boundingBox();
      const actions = await page.locator('.nav-actions').boundingBox();
      expect(navRect!.x + navRect!.width, `header overlap at ${width}px`).toBeLessThanOrEqual(
        actions!.x,
      );
      expect(actions!.x + actions!.width, `header overflow at ${width}px`).toBeLessThanOrEqual(
        width,
      );
    }
  }
});
