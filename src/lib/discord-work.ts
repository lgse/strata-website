const repositories = ['lgse/strata', 'lgse/strata-website'];
const usernamePattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

async function redis(command: string[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Account storage is not configured');
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error('Account storage request failed');
  const body = (await response.json()) as { result: unknown; error?: string };
  if (body.error) throw new Error('Account storage command failed');
  return body.result;
}

async function github<T>(path: string, body?: object): Promise<T> {
  const token = process.env.GITHUB_API_TOKEN || process.env.GITHUB_CHANGELOG_TOKEN;
  if (!token) throw new Error('GitHub token is not configured');
  const response = await fetch(`https://api.github.com${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'strata-discord-commands',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GitHub request failed (${response.status})`);
  return response.json() as Promise<T>;
}

type Pull = {
  number: number;
  title: string;
  url: string;
  isDraft: boolean;
  mergeable: string;
  reviewDecision: string | null;
  repository: { nameWithOwner: string };
  commits: { nodes: Array<{ commit: { statusCheckRollup: { state: string } | null } }> };
};

type Search = { issueCount: number; nodes: Pull[] };

function text(value: string) {
  return value.replace(/[\r\n]/g, ' ').replace(/([\\`*_{}\[\]()<>~|])/g, '\\$1');
}

export function formatWork(login: string, search: Search) {
  const query = `is:pr is:open author:${login} ${repositories.map((repo) => `repo:${repo}`).join(' ')}`;
  const footer = `\n[View all PRs](https://github.com/pulls?q=${encodeURIComponent(query)})`;
  let content = `**Open PRs for ${text(login)}** · ${search.issueCount}\n`;
  let shown = 0;
  for (const pull of search.nodes) {
    // Never include a repository outside the command's scope.
    if (!repositories.includes(pull.repository.nameWithOwner)) continue;
    const checks = pull.commits.nodes[0]?.commit.statusCheckRollup?.state;
    const ci = checks
      ? {
          SUCCESS: 'passing',
          FAILURE: 'failing',
          ERROR: 'error',
          PENDING: 'pending',
          EXPECTED: 'expected',
        }[checks] || 'unknown'
      : 'no checks reported';
    const review =
      {
        APPROVED: 'approved',
        CHANGES_REQUESTED: 'changes requested',
        REVIEW_REQUIRED: 'review required',
      }[pull.reviewDecision || ''] || 'no review decision';
    const merge =
      { MERGEABLE: 'no conflicts', CONFLICTING: 'conflicts', UNKNOWN: 'mergeability pending' }[
        pull.mergeable
      ] || 'mergeability unknown';
    const line = `\n[${pull.repository.nameWithOwner}#${pull.number}](${pull.url}) — ${text(pull.title.slice(0, 100))}\n${pull.isDraft ? 'Draft' : 'Open'} · CI: ${ci} · ${review} · ${merge}\n`;
    if (content.length + line.length + footer.length + 80 > 2_000) break;
    content += line;
    shown++;
  }
  if (!search.issueCount) content += '\nNo open PRs in lgse/strata or lgse/strata-website.\n';
  else if (shown < search.issueCount)
    content += `\nShowing ${shown} of ${search.issueCount} PRs.\n`;
  return content + footer;
}

export async function workCommand(name: string, userId: string, username?: string) {
  if (!/^\d+$/.test(userId)) throw new Error('Invalid Discord user');
  const key = `discord:github:${userId}`;
  if (name === 'github-unlink') {
    await redis(['DEL', key]);
    return 'Your saved GitHub account link has been removed.';
  }
  if (name === 'github-link') {
    if (!username || !usernamePattern.test(username) || username.includes('--')) {
      return 'Provide a valid GitHub username: `/github-link username:your-username`.';
    }
    const user = await github<{ login: string; type: string; id: number }>(
      `/users/${encodeURIComponent(username)}`,
    );
    if (user.type !== 'User') return 'Please link a personal GitHub account, not an organization.';
    await redis(['SET', key, String(user.id)]);
    return `Saved GitHub account **${text(user.login)}**. This is a self-declared link, not verified ownership. Run /my-work to see open PRs; /github-unlink removes the link.`;
  }
  const id = await redis(['GET', key]);
  if (id === null)
    return 'First save your GitHub username with `/github-link username:your-username`.';
  if (typeof id !== 'string' || !/^\d+$/.test(id)) throw new Error('Invalid saved account');
  // Store the stable GitHub ID so renaming an account does not break the link.
  const user = await github<{ login: string }>(`/user/${id}`);
  if (!usernamePattern.test(user.login)) throw new Error('Invalid GitHub login');
  const result = await github<{ data?: { search: Search }; errors?: unknown[] }>('/graphql', {
    query: `query($query: String!) {
      search(query: $query, type: ISSUE, first: 20) {
        issueCount
        nodes { ... on PullRequest {
          number title url isDraft mergeable reviewDecision
          repository { nameWithOwner }
          commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
        } }
      }
    }`,
    variables: {
      query: `is:pr is:open author:${user.login} repo:lgse/strata repo:lgse/strata-website sort:updated-desc`,
    },
  });
  if (result.errors?.length || !result.data) throw new Error('Could not load PR statuses');
  return formatWork(user.login, result.data.search);
}
