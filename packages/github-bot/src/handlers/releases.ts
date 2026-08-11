import { Context } from "probot";
import { getHexColor } from "../utils/colors";
import { sendDiscordNotification, DiscordEmbed } from "../utils/discord";

export async function handleReleaseEvent(
  context: Context<"release">,
  eventName: string,
  emoji: string,
  colorName: any
) {
  const release = context.payload.release;
  const repository = context.payload.repository;
  const sender = context.payload.sender;

  const eventId = `${context.id}-release-published`;

  const fields = [
    {
      name: "Repository",
      value: `[${repository.full_name}](${repository.html_url})`,
      inline: true,
    },
    {
      name: "Event Type",
      value: `${emoji} New Release`,
      inline: true,
    },
    {
      name: "Tag",
      value: `\`${release.tag_name}\``,
      inline: true,
    }
  ];

  const embed: DiscordEmbed = {
    title: `Release: ${release.name || release.tag_name}`,
    url: release.html_url,
    description: release.body ? (release.body.length > 2048 ? release.body.substring(0, 2045) + '...' : release.body) : undefined,
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
