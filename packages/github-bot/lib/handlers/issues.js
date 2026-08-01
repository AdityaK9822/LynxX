"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIssueEvent = handleIssueEvent;
const colors_1 = require("../utils/colors");
const discord_1 = require("../utils/discord");
const contributors_1 = require("../utils/contributors");
async function handleIssueEvent(context, eventName, emoji, colorName) {
    const issue = context.payload.issue;
    const repository = context.payload.repository;
    const sender = context.payload.sender;
    const action = context.payload.action;
    const assignee = context.payload.assignee;
    const eventId = `${context.id}-issue-${action}`;
    let category = "general";
    if (action === "opened")
        category = "available_issues";
    else if (action === "assigned")
        category = "claimed_issues";
    else if (action === "closed")
        category = "completed";
    let content;
    if (action === "assigned" && assignee) {
        const discordId = (0, contributors_1.getDiscordId)(assignee.login);
        if (discordId) {
            content = `<@${discordId}> You've been assigned an issue!`;
        }
    }
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
    if (issue.assignee) {
        fields.push({
            name: "👤 Assignee",
            value: `[${issue.assignee.login}](${issue.assignee.html_url})`,
            inline: true,
        });
    }
    if (issue.milestone) {
        fields.push({
            name: "📅 Milestone",
            value: `[${issue.milestone.title}](${issue.milestone.html_url})`,
            inline: true,
        });
    }
    const priorityLabels = issue.labels
        ? issue.labels.filter((l) => /^priority[:/]\s*/i.test(l.name))
        : [];
    if (priorityLabels.length > 0) {
        fields.push({
            name: "🔥 Priority",
            value: priorityLabels
                .map((l) => `\`${l.name.replace(/^priority[:/]\s*/i, "")}\``)
                .join(", "),
            inline: true,
        });
    }
    if (issue.labels && issue.labels.length > 0) {
        const nonPriorityLabels = issue.labels.filter((l) => !/^priority[:/]\s*/i.test(l.name));
        if (nonPriorityLabels.length > 0) {
            fields.push({
                name: "🏷️ Labels",
                value: nonPriorityLabels.map((l) => `\`${l.name}\``).join(", "),
                inline: false,
            });
        }
    }
    if (issue.body && issue.body.length > 0) {
        const truncated = issue.body.length > 300
            ? issue.body.substring(0, 297) + "..."
            : issue.body;
        fields.push({
            name: "📝 Description",
            value: truncated,
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
    await (0, discord_1.sendDiscordNotification)(eventId, { content, embeds: [embed] }, category);
}
