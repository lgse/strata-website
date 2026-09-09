import { createPublicKey, verify } from 'node:crypto';
import { after } from 'next/server';
import { upcomingChangelog } from '@/lib/discord-changelog';

export const runtime = 'nodejs';
export const maxDuration = 60;

const githubApi = 'https://api.github.com/repos/lgse/strata';
const discordEphemeral = 1 << 6;
const publicKeyPrefix = Buffer.from('302a300506032b6570032100', 'hex');

type Release = {
  tag_name: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
  published_at: string | null;
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
  application_id?: string;
  token?: string;
  data?: {
    name?: string;
    options?: Array<{ name: string; value: string }>;
  };
};

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

async function githubJson<T>(path: string, revalidate = 60): Promise<T> {
  const result = await fetch(`${githubApi}${path}`, {
    headers: githubHeaders(),
    next: { revalidate },
  });
  if (!result.ok) throw new Error(`GitHub request failed (${result.status}).`);
  return result.json() as Promise<T>;
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

  if (interaction.data?.name === 'changelog') {
    const applicationId = interaction.application_id;
    const token = interaction.token;
    if (!applicationId || !token) return response('Missing Discord interaction details.');
    const requested = interaction.data.options?.find((option) => option.name === 'channel')?.value;
    const channel = requested === 'rc' || requested === 'preview' ? requested : 'stable';
    after(async () => {
      let content: string;
      try {
        content = await upcomingChangelog(channel);
      } catch {
        console.error('Discord changelog command failed');
        content = 'Repository information is temporarily unavailable. Please try again.';
      }
      try {
        const result = await fetch(
          `https://discord.com/api/v10/webhooks/${encodeURIComponent(applicationId)}/${encodeURIComponent(token)}/messages/@original`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
            signal: AbortSignal.timeout(8_000),
          },
        );
        if (!result.ok) console.error('Discord deferred reply failed', result.status);
      } catch {
        console.error('Discord deferred reply failed');
      }
    });
    return Response.json({ type: 5, data: { flags: discordEphemeral } });
  }

  try {
    if (interaction.data?.name === 'repo-health') return response(await repositoryHealth());
    return response('Unknown command.');
  } catch (error) {
    console.error(`Discord ${interaction.data?.name || 'unknown'} command failed`, error);
    return response('Repository information is temporarily unavailable. Please try again.');
  }
}
