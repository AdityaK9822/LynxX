import { Context } from "probot";
import { getHexColor } from "../utils/colors";
import { sendDiscordNotification, DiscordEmbed } from "../utils/discord";

export async function handleIssueEvent(
  context: Context<"issues">,
  eventName: string,
  emoji: string,
  colorName: any
) {
  const issue = context.payload.issue;
  const repository = context.payload.repository;
  const sender = context.payload.sender;
  const action = context.payload.action;

  const eventId = `${context.id}-issue-${action}`;

  const fields = [
    {
      name: "Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "Event Type",
      value: `${emoji} Issue ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      inline: true,
    },
  ];

  if (issue.labels && issue.labels.length > 0) {
    fields.push({
      name: "Labels",
      value: issue.labels.map((l) => `\`${l.name}\``).join(", "),
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    title: `#${issue.number} ${issue.title}`,
    url: issue.html_url,
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
