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

  // Route to the right Discord channel based on action
  let category: any = "general";
  if (action === "opened") category = "available_issues";
  else if (action === "assigned") category = "claimed_issues";
  else if (action === "closed") category = "completed";

  const fields = [
    {
      name: "📁 Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "🎯 Action",
      value: `${emoji} Issue ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      inline: true,
    },
  ];

  // Add assignee field if someone is assigned
  const assignee = (context.payload as any).assignee;
  if (assignee) {
    fields.push({
      name: "👤 Assignee",
      value: `[${assignee.login}](${assignee.html_url})`,
      inline: true,
    });
  }

  if (issue.labels && issue.labels.length > 0) {
    fields.push({
      name: "🏷️ Labels",
      value: issue.labels.map((l: any) => `\`${l.name}\``).join(", "),
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    title: `#${issue.number} ${issue.title}`,
    url: issue.html_url,
    color: getHexColor(colorName),
    author: {
      name: `${sender.login} ${action} an issue`,
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
