"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePullRequestEvent = handlePullRequestEvent;
const colors_1 = require("../utils/colors");
const discord_1 = require("../utils/discord");
const contributors_1 = require("../utils/contributors");
function parseLinkedIssues(body, repoFullName) {
    if (!body)
        return [];
    const pattern = /(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#(\d+)/gi;
    const issues = [];
    const seen = new Set();
    let match;
    while ((match = pattern.exec(body)) !== null) {
        const num = parseInt(match[1], 10);
        if (!seen.has(num)) {
            seen.add(num);
            issues.push({
                number: num,
                url: `https://github.com/${repoFullName}/issues/${num}`,
            });
        }
    }
    return issues;
}
function formatDuration(start, end) {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0 && minutes > 0)
        return `${hours}h ${minutes}m`;
    if (hours > 0)
        return `${hours}h`;
    return `${minutes}m`;
}
function getMaintainerMentions() {
    const ids = process.env.MAINTAINER_DISCORD_IDS;
    if (!ids)
        return null;
    return ids
        .split(",")
        .map((id) => `<@${id.trim()}>`)
        .join(" ");
}
function buildAuthorField(sender, actionLabel) {
    return {
        name: `${sender.login} ${actionLabel}`,
        url: sender.html_url,
        icon_url: sender.avatar_url,
    };
}
async function handlePullRequestEvent(context, eventName, emoji, colorName) {
    const pr = context.payload.pull_request;
    const repository = context.payload.repository;
    const sender = context.payload.sender;
    const action = context.payload.action;
    const prUser = pr.user;
    const linkedIssues = parseLinkedIssues(pr.body, repository.full_name);
    let finalAction = action;
    let finalEmoji = emoji;
    let finalColor = colorName;
    let category = "pull_requests";
    let content;
    if (action === "opened") {
        const maintainerMentions = getMaintainerMentions();
        if (maintainerMentions) {
            content = `${maintainerMentions} New pull request opened!`;
        }
    }
    if (action === "closed") {
        if (pr.merged) {
            finalAction = "merged";
            finalEmoji = "🎉";
            finalColor = "Merged";
            category = "completed_contributions";
            const contributorName = prUser?.login;
            const contributorDiscordId = contributorName ? (0, contributors_1.getDiscordId)(contributorName) : null;
            const firstContribution = contributorName ? (0, contributors_1.isFirstContribution)(contributorName) : false;
            let congratulations = `🎉 **${contributorName || "Contributor"}**`;
            if (contributorDiscordId) {
                congratulations = `🎉 <@${contributorDiscordId}> (**${contributorName}**)`;
            }
            if (firstContribution) {
                congratulations += ` 🥇 **First Contribution!**`;
            }
            content = congratulations;
            if (contributorName) {
                (0, contributors_1.markContributorMerged)(contributorName);
            }
        }
        else {
            category = "pull_requests";
        }
    }
    const eventId = `${context.id}-pr-${finalAction}`;
    const fields = [
        {
            name: "📁 Repository",
            value: `[${repository.full_name}](${repository.html_url})`,
            inline: true,
        },
        {
            name: "🎯 Action",
            value: `${finalEmoji} PR ${finalAction.charAt(0).toUpperCase() + finalAction.slice(1)}`,
            inline: true,
        },
    ];
    if (action === "opened") {
        if (prUser) {
            fields.push({
                name: "👤 Contributor",
                value: `[${prUser.login}](${prUser.html_url})`,
                inline: true,
            });
        }
        fields.push({
            name: "🌿 Branch",
            value: `\`${pr.head.ref}\` → \`${pr.base.ref}\``,
            inline: false,
        });
        if (linkedIssues.length > 0) {
            fields.push({
                name: "🔗 Linked Issue",
                value: linkedIssues
                    .map((i) => `[#${i.number}](${i.url})`)
                    .join(", "),
                inline: true,
            });
        }
        fields.push({
            name: "📊 Stats",
            value: [
                `${pr.commits} commit${pr.commits !== 1 ? "s" : ""}`,
                `${pr.changed_files} file${pr.changed_files !== 1 ? "s" : ""} changed`,
                `+${pr.additions} / -${pr.deletions}`,
            ].join(" · "),
            inline: false,
        });
    }
    if (action === "closed" && pr.merged) {
        if (prUser) {
            fields.push({
                name: "👤 Contributor",
                value: `[${prUser.login}](${prUser.html_url})`,
                inline: true,
            });
        }
        const mergedBy = pr.merged_by;
        if (mergedBy) {
            fields.push({
                name: "✅ Merged By",
                value: `[${mergedBy.login}](${mergedBy.html_url})`,
                inline: true,
            });
        }
        if (linkedIssues.length > 0) {
            fields.push({
                name: "🔗 Closed Issue",
                value: linkedIssues
                    .map((i) => `[#${i.number}](${i.url})`)
                    .join(", "),
                inline: true,
            });
        }
        fields.push({
            name: "🌿 Branch",
            value: `\`${pr.head.ref}\` → \`${pr.base.ref}\``,
            inline: false,
        });
        fields.push({
            name: "📊 Stats",
            value: [
                `${pr.commits} commit${pr.commits !== 1 ? "s" : ""}`,
                `${pr.changed_files} file${pr.changed_files !== 1 ? "s" : ""} changed`,
                `+${pr.additions} / -${pr.deletions}`,
            ].join(" · "),
            inline: false,
        });
        if (pr.merged_at && pr.created_at) {
            fields.push({
                name: "⏱️ Merge Time",
                value: formatDuration(pr.created_at, pr.merged_at),
                inline: true,
            });
        }
        if (pr.labels && pr.labels.length > 0) {
            fields.push({
                name: "🏷️ Labels",
                value: pr.labels.map((l) => `\`${l.name}\``).join(", "),
                inline: false,
            });
        }
    }
    if (action !== "closed" && pr.labels && pr.labels.length > 0) {
        fields.push({
            name: "🏷️ Labels",
            value: pr.labels.map((l) => `\`${l.name}\``).join(", "),
            inline: false,
        });
    }
    const embed = {
        title: `#${pr.number} ${pr.title}`,
        url: pr.html_url,
        color: (0, colors_1.getHexColor)(finalColor),
        author: buildAuthorField(sender, finalAction === "merged" ? "merged" : `${finalAction} a pull request`),
        fields,
        footer: {
            text: repository.full_name,
        },
        timestamp: new Date().toISOString(),
    };
    await (0, discord_1.sendDiscordNotification)(eventId, { content, embeds: [embed] }, category);
}
