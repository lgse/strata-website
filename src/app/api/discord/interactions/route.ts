import { createPublicKey, verify } from 'node:crypto';

export const runtime = 'nodejs';

const repository = 'lgse/strata';
const githubApi = `https://api.github.com/repos/${repository}`;
const discordEphemeral = 1 << 6;
const publicKeyPrefix = Buffer.from('302a300506032b6570032100', 'hex');

type Release = {
  tag_name: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
  published_at: string | null;
};

type Comparison = {
  commits: Array<{
    sha: string;
    html_url: string;
    commit: { message: string };
  }>;
  total_commits: number;
  permalink_url: string;
};

type Repository = {
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number;
  open_issues_count: number;
  pushed_at: string;
};

type Issue = {
  pull_request?: unknown;
  labels: Array<{ name: string }>;
  assignees: unknown[];
  updated_at: string;
};

type PullRequest = { draft: boolean };

type WorkflowRuns = {
  workflow_runs: Array<{
    status: string;
    conclusion: string | null;
    html_url: string;
  }>;
};

type Interaction = {
  type: number;
  data?: {
    name?: string;
    options?: Array<{ name: string; value: string }>;
  };
};

type ChangelogChannel = 'stable' | 'rc' | 'preview';

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'strata-discord-commands',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_API_TOKEN || process.env.GITHUB_CHANGELOG_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function verifyDiscordRequest(body: string, signature: string | null, timestamp: string | null) {
  const key = process.env.DISCORD_PUBLIC_KEY;
  if (!key || !signature || !timestamp || !/^[a-f\d]{64}$/i.test(key)) return false;
  try {
    const publicKey = createPublicKey({
      key: Buffer.concat([publicKeyPrefix, Buffer.from(key, 'hex')]),
      format: 'der',
      type: 'spki',
    });
    return verify(null, Buffer.from(timestamp + body), publicKey, Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

function releaseTime(release: Release) {
  return release.published_at ? Date.parse(release.published_at) : 0;
}

function baselineFor(channel: ChangelogChannel, releases: Release[]) {
  const published = releases.filter((release) => !release.draft && release.published_at);
  const stable = published.find((release) => !release.prerelease);
  if (!stable) throw new Error('No stable Strata release is available.');
  if (channel === 'stable') return stable;

  const prerelease = published.find((release) => {
    if (!release.prerelease) return false;
    return channel === 'rc' ? /-rc(?:\.|$)/i.test(release.tag_name) : true;
  });
  return prerelease && releaseTime(prerelease) > releaseTime(stable) ? prerelease : stable;
}

async function githubJson<T>(path: string, revalidate = 60): Promise<T> {
  const result = await fetch(`${githubApi}${path}`, {
    headers: githubHeaders(),
    next: { revalidate },
  });
  if (!result.ok) throw new Error(`GitHub request failed (${result.status}).`);
  return result.json() as Promise<T>;
}

async function upcomingChangelog(channel: ChangelogChannel) {
  const releasesResponse = await fetch(`${githubApi}/releases?per_page=100`, {
    headers: githubHeaders(),
    next: { revalidate: 60 },
  });
  if (!releasesResponse.ok) throw new Error('Could not load Strata releases.');
  const releases = (await releasesResponse.json()) as Release[];
  const baseline = baselineFor(channel, releases);

  const comparisonResponse = await fetch(
    `${githubApi}/compare/${encodeURIComponent(baseline.tag_name)}...main`,
    { headers: githubHeaders(), next: { revalidate: 60 } },
  );
  if (!comparisonResponse.ok) throw new Error('Could not generate the upcoming changelog.');
  const comparison = (await comparisonResponse.json()) as Comparison;
  const label = channel === 'rc' ? 'RC' : channel[0].toUpperCase() + channel.slice(1);
  const heading = `**Upcoming ${label} changelog**\nSince [${baseline.tag_name}](${baseline.html_url})\n\n`;
  const footer = `\n\n[View the complete comparison](${comparison.permalink_url})`;
  const available = 2_000 - heading.length - footer.length;
  const changes = comparison.commits.map((commit) => {
    const title = commit.commit.message.split('\n', 1)[0];
    return `- [${title}](${commit.html_url})`;
  });
  let body = changes.join('\n') || 'No changes have landed yet.';
  if (body.length > available) body = `${body.slice(0, available - 3).trimEnd()}...`;
  return heading + body + footer;
}

function labelCount(issues: Issue[], ...labels: string[]) {
  const wanted = new Set(labels);
  return issues.filter((issue) => issue.labels.some((label) => wanted.has(label.name))).length;
}

async function repositoryHealth() {
  const [repo, openItems, pulls, releases, workflows] = await Promise.all([
    githubJson<Repository>('', 300),
    githubJson<Issue[]>('/issues?state=open&per_page=100', 60),
    githubJson<PullRequest[]>('/pulls?state=open&per_page=100', 60),
    githubJson<Release[]>('/releases?per_page=1', 300),
    githubJson<WorkflowRuns>('/actions/workflows/ci.yml/runs?branch=main&per_page=1', 60),
  ]);
  const issues = openItems.filter((issue) => !issue.pull_request);
  const issueCount = Math.max(issues.length, repo.open_issues_count - pulls.length);
  const staleBefore = Date.now() - 30 * 24 * 60 * 60 * 1_000;
  const stale = issues.filter((issue) => Date.parse(issue.updated_at) < staleBefore).length;
  const drafts = pulls.filter((pull) => pull.draft).length;
  const latest = releases[0];
  const workflow = workflows.workflow_runs[0];
  const workflowState = !workflow
    ? 'Unknown'
    : workflow.status !== 'completed'
      ? '⏳ Running'
      : workflow.conclusion === 'success'
        ? '✅ Passing'
        : '❌ Failing';
  const workflowLink = workflow ? `[${workflowState}](${workflow.html_url})` : workflowState;
  const latestRelease = latest
    ? `[${latest.tag_name}](${latest.html_url})${
        latest.published_at ? ` · <t:${Math.floor(Date.parse(latest.published_at) / 1_000)}:R>` : ''
      }`
    : 'None';
  const pushed = Math.floor(Date.parse(repo.pushed_at) / 1_000);

  return [
    '**Strata repository health**',
    `⭐ **${repo.stargazers_count.toLocaleString()}** stars · 🍴 **${repo.forks_count.toLocaleString()}** forks · 👀 **${repo.subscribers_count.toLocaleString()}** watching`,
    '',
    '**Work queue**',
    `- Pull requests: **${pulls.length}** open${drafts ? ` · ${drafts} draft` : ''}`,
    `- Issues: **${issueCount}** open`,
    `- Bugs: **${labelCount(issues, 'bug')}**`,
    `- Feature requests: **${labelCount(issues, 'enhancement', 'feature request')}**`,
    `- Security: **${labelCount(issues, 'security')}**`,
    `- Needs more information: **${labelCount(issues, 'more info needed')}**`,
    `- With a linked PR: **${labelCount(issues, 'PR opened')}**`,
    `- Unassigned: **${issues.filter((issue) => issue.assignees.length === 0).length}**`,
    `- Stale for 30+ days: **${stale}**`,
    '',
    '**Delivery**',
    `- Main CI: ${workflowLink}`,
    `- Latest release: ${latestRelease}`,
    `- Last push: <t:${pushed}:R>`,
    '',
    `[Open repository](${repo.html_url})`,
  ].join('\n');
}

function response(content: string, status = 200) {
  return Response.json(
    { type: 4, data: { content, flags: discordEphemeral, allowed_mentions: { parse: [] } } },
    { status },
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  if (
    !verifyDiscordRequest(
      body,
      request.headers.get('x-signature-ed25519'),
      request.headers.get('x-signature-timestamp'),
    )
  )
    return new Response('Invalid request signature', { status: 401 });

  let interaction: Interaction;
  try {
    interaction = JSON.parse(body) as Interaction;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  if (interaction.type === 1) return Response.json({ type: 1 });
  if (interaction.type !== 2) return response('Unknown command.');

  try {
    if (interaction.data?.name === 'repo-health') return response(await repositoryHealth());
    if (interaction.data?.name === 'changelog') {
      const requested = interaction.data.options?.find(
        (option) => option.name === 'channel',
      )?.value;
      const channel: ChangelogChannel =
        requested === 'rc' || requested === 'preview' ? requested : 'stable';
      return response(await upcomingChangelog(channel));
    }
    return response('Unknown command.');
  } catch (error) {
    console.error(`Discord ${interaction.data?.name || 'unknown'} command failed`, error);
    return response('Repository information is temporarily unavailable. Please try again.');
  }
}
