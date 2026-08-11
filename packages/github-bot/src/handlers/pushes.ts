import { Context } from "probot";
import { getHexColor } from "../utils/colors";
import { sendDiscordNotification, DiscordEmbed } from "../utils/discord";

export async function handlePushEvent(
  context: Context<"push">,
  eventName: string,
  emoji: string,
  colorName: any
) {
  const repository = context.payload.repository;
  const sender = context.payload.sender;
  const ref = context.payload.ref;
  const commits = context.payload.commits;

  // We only want to alert on push to main or experimental
  if (!ref.endsWith("/main") && !ref.endsWith("/experimental")) {
    return;
  }

  const branch = ref.replace("refs/heads/", "");
  const eventId = `${context.id}-push-${branch}`;

  const fields = [
    {
      name: "Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "Branch",
      value: `\`${branch}\``,
      inline: true,
    },
  ];

  let description = "";
  if (commits && commits.length > 0) {
    description = commits
      .slice(0, 5)
      .map(
        (c) =>
          `[\`${c.id.substring(0, 7)}\`](${c.url}) - ${c.message.split("\n")[0]}`
      )
      .join("\n");
      
    if (commits.length > 5) {
      description += `\n...and ${commits.length - 5} more commits.`;
    }
  }

  const embed: DiscordEmbed = {
    title: `Push to ${branch}`,
    description,
    url: context.payload.compare,
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
