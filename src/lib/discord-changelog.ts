const repository = 'lgse/strata';
const githubApi = `https://api.github.com/repos/${repository}`;
const maxAssociationPages = 10;
const associationConcurrency = 4;
const operationTimeout = 40_000;

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
  permalink_url: string;
};

type PullRequestAssociation = {
  merged_at?: string | null;
  labels?: Array<{ name: string }>;
  repository?: { full_name?: string };
  base?: { repo?: { full_name?: string } };
};

export type ChangelogChannel = 'stable' | 'rc' | 'preview';

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

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw signal.reason ?? new Error('Changelog operation was aborted.');
}

async function githubJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const result = await fetch(`${githubApi}${path}`, {
    headers: githubHeaders(),
    next: { revalidate: 60 },
    signal,
  });
  if (!result.ok) throw new Error(`GitHub request failed (${result.status}).`);
  return result.json() as Promise<T>;
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

function hasNextPage(link: string | null) {
  return link?.split(',').some((part) => /rel="next"/.test(part)) ?? false;
}

async function commitHasSkippedPullRequest(sha: string, signal: AbortSignal) {
  for (let page = 1; page <= maxAssociationPages; page += 1) {
    const response = await fetch(
      `${githubApi}/commits/${encodeURIComponent(sha)}/pulls?per_page=100&page=${page}`,
      { headers: githubHeaders(), next: { revalidate: 60 }, signal },
    );
    if (!response.ok) throw new Error(`Could not load pull requests for commit (${response.status}).`);
    const pulls = (await response.json()) as PullRequestAssociation[];
    if (
      pulls.some(
        (pull) =>
          pull.merged_at &&
          (pull.repository?.full_name || pull.base?.repo?.full_name) === repository &&
          pull.labels?.some((label) => label.name === 'skip-changelog'),
      )
    )
      return true;
    if (pulls.length < 100 && !hasNextPage(response.headers.get('link'))) return false;
  }
  throw new Error('Too many pull request association pages.');
}

async function filterCommits(commits: Comparison['commits'], signal: AbortSignal) {
  const kept: Comparison['commits'] = [];
  for (let start = 0; start < commits.length; start += associationConcurrency) {
    throwIfAborted(signal);
    const batch = commits.slice(start, start + associationConcurrency);
    const excluded = await Promise.all(
      batch.map((commit) => commitHasSkippedPullRequest(commit.sha, signal)),
    );
    batch.forEach((commit, index) => {
      if (!excluded[index]) kept.push(commit);
    });
  }
  return kept;
}

export async function upcomingChangelog(
  channel: ChangelogChannel,
  signal: AbortSignal = AbortSignal.timeout(operationTimeout),
) {
  const releases = await githubJson<Release[]>('/releases?per_page=100', signal);
  const baseline = baselineFor(channel, releases);
  const comparison = await githubJson<Comparison>(
    `/compare/${encodeURIComponent(baseline.tag_name)}...main`,
    signal,
  );
  const commits = await filterCommits(comparison.commits, signal);
  const label = channel === 'rc' ? 'RC' : channel[0].toUpperCase() + channel.slice(1);
  const heading = `**Upcoming ${label} changelog**\nSince [${baseline.tag_name}](${baseline.html_url})\n\n`;
  const footer = `\n\n[View the complete comparison](${comparison.permalink_url})`;
  const available = 2_000 - heading.length - footer.length;
  const changes = commits.map((commit) => {
    const title = commit.commit.message.split('\n', 1)[0];
    return `- [${title}](${commit.html_url})`;
  });
  let body = changes.join('\n') || 'No changelog entries to show.';
  if (body.length > available) body = `${body.slice(0, available - 3).trimEnd()}...`;
  return heading + body + footer;
}
