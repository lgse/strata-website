import { expect, test } from '@playwright/test';

const expectations: [string, string][] = [
  ['night-drive.png', 'GPS COORDINATES'],
  ['brand-guide.md', 'Brand guide'],
  ['colors.json', '"Tokyo Night"'],
  ['night-drive.flac', 'Track 3 of 11'],
  ['ridge-line.mp4', '1 of 1 in folder'],
  ['field-notes.pdf', 'A pocket reference for navigating every layer'],
  ['inventory.tsv', 'Quoted text: "ergonomic"'],
  ['quarterly-report.docx', 'Quarterly Report'],
  ['project.zip', '2 files, 3 folders'],
];

test('every demo file kind renders its own native-style preview', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Miller column', exact: true }).click();
  const preview = page.locator('.app-preview');
  for (const [name, text] of expectations) {
    await page.locator('.demo-files .file-row').filter({ hasText: name }).click();
    await expect(preview.locator('.preview-meta strong')).toHaveText(name);
    await expect(preview.getByText(text, { exact: true })).toBeVisible();
    await expect
      .poll(() => preview.evaluate((node) => node.scrollWidth <= node.clientWidth))
      .toBe(true);
  }
  await page.locator('.demo-files .file-row').filter({ hasText: 'pyramids.3mf' }).click();
  await expect(preview.locator('.preview-model polygon')).toHaveCount(4);
  await expect(preview.locator('.preview-subtitle')).toContainText('model/3mf');
  // Text-like files expose the app's find, print and wrap actions; media does not.
  await page.locator('.demo-files .file-row').filter({ hasText: 'inventory.tsv' }).click();
  await expect(preview.getByRole('button', { name: 'Wrap long lines' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('.demo-files .file-row').filter({ hasText: 'ridge-line.mp4' }).click();
  await expect(preview.getByRole('button', { name: 'Wrap long lines' })).toHaveCount(0);
  await expect(preview.getByText('1080p', { exact: true })).toBeVisible();
  await expect(preview.getByRole('button', { name: 'Play or pause' })).toBeVisible();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page.locator('.file-type').filter({ hasText: 'ZIP archive' })).toBeVisible();
  await expect(page.locator('.file-type').filter({ hasText: '3D model' })).toBeVisible();
});
