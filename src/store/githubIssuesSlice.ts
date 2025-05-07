import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchGrapevineIssues,
  fetchGrapevineIssue,
} from "../api/repositoryApi";
import { IssueType } from "../types";

// Repository type
export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  visibility: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GithubIssuesState {
  issues: IssueType[];
  currentIssue: IssueType | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  votes: Record<number, number>;
  isAuthor: boolean;
  pagination: {
    currentPage: number;
    perPage: number;
    totalCount: number;
  };
  hasMorePages: boolean;
  repositories: Repository[];
  currentRepository: string | null;
}

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

const initialState: GithubIssuesState = {
  issues: [],
  currentIssue: null,
  status: "idle",
  error: null,
  votes: {},
  isAuthor: false,
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalCount: 0,
  },
  hasMorePages: true,
  repositories: [],
  currentRepository: null,
};

// 將 GitHub API 回應處理為我們的 IssueType
function formatIssue(apiIssue: Record<string, unknown>): IssueType {
  // 提取repository信息的函數
  const extractRepository = (repoUrl: string | undefined): string => {
    if (!repoUrl) return "unknown/unknown";

    try {
      // 嘗試從URL中提取owner/repo格式
      if (repoUrl.includes("/repos/")) {
        return repoUrl.split("/repos/")[1];
      }

      // 嘗試使用URL對象解析
      const url = new URL(repoUrl);
      const pathParts = url.pathname.split("/");

      // 尋找repos後面的兩個部分
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (pathParts[i] === "repos") {
          return `${pathParts[i + 1]}/${pathParts[i + 2]}`;
        }
      }

      return "unknown/unknown";
    } catch (e) {
      console.error("解析repository URL出錯:", repoUrl, e);
      return "unknown/unknown";
    }
  };

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
    repository: extractRepository(apiIssue.repository_url as string),
  };
}

export const fetchGithubIssuesThunk = createAsyncThunk(
  "githubIssues/fetchIssues",
  async (
    {
      page,
      perPage,
      repository,
    }: { page: number; perPage: number; repository?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchGrapevineIssues(page, perPage);

      // Filter by repository if provided
      let filteredIssues = response.issues;
      if (repository) {
        filteredIssues = filteredIssues.filter(
          (issue: Record<string, unknown>) => {
            // 直接檢查issue.repository屬性
            const repoName = issue.repository as string | undefined;
            if (repoName && repoName === repository) {
              return true;
            }

            // 如果沒有repository屬性，則檢查repository_url
            const repoUrl = issue.repository_url as string | undefined;

            if (!repoUrl) return false;

            // 從URL中提取owner/repo格式
            try {
              // 嘗試提取"/repos/{owner}/{repo}"格式
              const urlParts = repoUrl.split("/repos/");
              if (urlParts.length < 2) return false;

              const extractedRepo = urlParts[1]; // 例如: "owner/repo/issues/123" 或 "owner/repo"
              const repoPath = extractedRepo.split("/").slice(0, 2).join("/"); // 獲取 "owner/repo" 部分

              // 精確匹配 owner/repo
              return repoPath === repository;
            } catch (e) {
              console.error("解析repository URL出錯:", repoUrl, e);
              return false;
            }
          }
        );
      }

      return {
        issues: filteredIssues.map((issue: Record<string, unknown>) =>
          formatIssue(issue)
        ),
        pagination: {
          currentPage: page,
          perPage,
          totalCount: repository ? filteredIssues.length : response.totalCount,
        },
        currentRepository: repository || null,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const fetchGithubIssueThunk = createAsyncThunk(
  "githubIssues/fetchIssue",
  async (issueNumber: number) => {
    const issue = await fetchGrapevineIssue(issueNumber);
    return formatIssue(issue);
  }
);

// 改為從 repositoriesSlice 獲取資料
export const fetchRepositoriesThunk = createAsyncThunk(
  "githubIssues/fetchRepositories",
  async (_, { rejectWithValue, getState }) => {
    try {
      // 從 state 獲取 repositories
      const state = getState() as {
        repositories: { repositories: Record<string, unknown>[] };
      };
      const managedRepos = state.repositories.repositories.filter(
        (repo) => repo.isActive as boolean
      );

      // 轉換格式以匹配 GitHub API 格式
      const repositories = managedRepos.map((repo) => ({
        id: parseInt(repo.id as string) || Math.floor(Math.random() * 10000), // 如果沒有ID就生成一個
        name: repo.repo as string,
        full_name: `${repo.owner as string}/${repo.repo as string}`,
        description: (repo.description as string) || "",
        stargazers_count: 0, // 預設值
        forks_count: 0, // 預設值
        open_issues_count: 0, // 預設值
        visibility: "public",
        owner: {
          login: repo.owner as string,
          avatar_url: "",
        },
      }));

      return repositories;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const githubIssuesSlice = createSlice({
  name: "githubIssues",
  initialState,
  reducers: {
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
    },
    upvoteIssue: (state, action: PayloadAction<number>) => {
      const issueId = action.payload;
      const currentVote = state.votes[issueId] || 0;
      state.votes[issueId] = currentVote === 1 ? 0 : 1;
    },
    downvoteIssue: (state, action: PayloadAction<number>) => {
      const issueId = action.payload;
      const currentVote = state.votes[issueId] || 0;
      state.votes[issueId] = currentVote === -1 ? 0 : -1;
    },
    setIsAuthor: (state, action: PayloadAction<boolean>) => {
      state.isAuthor = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.perPage = action.payload;
    },
    clearIssues: (state) => {
      state.issues = [];
      state.pagination.currentPage = 1;
      state.hasMorePages = true;
    },
    setCurrentRepository: (state, action: PayloadAction<string | null>) => {
      state.currentRepository = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Issues
      .addCase(fetchGithubIssuesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGithubIssuesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { currentPage } = action.payload.pagination;

        // If it's the first page, replace all data, otherwise append to existing data
        if (currentPage === 1) {
          state.issues = action.payload.issues;
        } else {
          state.issues = [...state.issues, ...action.payload.issues];
        }

        state.pagination = action.payload.pagination;
        // If returned issues are fewer than perPage, there are no more pages
        state.hasMorePages =
          action.payload.issues.length === action.payload.pagination.perPage;
        state.error = null;

        if (action.payload.currentRepository !== undefined) {
          state.currentRepository = action.payload.currentRepository;
        }
      })
      .addCase(fetchGithubIssuesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch issues";
      })

      // Fetch Single Issue
      .addCase(fetchGithubIssueThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchGithubIssueThunk.fulfilled,
        (state, action: PayloadAction<IssueType>) => {
          state.status = "succeeded";
          state.currentIssue = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchGithubIssueThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch issue";
      })

      // Fetch Repositories
      .addCase(fetchRepositoriesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRepositoriesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.repositories = action.payload;
        state.error = null;
      })
      .addCase(fetchRepositoriesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to fetch repositories";
      });
  },
});

export const {
  clearCurrentIssue,
  resetStatus,
  upvoteIssue,
  downvoteIssue,
  setIsAuthor,
  setPage,
  setPerPage,
  clearIssues,
  setCurrentRepository,
} = githubIssuesSlice.actions;
export default githubIssuesSlice.reducer;
