"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePullRequestEvent = handlePullRequestEvent;
const colors_1 = require("../utils/colors");
const discord_1 = require("../utils/discord");
async function handlePullRequestEvent(context, eventName, emoji, colorName) {
    const pr = context.payload.pull_request;
    const repository = context.payload.repository;
    const sender = context.payload.sender;
    const action = context.payload.action;
    let finalAction = action;
    let finalEmoji = emoji;
    let finalColor = colorName;
    if (action === "closed") {
        if (pr.merged) {
            finalAction = "merged";
            finalEmoji = "✅";
            finalColor = "Merged";
        }
    }
    const eventId = `${context.id}-pr-${finalAction}`;
    const fields = [
        {
            name: "Repository",
            value: `[${repository.full_name}](${repository.html_url})`,
            inline: true,
        },
        {
            name: "Event Type",
            value: `${finalEmoji} Pull Request ${finalAction.charAt(0).toUpperCase() + finalAction.slice(1)}`,
            inline: true,
        },
        {
            name: "Branch",
            value: `\`${pr.head.ref}\` → \`${pr.base.ref}\``,
            inline: false,
        }
    ];
    if (pr.labels && pr.labels.length > 0) {
        fields.push({
            name: "Labels",
            value: pr.labels.map((l) => `\`${l.name}\``).join(", "),
            inline: false,
        });
    }
    const embed = {
        title: `#${pr.number} ${pr.title}`,
        url: pr.html_url,
        color: (0, colors_1.getHexColor)(finalColor),
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
