import { Context } from "probot";
import { getHexColor } from "../utils/colors";
import { sendDiscordNotification, DiscordEmbed } from "../utils/discord";

export async function handlePullRequestReviewEvent(
  context: Context<"pull_request_review">,
  eventName: string,
  emoji: string,
  colorName: any
) {
  const review = context.payload.review;
  const pr = context.payload.pull_request;
  const repository = context.payload.repository;
  const sender = context.payload.sender;

  let finalAction = "reviewed";
  let finalEmoji = emoji;
  let finalColor = colorName;

  if (review.state === "approved") {
    finalAction = "approved";
    finalEmoji = "🟣";
    finalColor = "Approved";
  } else if (review.state === "changes_requested") {
    finalAction = "changes requested";
    finalEmoji = "🟠";
    finalColor = "ChangesRequested";
  }

  const eventId = `${context.id}-pr-review-${finalAction}`;

  const fields = [
    {
      name: "Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "Event Type",
      value: `${finalEmoji} PR Review ${finalAction}`,
      inline: true,
    },
  ];

  const embed: DiscordEmbed = {
    title: `#${pr.number} ${pr.title}`,
    url: review.html_url,
    color: getHexColor(finalColor),
    author: {
      name: sender.login,
      url: sender.html_url,
      icon_url: sender.avatar_url,
    },
    fields,
    timestamp: new Date().toISOString(),
  };

  await sendDiscordNotification(eventId, { embeds: [embed] });
}

export async function handlePullRequestReviewRequestEvent(
  context: Context<"pull_request">,
  eventName: string,
  emoji: string,
  colorName: any
) {
  const pr = context.payload.pull_request;
  const repository = context.payload.repository;
  const sender = context.payload.sender;
  const requestedReviewer = (context.payload as any).requested_reviewer;

  const eventId = `${context.id}-pr-review-request`;

  const fields = [
    {
      name: "Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "Event Type",
      value: `${emoji} Review Requested`,
      inline: true,
    },
  ];

  if (requestedReviewer) {
    fields.push({
      name: "Reviewer",
      value: requestedReviewer.login,
      inline: true,
    });
  }

  const embed: DiscordEmbed = {
    title: `#${pr.number} ${pr.title}`,
    url: pr.html_url,
    color: getHexColor(colorName),
    author: {
      name: sender.login,
      url: sender.html_url,
      icon_url: sender.avatar_url,
    },
    fields,
    timestamp: new Date().toISOString(),
  };

  await sendDiscordNotification(eventId, { embeds: [embed] });
}
