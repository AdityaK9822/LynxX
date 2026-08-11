"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReleaseEvent = handleReleaseEvent;
const colors_1 = require("../utils/colors");
const discord_1 = require("../utils/discord");
async function handleReleaseEvent(context, eventName, emoji, colorName) {
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
    const embed = {
        title: `Release: ${release.name || release.tag_name}`,
        url: release.html_url,
        description: release.body ? (release.body.length > 2048 ? release.body.substring(0, 2045) + '...' : release.body) : undefined,
        color: (0, colors_1.getHexColor)(colorName),
        author: {
            name: sender.login,
            url: sender.html_url,
            icon_url: sender.avatar_url,
        },
        fields,
        timestamp: new Date().toISOString(),
    };
    await (0, discord_1.sendDiscordNotification)(eventId, { embeds: [embed] });
}
