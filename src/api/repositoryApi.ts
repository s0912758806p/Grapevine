import { Octokit } from "octokit";
import { RepositorySource, IssueType } from "../types";

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

// 初始化Octokit，不需要token來獲取公開倉庫的issues
const octokit = new Octokit();

// 將 GitHub API 回應處理為我們的 IssueType
function formatIssue(apiIssue: Record<string, unknown>, repoOwner: string, repoName: string, source: string): IssueType {
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
    repoName
  };
}

// 獲取指定倉庫的issues
export const fetchRepositoryIssues = async (
  repoSource: RepositorySource,
  page = 1,
  perPage = 10
) => {
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

    // 獲取總計數
    const linkHeader = response.headers.link;
    let totalCount = 0;

    if (response.headers["x-total-count"]) {
      totalCount = parseInt(response.headers["x-total-count"] as string, 10);
    } else if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
      if (lastPageMatch && lastPageMatch[1]) {
        const lastPage = parseInt(lastPageMatch[1], 10);
        totalCount = lastPage * perPage;
      }
    }

    // 如果無法從標頭提取總計數，請根據當前頁面進行估計
    if (!totalCount) {
      totalCount =
        response.data.length < perPage
          ? page * perPage - (perPage - response.data.length)
          : page * perPage + perPage;
    }

    const issues = response.data.map((issue: Record<string, unknown>) => 
      formatIssue(issue, repoSource.owner, repoSource.repo, repoSource.id));
    
    return {
      issues,
      totalCount,
    };
  } catch (error) {
    console.error(`Error fetching issues for ${repoSource.owner}/${repoSource.repo}:`, error);
    throw error;
  }
};

// 獲取單個issue的詳細資訊
export const fetchRepositoryIssue = async (repoSource: RepositorySource, issueNumber: number) => {
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

    return formatIssue(response.data, repoSource.owner, repoSource.repo, repoSource.id);
  } catch (error) {
    console.error(`Error fetching issue #${issueNumber} from ${repoSource.owner}/${repoSource.repo}:`, error);
    throw error;
  }
}; 