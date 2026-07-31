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
    // Route to the right Discord channel based on action
    let category = "general";
    if (action === "opened")
        category = "available_issues";
    else if (action === "assigned")
        category = "claimed_issues";
    else if (action === "closed")
        category = "completed";
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
    const assignee = context.payload.assignee;
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
            value: issue.labels.map((l) => `\`${l.name}\``).join(", "),
            inline: false,
        });
    }
    const embed = {
        title: `#${issue.number} ${issue.title}`,
        url: issue.html_url,
        color: (0, colors_1.getHexColor)(colorName),
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
    await (0, discord_1.sendDiscordNotification)(eventId, { embeds: [embed] }, category);
}
