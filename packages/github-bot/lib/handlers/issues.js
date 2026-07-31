"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIssueEvent = handleIssueEvent;
const colors_1 = require("../utils/colors");
const discord_1 = require("../utils/discord");
async function handleIssueEvent(context, eventName, emoji, colorName) {
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
    const embed = {
        title: `#${issue.number} ${issue.title}`,
        url: issue.html_url,
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
