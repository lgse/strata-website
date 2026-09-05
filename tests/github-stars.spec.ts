import { expect, test } from '@playwright/test';
import { GET } from '../src/app/api/github-stars/route';

test('header shows compact stars with an exact accessible count', async ({ page }) => {
  await page.route('**/api/github-stars', (route) => route.fulfill({ json: { stars: 1234 } }));
  await page.goto('/');
  const badge = page.locator('.site-header .github-link');
  await expect(badge).toBeVisible();
  await expect(badge.locator('.github-star-count')).toHaveText('1.2K');
  await expect(badge).toHaveAttribute('aria-label', 'Strata on GitHub — 1,234 stars');
  await expect(badge).toHaveAttribute('title', 'Strata on GitHub — 1,234 stars');
  await expect(badge).toHaveAttribute('href', 'https://github.com/lgse/strata');
  for (const width of [320, 390, 620, 700, 850, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(badge).toBeVisible();
    await expect
      .poll(() =>
        badge.evaluate((node) => {
          const star = node.querySelector('.github-star-icon')!.getBoundingClientRect();
          const count = node.querySelector('.github-star-count')!.getBoundingClientRect();
          return count.left - star.right;
        }),
      )
      .toBeCloseTo(6, 0);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
  }
});

test('zero stars is a real count, not a loading or error placeholder', async ({ page }) => {
  await page.route('**/api/github-stars', (route) => route.fulfill({ json: { stars: 0 } }));
  await page.goto('/');
  await expect(page.locator('.github-star-count')).toHaveText('0');
});

test('GitHub outages leave a useful Star link, not an invented count', async ({ page }) => {
  await page.route('**/api/github-stars', (route) =>
    route.fulfill({ status: 503, json: { stars: null } }),
  );
  await page.goto('/');
  await expect(page.locator('.github-star-count')).toHaveText('Star');
  await expect(page.locator('.github-link')).toHaveAttribute('aria-label', 'Star Strata on GitHub');
});

test('loading the count does not change the badge width', async ({ page }) => {
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/github-stars', async (route) => {
    await ready;
    await route.fulfill({ json: { stars: 12500 } });
  });
  await page.goto('/');
  const badge = page.locator('.github-link');
  const before = await badge.boundingBox();
  release();
  await expect(badge.locator('.github-star-count')).toHaveText('12.5K');
  const after = await badge.boundingBox();
  expect(after!.width).toBe(before!.width);
});

test('stars endpoint validates GitHub data and caches successful requests', async () => {
  const original = globalThis.fetch;
  let options: RequestInit | undefined;
  globalThis.fetch = async (url, init) => {
    expect(url).toBe('https://api.github.com/repos/lgse/strata');
    options = init;
    return Response.json({ stargazers_count: 218 });
  };
  try {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ stars: 218 });
    expect(options?.next?.revalidate).toBe(3600);
    expect(options?.signal).toBeDefined();
    expect(response.headers.get('cache-control')).toContain('s-maxage=3600');
  } finally {
    globalThis.fetch = original;
  }
});

test('stars endpoint fails safely on rate limits, malformed counts and network errors', async () => {
  const original = globalThis.fetch;
  try {
    for (const response of [
      new Response(null, { status: 403 }),
      new Response('not json'),
      Response.json({}),
      ...[-1, 1.5, '218', null, Number.MAX_SAFE_INTEGER + 1].map((stargazers_count) =>
        Response.json({ stargazers_count }),
      ),
    ]) {
      globalThis.fetch = async () => response;
      const result = await GET();
      expect(result.status).toBe(503);
      expect(await result.json()).toEqual({ stars: null });
      expect(result.headers.get('cache-control')).toBe('no-store');
    }
    globalThis.fetch = async () => {
      throw new DOMException('Timed out', 'TimeoutError');
    };
    expect((await GET()).status).toBe(503);
  } finally {
    globalThis.fetch = original;
  }
});
