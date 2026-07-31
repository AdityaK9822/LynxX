"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePushEvent = handlePushEvent;
const colors_1 = require("../utils/colors");
const discord_1 = require("../utils/discord");
async function handlePushEvent(context, eventName, emoji, colorName) {
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
            .map((c) => `[\`${c.id.substring(0, 7)}\`](${c.url}) - ${c.message.split("\n")[0]}`)
            .join("\n");
        if (commits.length > 5) {
            description += `\n...and ${commits.length - 5} more commits.`;
        }
    }
    const embed = {
        title: `Push to ${branch}`,
        description,
        url: context.payload.compare,
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
