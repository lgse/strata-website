import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { upcomingChangelog } from '../../src/lib/discord-changelog.ts';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});

const releases = [
  {
    tag_name: 'v1.0.0',
    html_url: 'https://github.com/lgse/strata/releases/tag/v1.0.0',
    prerelease: false,
    draft: false,
    published_at: '2025-01-01T00:00:00Z',
  },
];
const commit = (sha, title) => ({
  sha,
  html_url: `https://github.com/lgse/strata/commit/${sha}`,
  commit: { message: title },
});

function mock(handler) {
  process.env.GITHUB_API_TOKEN = 'test-only';
  globalThis.fetch = (url, init) => handler(String(url), init);
}

function json(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
}

test('excludes only merged same-repository PRs labeled exactly skip-changelog', async () => {
  const commits = [commit('skip', 'Merged skipped PR'), commit('keep', 'Merged kept PR'), commit('direct', 'Direct commit')];
  mock((url) => {
    if (url.endsWith('/releases?per_page=100')) return json(releases);
    if (url.includes('/compare/')) return json({ commits, permalink_url: 'https://github.com/compare' });
    if (url.includes('/commits/skip/')) return json([
      { merged_at: '2025-01-02T00:00:00Z', labels: [{ name: 'skip-changelog' }], repository: { full_name: 'lgse/strata' } },
    ]);
    if (url.includes('/commits/keep/')) return json([
      { merged_at: '2025-01-02T00:00:00Z', labels: [{ name: 'Skip-Changelog' }], repository: { full_name: 'lgse/strata' } },
    ]);
    if (url.includes('/commits/direct/')) return json([]);
    throw new Error(`unexpected request ${url}`);
  });
  const result = await upcomingChangelog('stable');
  assert.doesNotMatch(result, /Merged skipped PR/);
  assert.match(result, /Merged kept PR/);
  assert.match(result, /Direct commit/);
});

test('paginates commit associations and preserves PRs from another repository', async () => {
  const calls = [];
  mock((url) => {
    calls.push(url);
    if (url.endsWith('/releases?per_page=100')) return json(releases);
    if (url.includes('/compare/')) return json({ commits: [commit('many', 'Skipped after page one'), commit('other', 'Other repository')], permalink_url: 'https://github.com/compare' });
    if (url.includes('/commits/many/') && url.includes('&page=1')) return json([], { headers: { link: '<next>; rel="next"' } });
    if (url.includes('/commits/many/') && url.includes('&page=2')) return json([
      { merged_at: '2025-01-02T00:00:00Z', labels: [{ name: 'skip-changelog' }], repository: { full_name: 'lgse/strata' } },
    ]);
    if (url.includes('/commits/other/')) return json([
      { merged_at: '2025-01-02T00:00:00Z', labels: [{ name: 'skip-changelog' }], repository: { full_name: 'someone/fork' } },
    ]);
    throw new Error(`unexpected request ${url}`);
  });
  const result = await upcomingChangelog('stable');
  assert.doesNotMatch(result, /Skipped after page one/);
  assert.match(result, /Other repository/);
  assert.equal(calls.filter((url) => url.includes('/commits/many/')).length, 2);
});

test('association errors fail the changelog instead of silently including commits', async () => {
  mock((url) => {
    if (url.endsWith('/releases?per_page=100')) return json(releases);
    if (url.includes('/compare/')) return json({ commits: [commit('error', 'Unknown metadata')], permalink_url: 'https://github.com/compare' });
    return new Response('unavailable', { status: 503 });
  });
  await assert.rejects(upcomingChangelog('stable'));
});

test('all excluded commits use the empty changelog message', async () => {
  mock((url) => {
    if (url.endsWith('/releases?per_page=100')) return json(releases);
    if (url.includes('/compare/')) return json({ commits: [commit('skip', 'Skipped')], permalink_url: 'https://github.com/compare' });
    return json([{ merged_at: '2025-01-02T00:00:00Z', labels: [{ name: 'skip-changelog' }], repository: { full_name: 'lgse/strata' } }]);
  });
  const result = await upcomingChangelog('stable');
  assert.match(result, /No changelog entries to show/);
  assert.doesNotMatch(result, /Skipped/);
});

test('uses one operation signal and stops scheduling batches after abort', async () => {
  const controller = new AbortController();
  const signals = [];
  const commits = Array.from({ length: 5 }, (_, index) => commit(`sha-${index}`, `Change ${index}`));
  let associationCalls = 0;
  mock((url, init) => {
    signals.push(init.signal);
    if (url.endsWith('/releases?per_page=100')) return json(releases);
    if (url.includes('/compare/')) return json({ commits, permalink_url: 'https://github.com/compare' });
    associationCalls += 1;
    if (associationCalls === 1) controller.abort();
    return json([]);
  });

  await assert.rejects(upcomingChangelog('stable', controller.signal));
  assert.equal(new Set(signals).size, 1);
  assert.equal(signals[0], controller.signal);
  assert.equal(associationCalls, 4);
});
