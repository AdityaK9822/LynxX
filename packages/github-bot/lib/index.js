"use strict";
const issues_1 = require("./handlers/issues");
const pullRequests_1 = require("./handlers/pullRequests");
const reviews_1 = require("./handlers/reviews");
const pushes_1 = require("./handlers/pushes");
const releases_1 = require("./handlers/releases");
module.exports = (app) => {
    app.log.info("LynxX Discord Bot was loaded!");
    // --- Issues ---
    app.on("issues.opened", (ctx) => (0, issues_1.handleIssueEvent)(ctx, "Issue Opened", "🟢", "Opened"));
    app.on("issues.closed", (ctx) => (0, issues_1.handleIssueEvent)(ctx, "Issue Closed", "🔴", "Closed"));
    app.on("issues.reopened", (ctx) => (0, issues_1.handleIssueEvent)(ctx, "Issue Reopened", "🟢", "Opened"));
    app.on("issues.assigned", (ctx) => (0, issues_1.handleIssueEvent)(ctx, "Issue Assigned", "🔵", "Assigned"));
    app.on("issues.unassigned", (ctx) => (0, issues_1.handleIssueEvent)(ctx, "Issue Unassigned", "🔵", "Default"));
    app.on("issues.edited", (ctx) => (0, issues_1.handleIssueEvent)(ctx, "Issue Edited", "📝", "Default"));
    // --- Pull Requests ---
    app.on("pull_request.opened", (ctx) => (0, pullRequests_1.handlePullRequestEvent)(ctx, "PR Opened", "🟢", "Opened"));
    app.on("pull_request.closed", (ctx) => (0, pullRequests_1.handlePullRequestEvent)(ctx, "PR Closed", "🔴", "Closed")); // PR closed handles merge as well internally
    app.on("pull_request.reopened", (ctx) => (0, pullRequests_1.handlePullRequestEvent)(ctx, "PR Reopened", "🟢", "Opened"));
    app.on("pull_request.synchronize", (ctx) => (0, pullRequests_1.handlePullRequestEvent)(ctx, "PR Synchronized", "🔄", "Default"));
    // --- Pull Request Reviews ---
    app.on("pull_request.review_requested", (ctx) => (0, reviews_1.handlePullRequestReviewRequestEvent)(ctx, "Review Requested", "🟡", "ReviewRequested"));
    app.on("pull_request_review.submitted", (ctx) => (0, reviews_1.handlePullRequestReviewEvent)(ctx, "Review Submitted", "💬", "Default"));
    app.on("pull_request_review.edited", (ctx) => (0, reviews_1.handlePullRequestReviewEvent)(ctx, "Review Edited", "💬", "Default"));
    // --- Pushes ---
    app.on("push", (ctx) => (0, pushes_1.handlePushEvent)(ctx, "Push", "🚀", "Default"));
    // --- Releases ---
    app.on("release.published", (ctx) => (0, releases_1.handleReleaseEvent)(ctx, "Release Published", "🎉", "Merged"));
};
