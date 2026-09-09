import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { formatWork, workCommand } from '../../src/lib/discord-work.ts';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});

function mock(handler) {
  process.env.UPSTASH_REDIS_REST_URL = 'https://storage.example';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only';
  process.env.GITHUB_API_TOKEN = 'test-only';
  globalThis.fetch = async (url, init) => Response.json(await handler(String(url), init));
}

function pull(overrides = {}) {
  return {
    number: 12,
    title: 'Improve navigation',
    url: 'https://github.com/lgse/strata/pull/12',
    isDraft: false,
    mergeable: 'MERGEABLE',
    reviewDecision: 'APPROVED',
    repository: { nameWithOwner: 'lgse/strata' },
    commits: { nodes: [{ commit: { statusCheckRollup: { state: 'SUCCESS' } } }] },
    ...overrides,
  };
}

test('unlinked user gets setup instructions, no GitHub request', async () => {
  mock((url, init) => {
    assert.equal(url, 'https://storage.example');
    assert.deepEqual(JSON.parse(init.body), ['GET', 'discord:github:123']);
    return { result: null };
  });
  assert.match(await workCommand('my-work', '123'), /github-link/);
});

test('link validates login and stores stable ID for caller only', async () => {
  const calls = [];
  mock((url, init) => {
    calls.push(url);
    if (url.endsWith('/users/Example')) return { login: 'Example', type: 'User', id: 456 };
    assert.deepEqual(JSON.parse(init.body), ['SET', 'discord:github:123', '456']);
    return { result: 'OK' };
  });
  assert.match(await workCommand('github-link', '123', 'Example'), /not verified/);
  assert.equal(calls.length, 2);
});

test('invalid usernames and organizations never write mappings', async () => {
  mock((url) => {
    assert.equal(url, 'https://api.github.com/users/example-org');
    return { login: 'example-org', type: 'Organization', id: 1 };
  });
  for (const username of ['', '../someone', 'a b', '-foo', 'foo--bar', 'a'.repeat(40)]) {
    assert.match(await workCommand('github-link', '123', username), /valid GitHub username/);
  }
  assert.match(await workCommand('github-link', '123', 'example-org'), /personal GitHub account/);
});

test('unlink deletes only the caller mapping', async () => {
  mock((_url, init) => {
    assert.deepEqual(JSON.parse(init.body), ['DEL', 'discord:github:789']);
    return { result: 1 };
  });
  assert.match(await workCommand('github-unlink', '789'), /removed/);
});

test('my-work resolves renamed account and scopes search to both repos', async () => {
  mock((url, init) => {
    if (url === 'https://storage.example') return { result: '456' };
    if (url.endsWith('/user/456')) return { login: 'renamed' };
    assert.equal(url, 'https://api.github.com/graphql');
    assert.equal(
      JSON.parse(init.body).variables.query,
      'is:pr is:open author:renamed repo:lgse/strata repo:lgse/strata-website sort:updated-desc',
    );
    return { data: { search: { issueCount: 1, nodes: [pull()] } } };
  });
  const result = await workCommand('my-work', '123');
  assert.match(result, /renamed/);
  assert.match(result, /CI: passing · approved · no conflicts/);
});

test('empty, draft, failing, unknown and conflict statuses are explicit', () => {
  assert.match(formatWork('example', { issueCount: 0, nodes: [] }), /No open PRs/);
  const result = formatWork('example', {
    issueCount: 2,
    nodes: [
      pull({
        isDraft: true,
        mergeable: 'CONFLICTING',
        reviewDecision: 'CHANGES_REQUESTED',
        commits: { nodes: [{ commit: { statusCheckRollup: { state: 'FAILURE' } } }] },
      }),
      pull({ mergeable: 'UNKNOWN', reviewDecision: null, commits: { nodes: [] } }),
    ],
  });
  assert.match(result, /Draft · CI: failing · changes requested · conflicts/);
  assert.match(result, /no checks reported · no review decision · mergeability pending/);
});

test('long output is bounded with count, full search link, and escaped titles', () => {
  const result = formatWork('example', {
    issueCount: 100,
    nodes: Array.from({ length: 20 }, () => pull({ title: '[fake](url) *title* '.repeat(20) })),
  });
  assert.ok(result.length <= 2000);
  assert.match(result, /Showing \d+ of 100/);
  assert.match(result, /View all PRs/);
  assert.ok(result.includes('\\[fake\\]'));
});

test('website PRs include pending checks and required reviews', () => {
  const result = formatWork('example', {
    issueCount: 1,
    nodes: [
      pull({
        repository: { nameWithOwner: 'lgse/strata-website' },
        url: 'https://github.com/lgse/strata-website/pull/12',
        reviewDecision: 'REVIEW_REQUIRED',
        commits: { nodes: [{ commit: { statusCheckRollup: { state: 'PENDING' } } }] },
      }),
    ],
  });
  assert.match(result, /lgse\/strata-website#12/);
  assert.match(result, /CI: pending · review required/);
});

test('storage and GraphQL errors propagate instead of reporting no PRs', async () => {
  mock(() => ({ error: 'unavailable' }));
  await assert.rejects(workCommand('my-work', '123'));
  mock((url) => {
    if (url === 'https://storage.example') return { result: '456' };
    if (url.endsWith('/user/456')) return { login: 'example' };
    return { errors: [{ message: 'rate limited' }] };
  });
  await assert.rejects(workCommand('my-work', '123'), /PR statuses/);
});
