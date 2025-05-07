import { IssueType } from "../types";

// 定義 GitHub API 回應中的 issue 標籤結構
interface GitHubLabel {
  name: string;
  color: string;
}

// 定義 GitHub API 回應中的 issue 使用者結構
interface GitHubUser {
  login: string;
  avatar_url: string;
}

/**
 * Format GitHub API issue response to our application's IssueType format
 * @param apiIssue GitHub API issue response
 * @param repoOwner Repository owner
 * @param repoName Repository name
 * @param source Source identifier
 * @returns Formatted issue data
 */
export const formatGitHubIssue = (
  apiIssue: Record<string, unknown>,
  repoOwner: string,
  repoName: string,
  source: string
): IssueType => {
  return {
    id: Number(apiIssue.id),
    number: Number(apiIssue.number),
    title: String(apiIssue.title),
    body: apiIssue.body ? String(apiIssue.body) : "",
    user: {
      login: apiIssue.user
        ? String((apiIssue.user as GitHubUser).login)
        : "unknown",
      avatar_url: apiIssue.user
        ? String((apiIssue.user as GitHubUser).avatar_url)
        : "",
    },
    created_at: String(apiIssue.created_at),
    updated_at: String(apiIssue.updated_at),
    comments: Number(apiIssue.comments),
    labels: Array.isArray(apiIssue.labels)
      ? (apiIssue.labels as GitHubLabel[]).map((label) => ({
          name: label.name,
          color: label.color,
        }))
      : [],
    state: String(apiIssue.state),
    source,
    repoOwner,
    repoName,
  };
};

/**
 * Extract total count from GitHub API response headers
 * @param headers Headers from GitHub API response
 * @param perPage Items per page
 * @param page Current page
 * @param responseLength Length of the current response data array
 * @returns Total count
 */
export const extractTotalCount = (
  headers: Record<string, string | string[] | number | undefined>,
  perPage: number,
  page: number,
  responseLength: number
): number => {
  let totalCount = 0;

  if (headers["x-total-count"]) {
    const totalCountHeader = headers["x-total-count"];
    if (typeof totalCountHeader === "string") {
      totalCount = parseInt(totalCountHeader, 10);
    } else if (typeof totalCountHeader === "number") {
      totalCount = totalCountHeader;
    }
  } else if (headers.link && typeof headers.link === "string") {
    const linkHeader = headers.link;
    const lastPageMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
    if (lastPageMatch && lastPageMatch[1]) {
      const lastPage = parseInt(lastPageMatch[1], 10);
      totalCount = lastPage * perPage;
    }
  }

  // If cannot extract total count from headers, estimate based on current page
  if (!totalCount) {
    totalCount =
      responseLength < perPage
        ? page * perPage - (perPage - responseLength)
        : page * perPage + perPage;
  }

  return totalCount;
};

/**
 * Check if an issue was created or updated within a specified time period
 * @param issue GitHub issue
 * @param hoursAgo Number of hours ago to compare against
 * @returns Object with created and updated flags
 */
export const checkIssueActivity = (
  issue: Record<string, unknown>,
  hoursAgo: number = 24
) => {
  const timeThreshold = new Date();
  timeThreshold.setHours(timeThreshold.getHours() - hoursAgo);

  const createdAt = new Date(String(issue.created_at));
  const updatedAt = new Date(String(issue.updated_at));

  return {
    isNew: createdAt > timeThreshold,
    isUpdated: createdAt <= timeThreshold && updatedAt > timeThreshold,
  };
};
