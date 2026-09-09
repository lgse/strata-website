// POST upserts only these commands; existing commands are not deleted.
const { DISCORD_APPLICATION_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID } = process.env;
if (!DISCORD_APPLICATION_ID || !DISCORD_BOT_TOKEN) {
  throw new Error('Set DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN');
}
const commands = [
  {
    name: 'github-link',
    description: 'Save your GitHub username for public PR tracking (not verified)',
    options: [
      {
        type: 3,
        name: 'username',
        description: 'Your GitHub username',
        required: true,
        max_length: 39,
      },
    ],
  },
  { name: 'github-unlink', description: 'Remove your saved GitHub account link' },
  {
    name: 'my-work',
    description: 'Your open PRs and statuses in lgse/strata and lgse/strata-website',
  },
];
const scope = DISCORD_GUILD_ID ? `/guilds/${DISCORD_GUILD_ID}` : '';
for (const command of commands) {
  const result = await fetch(
    `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}${scope}/commands`,
    {
      method: 'POST',
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 1, ...command }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!result.ok) throw new Error(`Registration failed for ${command.name} (${result.status})`);
  console.log(`Registered /${command.name}`);
}
