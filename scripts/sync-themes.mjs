import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Strata's catalog is deliberately a flat array of string-valued TOML tables.
// Reject schema changes instead of silently producing an incomplete palette.
const source = resolve(process.argv[2] ?? '../strata/data/themes/catalog.toml');
const text = await readFile(source, 'utf8');
const keys = [
  'id',
  'name',
  'background',
  'surface',
  'text',
  'accent',
  'danger',
  'muted',
  'highlight',
  'border',
  'dim_text',
];
const themes = text
  .split('[[themes]]')
  .slice(1)
  .map((block) => {
    const entries = [...block.matchAll(/^(\w+)\s*=\s*"([^"]+)"\s*$/gm)];
    const theme = Object.fromEntries(entries.map(([, key, value]) => [key, value]));
    const contentLines = block
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#'));
    if (
      entries.length !== keys.length ||
      contentLines.length !== keys.length ||
      Object.keys(theme).length !== keys.length ||
      Object.keys(theme).some((key) => !keys.includes(key))
    ) {
      throw new Error(`Unexpected theme schema in ${theme.id ?? 'unnamed theme'}`);
    }
    for (const key of keys) {
      if (!theme[key] || (!['id', 'name'].includes(key) && !/^#[\da-f]{6}$/i.test(theme[key]))) {
        throw new Error(`Invalid ${key} in ${theme.id ?? 'unnamed theme'}`);
      }
    }
    return theme;
  });
if (!themes.length || new Set(themes.map((theme) => theme.id)).size !== themes.length)
  throw new Error('Empty catalog or duplicate IDs');
if (!themes.some((theme) => theme.id === 'tokyo-night')) throw new Error('Missing default theme');
themes.sort((a, b) => a.name.localeCompare(b.name));
await writeFile(
  new URL('../src/lib/themes.json', import.meta.url),
  JSON.stringify(themes, null, 2) + '\n',
);
console.log(`Synced ${themes.length} Strata themes from ${source}`);
