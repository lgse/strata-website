import { expect, test } from '@playwright/test';

for (const mode of ['Grid', 'Column']) {
  test(`${mode} navigates up to strata without changing mode and supports folder history`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'src', exact: true }).click();
    await page.getByRole('button', { name: mode, exact: true }).click();
    const files = page.locator('.demo-files');
    const location = page.locator('.file-pane .pane-location');
    const up = page.getByRole('button', { name: 'Navigate up', exact: true });
    const back = page.getByRole('button', { name: 'Previous demo folder' });
    const forward = page.getByRole('button', { name: 'Next demo folder' });
    await files.locator('.file-row').first().click();
    await expect(page.locator('.app-preview')).toBeVisible();
    await up.click();
    await expect(location).toHaveText('strata');
    await expect(page.getByRole('button', { name: mode, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('.app-preview')).toHaveCount(0);
    await expect(up).toBeDisabled();
    await expect(files.locator('.file-row')).toHaveCount(6);
    for (const folder of ['assets', 'src', 'docs']) {
      await expect(
        files
          .locator('.file-row')
          .filter({ has: page.locator('.file-name', { hasText: new RegExp(`^${folder}$`) }) })
          .locator('svg.lucide-folder'),
      ).toBeVisible();
    }
    const src = files
      .locator('.file-row')
      .filter({ has: page.locator('.file-name', { hasText: /^src$/ }) });
    await expect(src).toHaveAttribute('aria-pressed', 'true');
    await back.click();
    await expect(location).toHaveText('src');
    await forward.click();
    await expect(location).toHaveText('strata');
    const docs = files
      .locator('.file-row')
      .filter({ has: page.locator('.file-name', { hasText: /^docs$/ }) });
    await docs.focus();
    await docs.press('Enter');
    await expect(location).toHaveText('docs');
    await expect(page.getByRole('button', { name: mode, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(files.locator('.file-row')).toHaveCount(2);
    await up.focus();
    await up.press('Enter');
    await expect(location).toHaveText('strata');
    await expect(up).toBeDisabled();
    await expect(files.locator('.file-row').filter({ hasText: 'docs' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await files.locator('.file-row').filter({ hasText: 'README.md' }).click();
    await expect(page.locator('.preview-meta strong')).toHaveText('README.md');
    await page.getByRole('button', { name: 'Miller column', exact: true }).click();
    await expect(page.locator('.miller-parent')).toHaveCount(0);
    await expect(location).toHaveText('strata');
    await files.getByRole('button', { name: 'assets', exact: true }).click();
    await expect(page.locator('.miller-parent')).toBeVisible();
    await expect(location).toHaveText('assets');
  });
}
