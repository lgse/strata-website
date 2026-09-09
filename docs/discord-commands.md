# Discord changelog command

`/changelog` shows the upcoming changelog for the selected channel (`stable`, `rc`, or `preview`). Replies are private and may be deferred while repository information is retrieved.

Set `DISCORD_PUBLIC_KEY` from the Discord application's General Information page, deploy, and set the application's Interactions Endpoint URL to `https://<your-domain>/api/discord/interactions`. A GitHub token is optional for public repositories; configure `GITHUB_API_TOKEN` (or the existing `GITHUB_CHANGELOG_TOKEN` fallback) if required by API rate limits or organization policy. Never commit credentials.

## `skip-changelog` filtering

The command checks GitHub's commit-to-pull-request associations. A commit is excluded only when it is associated with a merged pull request in `lgse/strata` carrying the exact, case-sensitive `skip-changelog` label. Direct commits, unlabeled pull requests, and pull requests from other repositories remain included. Association lookup failures return a generic temporary-unavailable message rather than silently including unverified commits.
