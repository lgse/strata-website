import { expect, test } from '@playwright/test';
import { demoCode, highlightDemoLine } from '../src/lib/demo-code';
import { demoCollections, demoRootEntries } from '../src/lib/demo-data';

test('every code file has a distinct fixture and highlighting preserves its text', () => {
  const files = [...demoRootEntries, ...Object.values(demoCollections).flat()].filter(
    (file) => file.type === 'code',
  );
  expect(new Set(files.map(({ name }) => demoCode[name].text)).size).toBe(files.length);
  for (const { name } of files) {
    const fixture = demoCode[name];
    for (const line of fixture.text.split('\n')) {
      expect(
        highlightDemoLine(line, fixture.language)
          .map(({ text }) => text)
          .join(''),
      ).toBe(line);
    }
  }
  expect(JSON.parse(demoCode['colors.json'].text).colors.accent).toBe('#7aa2f7');
  const escaped = String.raw`  "message": "quoted \"text\" <script>",`;
  expect(highlightDemoLine(escaped, 'json').filter(({ kind }) => kind === 'string')).toEqual([
    { kind: 'string', text: String.raw`"quoted \"text\" <script>"` },
  ]);
});

test('JSON, Rust and TOML previews render matching content with syntax colors', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Miller column', exact: true }).click();
  await page.getByRole('button', { name: 'colors.json', exact: true }).click();
  const preview = page.locator('.preview-code');
  const rendered = await preview.locator('code').allTextContents();
  expect(JSON.parse(rendered.join('\n'))).toEqual(JSON.parse(demoCode['colors.json'].text));
  await expect(page.locator('.preview-properties')).toContainText('application/json');
  await expect(preview.locator('.syntax-property').first()).toHaveText('"name"');
  await expect(preview.locator('.syntax-string').first()).toHaveText('"Tokyo Night"');
  await expect(preview.locator('.syntax-literal').first()).toHaveText('true');
  const colors = await preview
    .locator('.syntax-property, .syntax-string, .syntax-literal')
    .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color));
  expect(new Set(colors).size).toBe(3);
  await page.getByRole('button', { name: 'src', exact: true }).click();
  await expect(preview.locator('.syntax-keyword').first()).toHaveText('use');
  for (const name of ['main.rs', 'theme.rs', 'browser.rs']) {
    await page.getByRole('button', { name, exact: true }).click();
    expect((await preview.locator('code').allTextContents()).join('\n')).toBe(demoCode[name].text);
  }
  await page.getByRole('button', { name: 'Grid', exact: true }).click();
  await page.getByRole('button', { name: 'Navigate up', exact: true }).click();
  await page.getByRole('button', { name: 'Cargo.toml', exact: true }).click();
  expect((await preview.locator('code').allTextContents()).join('\n')).toBe(
    demoCode['Cargo.toml'].text,
  );
  await expect(page.locator('.preview-properties')).toContainText('application/toml');
});
