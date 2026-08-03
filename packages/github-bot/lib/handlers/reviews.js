"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePullRequestReviewEvent = handlePullRequestReviewEvent;
exports.handlePullRequestReviewRequestEvent = handlePullRequestReviewRequestEvent;
const colors_1 = require("../utils/colors");
const discord_1 = require("../utils/discord");
async function handlePullRequestReviewEvent(context, eventName, emoji, colorName) {
    const review = context.payload.review;
    const pr = context.payload.pull_request;
    const repository = context.payload.repository;
    const sender = context.payload.sender;
    let finalAction = "reviewed";
    let finalEmoji = emoji;
    let finalColor = colorName;
    if (review.state === "approved") {
        finalAction = "approved";
        finalEmoji = "🟣";
        finalColor = "Approved";
    }
    else if (review.state === "changes_requested") {
        finalAction = "requested changes";
        finalEmoji = "🟠";
        finalColor = "ChangesRequested";
    }
    const eventId = `${context.id}-pr-review-${review.id}`;
    const fields = [
        {
            name: "📁 Repository",
            value: `[${repository.full_name}](${repository.html_url})`,
            inline: true,
        },
        {
            name: "🎯 Status",
            value: `${finalEmoji} ${finalAction.charAt(0).toUpperCase() + finalAction.slice(1)}`,
            inline: true,
        },
    ];
    if (review.body) {
        fields.push({
            name: "💬 Comment",
            value: review.body.length > 200 ? review.body.substring(0, 197) + "..." : review.body,
            inline: false,
        });
    }
    const embed = {
        title: `#${pr.number} ${pr.title}`,
        url: review.html_url,
        color: (0, colors_1.getHexColor)(finalColor),
        author: {
            name: `${sender.login} ${finalAction} a PR`,
            url: sender.html_url,
            icon_url: sender.avatar_url,
        },
        fields,
        footer: {
            text: repository.full_name,
        },
        timestamp: new Date().toISOString(),
    };
    await (0, discord_1.sendDiscordNotification)(eventId, { embeds: [embed] }, "pull_requests");
}
async function handlePullRequestReviewRequestEvent(context, eventName, emoji, colorName) {
    const pr = context.payload.pull_request;
    const repository = context.payload.repository;
    const sender = context.payload.sender;
    const requestedReviewer = context.payload.requested_reviewer;
    const eventId = `${context.id}-pr-review-request`;
    const fields = [
        {
            name: "📁 Repository",
            value: `[${repository.full_name}](${repository.html_url})`,
            inline: true,
        },
        {
            name: "🎯 Action",
            value: `${emoji} Review Requested`,
            inline: true,
        },
    ];
    if (requestedReviewer) {
        fields.push({
            name: "👤 Reviewer",
            value: `[${requestedReviewer.login}](${requestedReviewer.html_url})`,
            inline: true,
        });
    }
    const embed = {
        title: `#${pr.number} ${pr.title}`,
        url: pr.html_url,
        color: (0, colors_1.getHexColor)(colorName),
        author: {
            name: `${sender.login} requested a review`,
            url: sender.html_url,
            icon_url: sender.avatar_url,
        },
        fields,
        footer: {
            text: repository.full_name,
        },
        timestamp: new Date().toISOString(),
    };
    await (0, discord_1.sendDiscordNotification)(eventId, { embeds: [embed] }, "pull_requests");
}
