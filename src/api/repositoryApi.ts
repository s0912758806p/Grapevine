import { Octokit } from "octokit";
import { RepositorySource } from "../types";
import { recordRepoActivity } from "../services/analyticsService";
import {
  formatGitHubIssue,
  extractTotalCount,
  checkIssueActivity,
} from "../utils";

// Initialize Octokit — no token required for public repository issues
const octokit = new Octokit();

// ── In-memory cache (TTL: 5 minutes) ─────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000;
const apiCache = new Map<string, { data: unknown; timestamp: number }>();

const getCached = <T>(key: string): T | null => {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
};

const setCache = (key: string, data: unknown): void => {
  apiCache.set(key, { data, timestamp: Date.now() });
};
// ─────────────────────────────────────────────────────────────────────

// Fetch issues for a given repository
export const fetchRepositoryIssues = async (
  repoSource: RepositorySource,
  page = 1,
  perPage = 10
) => {
  const cacheKey = `repo-issues-${repoSource.owner}/${repoSource.repo}-${page}-${perPage}`;
  const cached = getCached<{ issues: ReturnType<typeof formatGitHubIssue>[]; totalCount: number }>(cacheKey);
  if (cached) return cached;

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner: repoSource.owner,
      repo: repoSource.repo,
      state: "open",
      per_page: perPage,
      page: page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    // Get total count
    const totalCount = extractTotalCount(
      response.headers,
      perPage,
      page,
      response.data.length
    );

    const issues = response.data.map((issue: Record<string, unknown>) =>
      formatGitHubIssue(issue, repoSource.owner, repoSource.repo, repoSource.id)
    );

    // Count new and updated issues (in the last 24 hours)
    let newIssuesCount = 0;
    let updatedIssuesCount = 0;

    response.data.forEach((issue: Record<string, unknown>) => {
      const { isNew, isUpdated } = checkIssueActivity(issue);
      if (isNew) newIssuesCount++;
      if (isUpdated) updatedIssuesCount++;
    });

    // Record the analytics data
    recordRepoActivity(
      repoSource.id,
      repoSource.owner,
      repoSource.repo,
      newIssuesCount,
      updatedIssuesCount
    );

    const result = { issues, totalCount };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(
      `Error fetching issues for ${repoSource.owner}/${repoSource.repo}:`,
      error
    );
    throw error;
  }
};

// Fetch details for a single issue
export const fetchRepositoryIssue = async (
  repoSource: RepositorySource,
  issueNumber: number
) => {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner: repoSource.owner,
        repo: repoSource.repo,
        issue_number: issueNumber,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return formatGitHubIssue(
      response.data,
      repoSource.owner,
      repoSource.repo,
      repoSource.id
    );
  } catch (error) {
    console.error(
      `Error fetching issue #${issueNumber} from ${repoSource.owner}/${repoSource.repo}:`,
      error
    );
    throw error;
  }
};

// Fetch issues from the f2etw/jobs repository
export const fetchF2EIssues = async (page = 1, perPage = 10) => {
  const cacheKey = `f2e-issues-${page}-${perPage}`;
  const cached = getCached<unknown[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner: "f2etw",
      repo: "jobs",
      state: "open",
      per_page: perPage,
      page: page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching F2E issues:", error);
    throw error;
  }
};

// Fetch details for a single F2E issue
export const fetchF2EIssue = async (issueNumber: number) => {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner: "f2etw",
        repo: "jobs",
        issue_number: issueNumber,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching F2E issue #${issueNumber}:`, error);
    throw error;
  }
};

// Check if the current user is a designated author
export const isAuthor = (currentUser: string | null): boolean => {
  // Replace with real usernames as needed
  const authorUsernames = ["admin", "moderator"]; // Replace with actual usernames as needed
  return !!currentUser && authorUsernames.includes(currentUser);
};

export const fetchGrapevineIssues = async (page = 1, perPage = 10) => {
  const cacheKey = `grapevine-issues-${page}-${perPage}`;
  const cached = getCached<{ issues: Record<string, unknown>[]; totalCount: number }>(cacheKey);
  if (cached) return cached;

  try {
    // Get default repository from environment variables
    const defaultOwner = import.meta.env.VITE_GITHUB_REPO_OWNER;
    const defaultRepo = import.meta.env.VITE_GITHUB_REPO_NAME;

    // Define the list of repositories to fetch issues from
    const repositories = [
      { owner: defaultOwner, repo: defaultRepo },
      { owner: "f2etw", repo: "jobs" },
    ];

    // Fetch issues from all repositories
    const issuesPromises = repositories.map(async (repo) => {
      try {
        const response = await octokit.request(
          "GET /repos/{owner}/{repo}/issues",
          {
            owner: repo.owner,
            repo: repo.repo,
            state: "all", // Fetch all issues including open and closed
            per_page: perPage,
            page: page,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );

        // Attach repository metadata to each issue
        const repoIssues = response.data.map(
          (issue: Record<string, unknown>) => {
            // Add repository_url if missing
            if (!issue.repository_url) {
              issue.repository_url = `https://api.github.com/repos/${repo.owner}/${repo.repo}`;
            }

            // Add repository property
            issue.repository = `${repo.owner}/${repo.repo}`;

            return issue;
          }
        );

        return {
          issues: repoIssues,
          totalCount: repoIssues.length,
          name: `${repo.owner}/${repo.repo}`,
        };
      } catch (error) {
        console.error(`Failed to fetch issues for ${repo.owner}/${repo.repo}:`, error);
        return {
          issues: [],
          totalCount: 0,
          name: `${repo.owner}/${repo.repo}`,
        };
      }
    });

    // Wait for all requests to complete
    const results = await Promise.all(issuesPromises);

    // Merge all issues
    let allIssues: Record<string, unknown>[] = [];
    let totalCount = 0;

    results.forEach((result) => {
      allIssues = [...allIssues, ...result.issues];
      totalCount += result.totalCount;
    });

    const result = { issues: allIssues, totalCount };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

export const fetchGrapevineIssue = async (issueNumber: number) => {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner: import.meta.env.VITE_GITHUB_REPO_OWNER,
        repo: import.meta.env.VITE_GITHUB_REPO_NAME,
        issue_number: issueNumber,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching Grapevine issue #${issueNumber}:`, error);
    throw error;
  }
};

export const fetchGithubSingleIssue = async (owner: string, repo: string) => {
  try {
    const repoResponse = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: owner,
      repo: repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return repoResponse.data;
  } catch (error) {
    console.error("Error fetching Grapevine repository:", error);
    throw error;
  }
};

export const fetchGithubIssues = async (
  owner: string,
  repo: string,
  page = 1,
  perPage = 10
) => {
  const cacheKey = `github-issues-${owner}/${repo}-${page}-${perPage}`;
  const cached = getCached<unknown[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner: owner,
      repo: repo,
      state: "all", // Fetch all issues including open and closed
      per_page: perPage,
      page: page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub issues:", error);
    throw error;
  }
};
