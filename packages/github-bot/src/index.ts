import { Probot } from "probot";
import { handleIssueEvent } from "./handlers/issues";
import { handlePullRequestEvent } from "./handlers/pullRequests";
import { handlePullRequestReviewEvent, handlePullRequestReviewRequestEvent } from "./handlers/reviews";
import { handlePushEvent } from "./handlers/pushes";
import { handleReleaseEvent } from "./handlers/releases";
import { handleIssueCommentEvent } from "./handlers/comments";

export = (app: Probot) => {
  app.log.info("LynxX Discord Bot was loaded!");

  // --- Issues ---
  app.on("issues.opened", (ctx) => handleIssueEvent(ctx, "Issue Opened", "🟢", "Opened"));
  app.on("issues.closed", (ctx) => handleIssueEvent(ctx, "Issue Closed", "🔴", "Closed"));
  app.on("issues.reopened", (ctx) => handleIssueEvent(ctx, "Issue Reopened", "🟢", "Opened"));
  app.on("issues.assigned", (ctx) => handleIssueEvent(ctx, "Issue Assigned", "🔵", "Assigned"));
  app.on("issues.unassigned", (ctx) => handleIssueEvent(ctx, "Issue Unassigned", "🔵", "Default"));
  app.on("issues.edited", (ctx) => handleIssueEvent(ctx, "Issue Edited", "📝", "Default"));

  // --- Pull Requests ---
  app.on("pull_request.opened", (ctx) => handlePullRequestEvent(ctx, "PR Opened", "🟢", "Opened"));
  app.on("pull_request.closed", (ctx) => handlePullRequestEvent(ctx, "PR Closed", "🔴", "Closed"));
  app.on("pull_request.reopened", (ctx) => handlePullRequestEvent(ctx, "PR Reopened", "🟢", "Opened"));
  app.on("pull_request.synchronize", (ctx) => handlePullRequestEvent(ctx, "PR Synchronized", "🔄", "Default"));

  // --- Pull Request Reviews ---
  app.on("pull_request.review_requested", (ctx) => handlePullRequestReviewRequestEvent(ctx, "Review Requested", "🟡", "ReviewRequested"));
  app.on("pull_request_review.submitted", (ctx) => handlePullRequestReviewEvent(ctx, "Review Submitted", "💬", "Default"));
  app.on("pull_request_review.edited", (ctx) => handlePullRequestReviewEvent(ctx, "Review Edited", "💬", "Default"));

  // --- Pushes ---
  app.on("push", (ctx) => handlePushEvent(ctx, "Push", "🚀", "Default"));

  // --- Releases ---
  app.on("release.published", (ctx) => handleReleaseEvent(ctx, "Release Published", "🎉", "Merged"));

  // --- Issue Comments (Contributor Registration) ---
  app.on("issue_comment.created", handleIssueCommentEvent);
};
