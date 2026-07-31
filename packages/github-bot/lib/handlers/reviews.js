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
        finalAction = "changes requested";
        finalEmoji = "🟠";
        finalColor = "ChangesRequested";
    }
    const eventId = `${context.id}-pr-review-${finalAction}`;
    const fields = [
        {
            name: "Repository",
            value: `[${repository.full_name}](${repository.html_url})`,
            inline: true,
        },
        {
            name: "Event Type",
            value: `${finalEmoji} PR Review ${finalAction}`,
            inline: true,
        },
    ];
    const embed = {
        title: `#${pr.number} ${pr.title}`,
        url: review.html_url,
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
async function handlePullRequestReviewRequestEvent(context, eventName, emoji, colorName) {
    const pr = context.payload.pull_request;
    const repository = context.payload.repository;
    const sender = context.payload.sender;
    const requestedReviewer = context.payload.requested_reviewer;
    const eventId = `${context.id}-pr-review-request`;
    const fields = [
        {
            name: "Repository",
            value: `[${repository.full_name}](${repository.html_url})`,
            inline: true,
        },
        {
            name: "Event Type",
            value: `${emoji} Review Requested`,
            inline: true,
        },
    ];
    if (requestedReviewer) {
        fields.push({
            name: "Reviewer",
            value: requestedReviewer.login,
            inline: true,
        });
    }
    const embed = {
        title: `#${pr.number} ${pr.title}`,
        url: pr.html_url,
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
