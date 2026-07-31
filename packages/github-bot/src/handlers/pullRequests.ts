import { Context } from "probot";
import { getHexColor } from "../utils/colors";
import { sendDiscordNotification, DiscordEmbed } from "../utils/discord";

export async function handlePullRequestEvent(
  context: Context<"pull_request">,
  eventName: string,
  emoji: string,
  colorName: any
) {
  const pr = context.payload.pull_request;
  const repository = context.payload.repository;
  const sender = context.payload.sender;
  const action = context.payload.action;

  let finalAction: string = action;
  let finalEmoji = emoji;
  let finalColor = colorName;
  let category: any = "pull_requests";

  if (action === "closed") {
    if (pr.merged) {
      finalAction = "merged";
      finalEmoji = "✅";
      finalColor = "Merged";
      category = "completed";
    } else {
      category = "pull_requests";
    }
  }

  const eventId = `${context.id}-pr-${finalAction}`;

  const fields = [
    {
      name: "📁 Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "🎯 Action",
      value: `${finalEmoji} PR ${finalAction.charAt(0).toUpperCase() + finalAction.slice(1)}`,
      inline: true,
    },
    {
      name: "🌿 Branch",
      value: `\`${pr.head.ref}\` → \`${pr.base.ref}\``,
      inline: false,
    },
  ];

  if (pr.labels && pr.labels.length > 0) {
    fields.push({
      name: "🏷️ Labels",
      value: pr.labels.map((l: any) => `\`${l.name}\``).join(", "),
      inline: false,
    });
  }

  // Show additions/deletions for merges
  if (pr.merged) {
    fields.push({
      name: "📊 Changes",
      value: `+${pr.additions} additions, -${pr.deletions} deletions across ${pr.changed_files} files`,
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    title: `#${pr.number} ${pr.title}`,
    url: pr.html_url,
    color: getHexColor(finalColor),
    author: {
      name: `${sender.login} ${finalAction} a pull request`,
      url: sender.html_url,
      icon_url: sender.avatar_url,
    },
    fields,
    footer: {
      text: repository.full_name,
    },
    timestamp: new Date().toISOString(),
  };

  await sendDiscordNotification(eventId, { embeds: [embed] }, category);
}
