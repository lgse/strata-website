# Discord PR commands

- `/github-link username:<login>` saves the caller's GitHub account for public PR tracking. Ownership is **not verified**; do not use these links for authorization or contributor roles. Linking again replaces the account.
- `/my-work` lists that account's open PRs in **lgse/strata** and **lgse/strata-website**, most recently updated first, with draft state, head-commit CI rollup, review decision, and merge conflicts.
- `/github-unlink` deletes the caller's saved mapping.

All replies are ephemeral. Guild and DM interactions use the caller's Discord user ID, never their display name. Redis stores only the Discord ID → stable GitHub ID mapping, with no automatic expiry. Account renames are resolved on each lookup. Unlinking deletes the mapping; configure storage access and backups accordingly.

## Setup

1. Create an Upstash Redis database (or compatible Redis REST service). Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` on the server. Persistent storage is required; local files/in-memory state are not suitable for Vercel.
2. Set `GITHUB_API_TOKEN` to a server-side GitHub token with read access to public repository metadata, pull requests, checks, and commit statuses on both repositories. A classic token with no scopes can read public resources; organization policies may impose additional restrictions. Do not grant write permissions. The existing `GITHUB_CHANGELOG_TOKEN` fallback is also supported.
3. Set `DISCORD_PUBLIC_KEY` from the Discord application's General Information page. Deploy and set the application's Interactions Endpoint URL to `https://<your-domain>/api/discord/interactions`.
4. Install the application with the `applications.commands` scope. Export `DISCORD_APPLICATION_ID` and `DISCORD_BOT_TOKEN` in your shell, then run:

   ```sh
   node scripts/register-discord-commands.mjs
   ```

   Set `DISCORD_GUILD_ID` for immediate test-server registration; omit it for global registration. The script upserts only the three commands above, preserving `/changelog`, `/repo-health`, and other existing commands. Avoid leaving duplicate guild and global registrations. Bot credentials are needed only for registration, not runtime replies. Never commit credentials.

## Changelog filtering

`/changelog` checks GitHub's commit-to-pull-request associations. A commit is excluded only when it is associated with a merged PR in `lgse/strata` carrying the exact, case-sensitive `skip-changelog` label. Direct commits, unlabeled PRs, and PRs from other repositories remain included. Association lookup failures return the generic temporary-unavailable message rather than silently including unverified commits.

## Behavior and limits

Commands acknowledge immediately and finish via a deferred private reply using Next.js `after`. The hosting platform must support post-response work (Vercel and the Next.js Node server do). GitHub/storage failures produce a private retry message without changing an existing link when username validation fails.

The response fits Discord's 2,000-character limit and shows up to 20 recently updated PRs, fewer when necessary. A total and filtered GitHub link expose the remainder. GitHub search may briefly lag updates. “No checks reported” and “mergeability pending” are distinct from success; “no conflicts” is not a guarantee that branch protections allow merging. Review decisions reflect GitHub's aggregate decision, not a count of individual reviews.

Run focused unit tests with `node --experimental-strip-types --test scripts/tests/discord-work.test.mjs`.
