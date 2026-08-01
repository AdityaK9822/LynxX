# LynxX GitHub Discord Bot

A custom GitHub App built with [Probot](https://probot.github.io/) that listens to repository events and sends rich, color-coded embeds to a Discord Webhook.

## Features

- **Issue Tracking**: Sends notifications when issues are opened, closed, assigned, unassigned, or edited. The assigned notification includes a Discord mention for the contributor, milestone, priority, and description.
- **Pull Requests**: Notifies maintainers on PR creation with detailed stats (commits, files changed, additions, deletions, linked issues, branch info). On merge, posts a congratulations message to the completed contributions channel with full stats, merge time, and a first-contribution badge for new contributors.
- **Reviews**: Highlights when PR reviews are requested, approved, or if changes are requested.
- **Pushes**: Sends summaries of commits when code is pushed to `main` or `experimental` branches.
- **Releases**: Broadcasts new published releases.
- **Contributor Registration**: Contributors can self-register by commenting `!lynxx-register <discord_user_id>` on any issue. This links their GitHub username to their Discord ID for mentions.
- **First Contribution Badge**: When a contributor's PR is merged for the first time, a special first-contribution badge is displayed.
- **Deduplication**: Features a simple in-memory cache to prevent duplicate notifications.

## Environment Variables

Create a `.env` file in this directory with the following variables:

```env
# The ID of your GitHub App
APP_ID=
# The webhook secret you configured in the GitHub App
WEBHOOK_SECRET=
# The private key of your GitHub App
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Discord Webhook URLs (all optional — falls back to general)
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
DISCORD_WEBHOOK_GENERAL="https://discord.com/api/webhooks/..."
DISCORD_WEBHOOK_AVAILABLE_ISSUES="https://discord.com/api/webhooks/..."
DISCORD_WEBHOOK_CLAIMED_ISSUES="https://discord.com/api/webhooks/..."
DISCORD_WEBHOOK_PULL_REQUESTS="https://discord.com/api/webhooks/..."
DISCORD_WEBHOOK_COMPLETED="https://discord.com/api/webhooks/..."
DISCORD_WEBHOOK_COMPLETED_CONTRIBUTIONS="https://discord.com/api/webhooks/..."

# Comma-separated Discord user IDs of maintainers to ping when a PR is opened
MAINTAINER_DISCORD_IDS="123456789,987654321"

# Optional JSON string mapping GitHub usernames to Discord user IDs
# Takes priority over the contributor-map.json file
CONTRIBUTOR_MAP='{"githubuser1":"123456789","githubuser2":"987654321"}'
```

### Discord Webhook Channel Mapping

| Category | Env Var | Purpose |
|---|---|---|
| `general` | `DISCORD_WEBHOOK_GENERAL` / `DISCORD_WEBHOOK_URL` | Fallback for all events |
| `available_issues` | `DISCORD_WEBHOOK_AVAILABLE_ISSUES` | New issues opened |
| `claimed_issues` | `DISCORD_WEBHOOK_CLAIMED_ISSUES` | Issues assigned to contributors |
| `pull_requests` | `DISCORD_WEBHOOK_PULL_REQUESTS` | PRs opened, reopened, synchronized, reviews |
| `completed` | `DISCORD_WEBHOOK_COMPLETED` | Issues closed, general completed events |
| `completed_contributions` | `DISCORD_WEBHOOK_COMPLETED_CONTRIBUTIONS` | PRs merged (with contributor congratulations) |

### Contributor Registration

Contributors can self-register their Discord ID by commenting on any issue in the repository:

```
!lynxx-register 123456789012345678
```

The Discord user ID can be found by enabling **Developer Mode** in Discord settings, then right-clicking your username and selecting "Copy ID".

Once registered, the bot will mention you in Discord when:
- You are assigned to an issue
- Your PR gets merged

### Maintainer Discord Mentions

When a pull request is opened, the bot pings all Discord user IDs listed in `MAINTAINER_DISCORD_IDS` (comma-separated). This ensures maintainers are notified immediately when new contributions arrive.

## Setup & Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start local development:**
   ```bash
   pnpm run dev
   ```
   *Note: To receive webhooks locally, you can use [smee.io](https://smee.io/). Follow the instructions on the [Probot documentation](https://probot.github.io/docs/development/) to set up a smee channel and add the `WEBHOOK_PROXY_URL` to your `.env`.*

3. **Run tests:**
   ```bash
   pnpm test
   ```

4. **Build for production:**
   ```bash
   pnpm run build
   ```

## GitHub App Configuration

When creating the GitHub App, grant it the following **Repository Permissions**:
- **Issues**: Read & Write
- **Pull Requests**: Read & Write
- **Contents**: Read-only
- **Commit statuses**: Read-only
- **Deployments**: Read-only

Subscribe to the following **Events**:
- Issues
- Issue comment (required for contributor registration)
- Pull request
- Pull request review
- Push
- Release

## Deployment

This app is ready to be deployed to Render, Railway, Vercel, or any Node.js environment.

### Render / Railway
1. Connect your repository.
2. Set the Build Command to `pnpm install && pnpm --filter lynxx-github-bot run build`.
3. Set the Start Command to `pnpm --filter lynxx-github-bot run start`.
4. Add all the Environment Variables listed above in the dashboard.
5. For persistent contributor data, ensure the deployment has a persistent filesystem or use `CONTRIBUTOR_MAP` env var.

### Vercel
Probot can be deployed as serverless functions. See the [official guide on Vercel deployment](https://probot.github.io/docs/deployment/#vercel). For contributor mappings on serverless deployments, use the `CONTRIBUTOR_MAP` environment variable since the filesystem is ephemeral.
