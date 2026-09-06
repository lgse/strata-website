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
    'User-Agent': 'strata-discord-changelog',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_CHANGELOG_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_CHANGELOG_TOKEN}`;
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
  if (interaction.type !== 2 || interaction.data?.name !== 'changelog')
    return response('Unknown command.');

  const requested = interaction.data.options?.find((option) => option.name === 'channel')?.value;
  const channel: ChangelogChannel =
    requested === 'rc' || requested === 'preview' ? requested : 'stable';
  try {
    return response(await upcomingChangelog(channel));
  } catch (error) {
    console.error('Discord changelog command failed', error);
    return response('The upcoming changelog is temporarily unavailable. Please try again.');
  }
}
