import { Context } from "probot";
import { registerContributor, isRegistered, getDiscordId } from "../utils/contributors";

const REGISTER_COMMAND = /^!lynxx-register\s+(\d{17,20})(?:\s|$)/;

export async function handleIssueCommentEvent(
  context: Context<"issue_comment">
): Promise<void> {
  const action = context.payload.action;
  if (action !== "created") return;

  const comment = context.payload.comment;
  const sender = context.payload.sender;
  const issue = context.payload.issue;
  const body = comment.body.trim();

  const match = body.match(REGISTER_COMMAND);
  if (!match) return;

  const discordId = match[1];
  const githubUsername = sender.login;

  if (isRegistered(githubUsername) && getDiscordId(githubUsername) !== discordId) {
    await replyWithError(
      context,
      `@${githubUsername} you are already registered with a different Discord ID. ` +
        `Contact a maintainer if you need to update your mapping.`
    );
    return;
  }

  const changed = registerContributor(githubUsername, discordId);
  if (!changed) {
    await replyWithConfirmation(
      context,
      `@${githubUsername} you are already registered with Discord ID \`${discordId}\`.`
    );
    return;
  }

  await replyWithConfirmation(
    context,
    `@${githubUsername} you have been registered! ` +
      `Your GitHub username \`${githubUsername}\` is now linked to Discord ID \`${discordId}\`.`
  );

  context.log.info(`Registered contributor: ${githubUsername} -> ${discordId}`);
}

async function replyWithConfirmation(
  context: Context<"issue_comment">,
  body: string
): Promise<void> {
  try {
    await context.octokit.issues.createComment(
      context.repo({ issue_number: context.payload.issue.number, body })
    );
  } catch (err: any) {
    context.log.error(`Failed to reply to registration comment: ${err.message}`);
  }
}

async function replyWithError(
  context: Context<"issue_comment">,
  body: string
): Promise<void> {
  try {
    await context.octokit.issues.createComment(
      context.repo({ issue_number: context.payload.issue.number, body })
    );
  } catch (err: any) {
    context.log.error(`Failed to reply to registration comment: ${err.message}`);
  }
}
