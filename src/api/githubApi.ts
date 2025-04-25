import { Octokit } from "octokit";

// 初始化Octokit，不需要token來獲取公開倉庫的issues
const octokit = new Octokit();

// 獲取f2etw/jobs倉庫的issues
export const fetchF2EIssues = async (page = 1, perPage = 10) => {
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

    return response.data;
  } catch (error) {
    console.error("Error fetching F2E issues:", error);
    throw error;
  }
};

// 獲取單個issue的詳細資訊
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

// 檢查當前用戶是否是指定的作者
export const isAuthor = (currentUser: string | null): boolean => {
  // 這裡可以根據實際情況設定誰是作者
  const authorUsernames = ["admin", "moderator"]; // 可以根據需求替換成真實的用戶名
  return !!currentUser && authorUsernames.includes(currentUser);
};

export const fetchGrapevineIssues = async (page = 1, perPage = 10) => {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner: import.meta.env.VITE_GITHUB_REPO_OWNER,
      repo: import.meta.env.VITE_GITHUB_REPO_NAME,
      state: "open",
      per_page: perPage,
      page: page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    // Get the link header to extract total count information
    // GitHub includes pagination info in the Link header
    const linkHeader = response.headers.link;
    let totalCount = 0;

    // Try to extract total count from response headers if available
    if (response.headers["x-total-count"]) {
      totalCount = parseInt(response.headers["x-total-count"] as string, 10);
    } else if (linkHeader) {
      // Try to extract from the last page in the Link header
      // Example: <https://api.github.com/repositories/1300192/issues?page=2>; rel="next", <https://api.github.com/repositories/1300192/issues?page=4>; rel="last"
      const lastPageMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
      if (lastPageMatch && lastPageMatch[1]) {
        const lastPage = parseInt(lastPageMatch[1], 10);
        totalCount = lastPage * perPage;
      }
    }

    // If we couldn't extract total count from headers, estimate based on current page
    if (!totalCount) {
      totalCount =
        response.data.length < perPage
          ? page * perPage - (perPage - response.data.length)
          : page * perPage + perPage;
    }

    return {
      issues: response.data,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching Grapevine issues:", error);
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
