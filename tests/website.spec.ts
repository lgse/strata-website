import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { siteThemes } from '../src/lib/themes';

const storageKey = 'strata-site-theme';

test('renders without browser errors and fits the viewport', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Navigateevery layer.');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'tokyo-night');
  await expect(page.locator('.theme-card')).toHaveCount(6);
  const getStrata = page.locator('.nav-download');
  await expect(getStrata).toHaveAttribute('href', '#download');
  await expect(getStrata.locator('svg.lucide-download')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#download').scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', { name: 'Download for Linux' })).toHaveAttribute(
    'href',
    'https://github.com/lgse/strata/releases/latest',
  );
  expect(errors).toEqual([]);
});

test('all explorer modes, folder selection, file previews, filtering, sorting and grouping work', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'src', exact: true }).click();
  await expect(page.locator('.preview-meta strong')).toHaveText('main.rs');
  await page.getByRole('button', { name: 'Grid', exact: true }).click();
  await expect(page.locator('.browser-area')).toHaveClass(/mode-grid/);
  await page.getByRole('button', { name: 'assets', exact: true }).click();
  await page.getByRole('button', { name: 'colors.json', exact: true }).click();
  await expect(page.locator('.preview-meta strong')).toHaveText('colors.json');
  await page.getByRole('button', { name: 'Column', exact: true }).click();
  await expect(page.locator('.table-heading')).toBeVisible();
  const sortOptions = page.locator('.file-pane .pane-sort-options > summary');
  await sortOptions.click();
  await page.getByRole('checkbox', { name: 'Group demo files by type' }).check();
  await sortOptions.click();
  await expect(page.locator('.file-group-heading')).toHaveCount(3);
  await page.getByRole('button', { name: 'Sort demo files by name' }).click();
  await expect(page.getByRole('button', { name: 'Sort demo files by name' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Filter demo folder' }).click();
  await page.getByRole('textbox', { name: 'Filter demo files' }).fill('night');
  await expect(page.locator('.demo-files .file-row')).toHaveCount(1);
  await page.getByRole('textbox', { name: 'Filter demo files' }).fill('no-file-like-this');
  await expect(page.getByText('No matching files.')).toBeVisible();
  await page.getByRole('button', { name: 'Close file search' }).click();
  await expect(page.locator('.demo-files .file-row')).toHaveCount(4);
});

test('native-style toolbar, navigation, settings and window controls work', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const app = page.getByRole('region', { name: 'Interactive Strata illustration' });
  await app.getByRole('button', { name: 'Toggle demo sidebar' }).click();
  if (isMobile) {
    await expect(app.getByRole('complementary', { name: 'Demo places and devices' })).toBeVisible();
    await expect(app.getByText('Downloads', { exact: true })).toBeVisible();
    await expect(app.getByText('DEVICES', { exact: true })).toBeVisible();
  } else {
    await expect(app.locator('.app-sidebar')).not.toBeVisible();
  }
  await app.getByRole('button', { name: 'Toggle demo sidebar' }).click();
  await app.getByRole('button', { name: 'src', exact: true }).click();
  await page.getByRole('button', { name: 'Column', exact: true }).click();
  await expect(app.locator('.table-heading')).toContainText('Modified');
  await expect(app.locator('.app-preview')).not.toBeVisible();
  await app.getByRole('button', { name: 'Previous demo folder' }).click();
  await expect(app.locator('.pane-location')).toContainText('assets');
  await app.getByRole('button', { name: 'Next demo folder' }).click();
  await expect(app.locator('.pane-location')).toContainText('src');
  await app.getByRole('button', { name: 'Refresh demo folder' }).click();
  await expect(app.getByText('Demo folder refreshed')).toBeVisible();
  await expect(app.getByRole('button', { name: 'Settings', exact: true })).toBeDisabled();
  await expect(app.locator('.app-appearance')).toHaveCount(0);
  const viewToggle = app.getByRole('button', { name: 'View options', exact: true });
  await viewToggle.click();
  const view = app.getByRole('group', { name: 'View options', exact: true });
  await expect(view.getByRole('button', { name: 'List', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await view.getByRole('button', { name: 'Airy', exact: true }).click();
  await expect(app).toHaveClass(/density-airy/);
  await expect(view.getByRole('checkbox', { name: 'Hidden files' })).not.toBeChecked();
  await view.getByRole('button', { name: 'Columns', exact: true }).click();
  await expect(view).not.toBeVisible();
  await expect(app.locator('.app-preview')).toBeVisible();
  await expect(app.locator('.browser-area')).toHaveClass(/mode-columns/);
  await viewToggle.click();
  await view.getByRole('button', { name: 'Icons', exact: true }).click();
  await expect(app.locator('.browser-area')).toHaveClass(/mode-grid/);
  await viewToggle.click();
  await page.keyboard.press('Escape');
  await expect(view).not.toBeVisible();
  await expect(viewToggle).toBeFocused();
  await viewToggle.click();
  await app.locator('.app-breadcrumb').click();
  await expect(view).not.toBeVisible();
  await app.getByRole('button', { name: 'Close demo window' }).click();
  await expect(app).not.toBeVisible();
  await page.getByRole('button', { name: 'Reopen Strata demo' }).click();
  await expect(app).toBeVisible();
});

test('demo sidebar uses fictional pinned folders and device names', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Toggle demo sidebar' }).click();
  const sidebar = page.locator('.app-sidebar');
  for (const name of [
    'Moonshot',
    'Workbench',
    'Field Notes',
    'Aurora SSD',
    'Orbit Archive',
    'NOVA_USB',
  ]) {
    await expect(sidebar.getByText(name, { exact: true })).toBeVisible();
  }
  for (const name of ['strata', 'github', 'demo', 'Storage', '511 GB Volume', 'OMARCHY_202608']) {
    await expect(sidebar.getByText(name, { exact: true })).toHaveCount(0);
  }
  await sidebar.getByRole('button', { name: 'Workbench', exact: true }).click();
  await expect(page.locator('.preview-meta strong')).toHaveText('main.rs');
});

test('toolbar search opens a keyboard-accessible whole-tree dialog, not a pane filter', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Search demo files' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Search files and folders', exact: true });
  const search = dialog.getByRole('combobox');
  await expect(dialog).toBeVisible();
  await expect(search).toBeFocused();
  await expect(dialog.getByText('Type to search the whole demo tree')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Filter demo files' })).toHaveCount(0);
  await search.fill('.rs');
  await expect(dialog.getByRole('option')).toHaveCount(3);
  await search.press('ArrowDown');
  await expect(dialog.getByRole('option', { selected: true })).toContainText('theme.rs');
  await search.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator('.preview-meta strong')).toHaveText('theme.rs');
  await trigger.click();
  await search.fill('docs');
  await dialog.getByRole('option').filter({ hasText: /^docs/ }).click();
  await expect(page.locator('.preview-meta strong')).toHaveText('getting-started.md');
  await trigger.click();
  await search.fill('not-a-real-file');
  await expect(dialog.getByText('No matching files or folders.')).toBeVisible();
  await search.press('Enter');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  const accessibility = await new AxeBuilder({ page })
    .include('.demo-search-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await dialog.getByRole('button', { name: 'Close file search dialog' }).click();
  await expect(trigger).toBeFocused();
});

test('Column icons stay square and pane controls do not overlap at responsive widths', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Column', exact: true }).click();
  for (const width of [320, 390, 620, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.locator('.file-pane .pane-actions').evaluate((node) => {
          const icons = [
            ...node.querySelectorAll(':scope > button > svg, :scope > details > summary > svg'),
          ];
          return icons.every((icon) => {
            const rect = icon.getBoundingClientRect();
            return Math.abs(rect.width - rect.height) < 0.1 && rect.width >= 12;
          });
        }),
      )
      .toBe(true);
    const rectangles = await page
      .locator('.file-pane .pane-actions > [data-pane-action]')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, right: rect.right, width: rect.width };
        }),
      );
    for (let i = 1; i < rectangles.length; i++)
      expect(rectangles[i].left).toBeGreaterThanOrEqual(rectangles[i - 1].right);
    const fileIcon = await page.locator('.demo-files .file-row > svg').first().boundingBox();
    expect(fileIcon!.width).toBeCloseTo(fileIcon!.height, 1);
    for (const previewOpen of [false, true]) {
      if (previewOpen) {
        await page.locator('.demo-files .file-row').first().focus();
        await page.keyboard.press('Space');
      }
      const alignment = await page.locator('.file-pane').evaluate((pane) => {
        const visible = (selector: string) =>
          [...pane.querySelectorAll(selector)]
            .filter((node) => getComputedStyle(node).display !== 'none')
            .map((node) => node.getBoundingClientRect());
        const headings = visible('.table-heading > span');
        const cells = visible('.demo-file-wrap:first-child .file-row > span');
        return (
          headings.length === cells.length &&
          headings.every(
            (rect, i) =>
              Math.abs(rect.top - headings[0].top) < 1 && Math.abs(rect.left - cells[i].left) < 2,
          )
        );
      });
      expect(alignment, `table alignment at ${width}px, preview=${previewOpen}`).toBe(true);
    }
    await page.locator('.demo-files .file-row').first().focus();
    await page.keyboard.press('Space');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('narrow preview cards reflow artwork, details, tabs and all formats without overflow', async ({
  page,
}) => {
  await page.goto('/');
  for (const width of [320, 390, 620, 900]) {
    await page.setViewportSize({ width, height: 900 });
    const preview = page.locator('.preview-demo');
    await preview.scrollIntoViewIfNeeded();
    const formats = preview.getByRole('group', { name: 'Preview illustration format' });
    for (const name of ['Images', 'Code', 'PDF', 'Video', 'Audio']) {
      await formats.getByRole('button', { name, exact: true }).click();
      await expect
        .poll(() => preview.evaluate((node) => node.scrollWidth <= node.clientWidth))
        .toBe(true);
      if (name === 'Images' && (await preview.boundingBox())!.width <= 420) {
        const image = await preview.locator('.format-image > img').boundingBox();
        const details = await preview.locator('.format-details').boundingBox();
        expect(image!.width / image!.height).toBeCloseTo(1.5, 1);
        expect(details!.y).toBeGreaterThanOrEqual(image!.y + image!.height);
      }
    }
  }
});

test('Miller panes share native icons and keep their controls independent', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const parent = page.locator('.miller-parent');
  const files = page.locator('.file-pane');
  const actions = ['refresh', 'sort', 'options', 'filter'];
  for (const pane of [parent, files]) {
    const controls = pane.locator('.pane-actions > [data-pane-action]');
    expect(
      await controls.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-pane-action')),
      ),
    ).toEqual(actions);
    expect(
      await controls.evaluateAll((nodes) =>
        nodes.map((node) =>
          (node.querySelector(':scope > svg') ?? node.querySelector('summary > svg'))?.getAttribute(
            'class',
          ),
        ),
      ),
    ).toEqual([
      expect.stringContaining('lucide-rotate-ccw'),
      expect.stringContaining('lucide-arrow-down-wide-narrow'),
      expect.stringContaining('lucide-settings-2'),
      expect.stringContaining('lucide-funnel'),
    ]);
    await expect(pane.locator('.pane-actions > [data-pane-action]:visible')).toHaveCount(
      isMobile ? 2 : 4,
    );
  }
  await parent.getByRole('button', { name: 'Filter parent pane' }).click();
  await parent.getByRole('textbox', { name: 'Filter parent entries' }).fill('docs');
  await expect(parent.locator('.folder-row')).toHaveCount(1);
  await expect(files.locator('.demo-files .file-row')).toHaveCount(4);
  await files.getByRole('button', { name: 'Filter demo folder' }).click();
  await files.getByRole('textbox', { name: 'Filter demo files' }).fill('night');
  await expect(files.locator('.demo-files .file-row')).toHaveCount(1);
  await parent.getByRole('button', { name: 'Close parent filter' }).click();
  await expect(parent.locator('.folder-row')).toHaveCount(3);
  await expect(files.locator('.demo-files .file-row')).toHaveCount(1);
  await parent.locator('.pane-sort-options > summary').click();
  await parent.getByRole('button', { name: 'Name: A to Z' }).click();
  await parent.getByRole('checkbox', { name: 'Group parent pane by type' }).check();
  await parent.locator('.pane-sort-options > summary').click();
  await expect(parent.locator('.file-group-heading')).toHaveCount(2);
  await expect(files.locator('.file-group-heading')).toHaveCount(0);
  await expect(
    parent.getByRole('button', { name: 'Sort parent pane by name', includeHidden: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    files.getByRole('button', { name: 'Sort demo files by name', includeHidden: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  if (!isMobile) {
    await parent.getByRole('button', { name: 'Refresh parent pane' }).click();
    await expect(parent.getByText('Parent pane refreshed')).toBeVisible();
    await expect(files.locator('.demo-files .file-row')).toHaveCount(1);
  }
});

test('keyboard navigation and fuzzy filename search work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'night-drive.png', exact: true }).focus();
  await page.keyboard.press('j');
  await expect(page.locator('.preview-meta strong')).toHaveText('brand-guide.md');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('.preview-meta strong')).toHaveText('night-drive.png');
  const search = page.getByRole('textbox', { name: 'Try fuzzy filename search' });
  await search.fill('tmrs');
  await expect(page.locator('.search-results > button')).toHaveCount(1);
  await search.press('Enter');
  await expect(page.getByText('Selected theme.rs · demo only')).toBeVisible();
  await search.fill('no-such-file');
  await expect(page.getByText('No matches. Try “tm” or “rs”.')).toBeVisible();
});

test('preview formats show their distinct safety boundaries', async ({ page }) => {
  await page.goto('/');
  const formats = page.getByRole('group', { name: 'Preview illustration format' });
  await formats.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.getByText('BOUNDED TEXT READER')).toBeVisible();
  await expect(page.getByText('In-process text', { exact: true })).toBeVisible();
  await formats.getByRole('button', { name: 'PDF', exact: true }).click();
  await expect(page.getByText('field-notes.pdf')).toBeVisible();
  await formats.getByRole('button', { name: 'Video', exact: true }).click();
  await expect(page.getByText('Video preview illustration', { exact: true })).toBeVisible();
  await formats.getByRole('button', { name: 'Audio', exact: true }).click();
  await expect(page.getByText('midnight-drive.flac')).toBeVisible();
  await expect(page.getByText('ISOLATED PROCESS', { exact: true })).toBeVisible();
});

test('theme picker shows ten favorites, filters, persists and restores focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('.theme-trigger');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.theme-result')).toHaveCount(10);
  const search = dialog.getByRole('textbox', { name: 'Search themes' });
  await expect(search).toBeFocused();
  await search.fill('rose pine');
  await expect(dialog.locator('.theme-result')).toHaveCount(1);
  await search.fill('solarized');
  await expect(dialog.locator('.theme-result')).toHaveCount(2);
  await dialog.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(dialog.locator('.theme-result')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Solarized Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'solarized-light');
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(
    'solarized-light',
  );
  await search.fill('nothing-matches-this');
  await expect(dialog.getByText('No themes found.', { exact: false })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'solarized-light');
  await expect(trigger).toContainText('Solarized Light');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
    'light',
  );
});

test('every curated palette can be selected', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  await page.locator('.theme-trigger').click();
  const dialog = page.getByRole('dialog');
  for (const theme of siteThemes) {
    await dialog.getByRole('textbox', { name: 'Search themes' }).fill(theme.name);
    await dialog.getByRole('button', { name: theme.name, exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme.id);
    expect(
      await page.evaluate(() => document.documentElement.style.getPropertyValue('--background')),
    ).toBe(theme.background);
  }
});

test('theme startup works before hydration and rejects unknown stored values', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext();
  await context.addInitScript((key) => localStorage.setItem(key, 'solarized-light'), storageKey);
  await context.route(/\/_next\/static\/.*\.js/, (route) => route.abort());
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'solarized-light');
  await context.close();
  const invalidContext = await browser.newContext();
  await invalidContext.addInitScript((key) => localStorage.setItem(key, 'not-a-theme'), storageKey);
  const invalidPage = await invalidContext.newPage();
  await invalidPage.goto(baseURL!);
  await expect(invalidPage.locator('html')).toHaveAttribute('data-theme', 'tokyo-night');
  await invalidContext.close();
  // A previously selected palette outside the shortlist must not be discarded.
  const legacyContext = await browser.newContext();
  await legacyContext.addInitScript((key) => localStorage.setItem(key, 'zenburn'), storageKey);
  const legacyPage = await legacyContext.newPage();
  await legacyPage.goto(baseURL!);
  await expect(legacyPage.locator('html')).toHaveAttribute('data-theme', 'zenburn');
  await legacyPage.locator('.theme-trigger').click();
  await expect(legacyPage.getByRole('dialog').locator('.theme-result')).toHaveCount(10);
  await expect(
    legacyPage.getByRole('dialog').getByRole('button', { name: 'Zenburn', exact: true }),
  ).toHaveCount(0);
  await legacyContext.close();
});

test('theme selection still works when local storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage disabled');
      },
    });
  });
  await page.goto('/');
  await page.locator('.theme-card').filter({ hasText: 'Dracula' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dracula');
  await expect(page.locator('.theme-trigger')).toContainText('Dracula');
});

test('splash installer matches the README and copies with graceful failure handling', async ({
  page,
}) => {
  await page.goto('/');
  const installer = page.getByRole('region', { name: 'Quick install Strata', exact: true });
  await expect(installer).toBeVisible();
  await expect(installer.locator('code')).toHaveText(
    'curl -fsSL https://raw.githubusercontent.com/lgse/strata/main/install.sh | bash',
  );
  expect(await installer.evaluate((node) => node.closest('.hero') !== null)).toBe(true);
  await expect(
    page.getByRole('region', { name: 'Install Strata', exact: true }).locator('code'),
  ).toHaveText(await installer.locator('code').innerText());
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copied = text;
        },
      },
    });
  });
  await installer.getByRole('button', { name: 'Copy install command' }).click();
  await expect(
    installer.getByText('Copied. Review the installer before running it.'),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute(
    'data-copied',
    'curl -fsSL https://raw.githubusercontent.com/lgse/strata/main/install.sh | bash',
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Denied');
        },
      },
    });
  });
  await installer
    .getByRole('button', { name: /Install command copied|Copy install command/ })
    .click();
  await expect(
    installer.getByText('Clipboard unavailable. Select and copy the command above.'),
  ).toBeVisible();
});

test('FAQ disclosures and mobile navigation work', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
    await nav.getByRole('link', { name: 'Features', exact: true }).click();
    await expect(nav).not.toBeVisible();
    await expect(page).toHaveURL(/#features$/);
  }
  await page.locator('summary').filter({ hasText: 'What do I need to run Strata?' }).click();
  await expect(page.locator('details[open] > p')).toContainText('GTK 4.12+');
});

for (const { id: theme } of siteThemes) {
  test(`${theme} passes automated WCAG A/AA checks`, async ({ page }) => {
    await page.addInitScript(({ key, theme }) => localStorage.setItem(key, theme), {
      key: storageKey,
      theme,
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.locator('.theme-trigger').click();
    const dialogResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(dialogResults.violations).toEqual([]);
  });
}

test('theme preferences synchronize between tabs', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await page.locator('.theme-card').filter({ hasText: 'Dracula' }).click();
  await expect(second.locator('html')).toHaveAttribute('data-theme', 'dracula');
  await expect(second.locator('.theme-trigger')).toContainText('Dracula');
});

test('responsive widths and reduced motion remain usable', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 360, 390, 620, 621, 768, 850, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), {
        message: `overflow at ${width}px`,
      })
      .toBe(true);
  }
  expect(
    await page
      .locator('.floating-folders')
      .first()
      .evaluate((node) => getComputedStyle(node).animationName),
  ).toBe('none');
  expect(await page.locator('html').evaluate((node) => getComputedStyle(node).scrollBehavior)).toBe(
    'auto',
  );
});

test('Discord interactions reject unsigned requests', async ({ request }) => {
  const response = await request.post('/api/discord/interactions', {
    data: { type: 1 },
  });
  expect(response.status()).toBe(401);
});

test('social image and robots are served, and fonts stay local', async ({ page, request }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    if (!new URL(req.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)) external.push(req.url());
  });
  await page.goto('/');
  expect(external).toEqual([]);
  await expect(page).toHaveTitle('Strata: Navigate every layer.');
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    await expect(page.locator(selector)).toHaveAttribute(
      'content',
      'Strata: Navigate every layer.',
    );
  }
  expect(await page.locator('body').innerText()).not.toContain('\u2014');
  const image = await request.get('/opengraph-image');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
  expect((await request.get('/robots.txt')).ok()).toBe(true);
});
