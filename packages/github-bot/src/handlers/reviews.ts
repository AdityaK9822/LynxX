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
    finalAction = "requested changes";
    finalEmoji = "🟠";
    finalColor = "ChangesRequested";
  }

  const eventId = `${context.id}-pr-review-${review.id}`;

  const fields = [
    {
      name: "📁 Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "🎯 Status",
      value: `${finalEmoji} ${finalAction.charAt(0).toUpperCase() + finalAction.slice(1)}`,
      inline: true,
    },
  ];

  if (review.body) {
    fields.push({
      name: "💬 Comment",
      value: review.body.length > 200 ? review.body.substring(0, 197) + "..." : review.body,
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    title: `#${pr.number} ${pr.title}`,
    url: review.html_url,
    color: getHexColor(finalColor),
    author: {
      name: `${sender.login} ${finalAction} a PR`,
      url: sender.html_url,
      icon_url: sender.avatar_url,
    },
    fields,
    footer: {
      text: repository.full_name,
    },
    timestamp: new Date().toISOString(),
  };

  await sendDiscordNotification(eventId, { embeds: [embed] }, "pull_requests");
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
      name: "📁 Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "🎯 Action",
      value: `${emoji} Review Requested`,
      inline: true,
    },
  ];

  if (requestedReviewer) {
    fields.push({
      name: "👤 Reviewer",
      value: `[${requestedReviewer.login}](${requestedReviewer.html_url})`,
      inline: true,
    });
  }

  const embed: DiscordEmbed = {
    title: `#${pr.number} ${pr.title}`,
    url: pr.html_url,
    color: getHexColor(colorName),
    author: {
      name: `${sender.login} requested a review`,
      url: sender.html_url,
      icon_url: sender.avatar_url,
    },
    fields,
    footer: {
      text: repository.full_name,
    },
    timestamp: new Date().toISOString(),
  };

  await sendDiscordNotification(eventId, { embeds: [embed] }, "pull_requests");
}
