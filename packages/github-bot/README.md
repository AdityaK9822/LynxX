# LynxX GitHub Discord Bot

A custom GitHub App built with [Probot](https://probot.github.io/) that listens to repository events and sends rich, color-coded embeds to a Discord Webhook.

## Features

- **Issue Tracking**: Sends notifications when issues are opened, closed, assigned, unassigned, or edited.
- **Pull Requests**: Notifies the team on PR creation, closing, merging, and synchronization (new commits).
- **Reviews**: Highlights when PR reviews are requested, approved, or if changes are requested.
- **Pushes**: Sends summaries of commits when code is pushed to `main` or `experimental` branches.
- **Releases**: Broadcasts new published releases.
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
# Discord Webhook URL for the channel
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
```

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

3. **Build for production:**
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

### Vercel
Probot can be deployed as serverless functions. See the [official guide on Vercel deployment](https://probot.github.io/docs/deployment/#vercel).
