// Same-origin endpoint: visitors never contact GitHub directly. The successful
// upstream response is cached by Next for one hour, shared across visitors.
export async function GET() {
  try {
    const response = await fetch('https://api.github.com/repos/lgse/strata', {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'strata-website',
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error('GitHub unavailable');
    const data: unknown = await response.json();
    const stars =
      data && typeof data === 'object' && 'stargazers_count' in data ? data.stargazers_count : null;
    if (typeof stars !== 'number' || !Number.isSafeInteger(stars) || stars < 0) {
      throw new Error('Invalid GitHub star count');
    }
    return Response.json(
      { stars },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch {
    // Never turn an outage/rate limit into a misleading zero, or cache it for an hour.
    return Response.json(
      { stars: null },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
