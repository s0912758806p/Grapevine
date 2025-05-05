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
    // 從當前環境變量中獲取默認倉庫
    const defaultOwner = import.meta.env.VITE_GITHUB_REPO_OWNER;
    const defaultRepo = import.meta.env.VITE_GITHUB_REPO_NAME;

    // 定義要獲取issues的倉庫列表
    const repositories = [
      { owner: defaultOwner, repo: defaultRepo },
      { owner: "f2etw", repo: "jobs" },
    ];

    // 從所有倉庫獲取issues
    const issuesPromises = repositories.map(async (repo) => {
      try {
        console.log(`正在獲取 ${repo.owner}/${repo.repo} 的issues...`);
        const response = await octokit.request(
          "GET /repos/{owner}/{repo}/issues",
          {
            owner: repo.owner,
            repo: repo.repo,
            state: "all", // 獲取所有狀態的issues，包括open和closed
            per_page: perPage,
            page: page,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );

        // 添加repository信息
        const repoIssues = response.data.map(
          (issue: Record<string, unknown>) => {
            // 如果没有repository_url，則添加
            if (!issue.repository_url) {
              issue.repository_url = `https://api.github.com/repos/${repo.owner}/${repo.repo}`;
            }

            // 添加repository屬性
            issue.repository = `${repo.owner}/${repo.repo}`;

            return issue;
          }
        );

        console.log(
          `成功獲取 ${repo.owner}/${repo.repo} 的issues: ${repoIssues.length}個`
        );
        return {
          issues: repoIssues,
          totalCount: repoIssues.length,
          name: `${repo.owner}/${repo.repo}`,
        };
      } catch (error) {
        console.error(`獲取 ${repo.owner}/${repo.repo} 的issues失敗:`, error);
        return {
          issues: [],
          totalCount: 0,
          name: `${repo.owner}/${repo.repo}`,
        };
      }
    });

    // 等待所有請求完成
    const results = await Promise.all(issuesPromises);

    // 合併所有issues
    let allIssues: Record<string, unknown>[] = [];
    let totalCount = 0;

    results.forEach((result) => {
      console.log(`合併 ${result.name} 的 ${result.issues.length} 個issues`);
      allIssues = [...allIssues, ...result.issues];
      totalCount += result.totalCount;
    });

    console.log(`總共獲取了 ${allIssues.length} 個issues`);

    return {
      issues: allIssues,
      totalCount,
    };
  } catch (error) {
    console.error("獲取issues時發生錯誤:", error);
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
