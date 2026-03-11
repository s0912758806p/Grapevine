import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchGrapevineIssues,
  fetchGrapevineIssue,
} from "../api/repositoryApi";
import { IssueType } from "../types";
import { formatGitHubIssue, calcHasMorePages } from "../utils";

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
            // Check issue.repository property directly
            const repoName = issue.repository as string | undefined;
            if (repoName && repoName === repository) {
              return true;
            }

            // Fall back to checking repository_url if repository property is absent
            const repoUrl = issue.repository_url as string | undefined;

            if (!repoUrl) return false;

            // Extract owner/repo from URL
            try {
              // Try extracting "/repos/{owner}/{repo}" format
              const urlParts = repoUrl.split("/repos/");
              if (urlParts.length < 2) return false;

              const extractedRepo = urlParts[1]; // e.g. "owner/repo/issues/123" or "owner/repo"
              const repoPath = extractedRepo.split("/").slice(0, 2).join("/"); // Get "owner/repo" part

              // Exact match on owner/repo
              return repoPath === repository;
            } catch (e) {
              console.error("Error parsing repository URL:", repoUrl, e);
              return false;
            }
          }
        );
      }

      return {
        issues: filteredIssues.map((issue: Record<string, unknown>) => {
          const repoStr = (issue.repository as string) || "unknown/unknown";
          const [owner = "unknown", repoName = "unknown"] = repoStr.split("/");
          return formatGitHubIssue(issue, owner, repoName, repoStr);
        }),
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
    const owner = import.meta.env.VITE_GITHUB_REPO_OWNER;
    const repo = import.meta.env.VITE_GITHUB_REPO_NAME;
    return formatGitHubIssue(issue, owner, repo, `${owner}/${repo}`);
  }
);

// Fetches repository list from repositoriesSlice state
export const fetchRepositoriesThunk = createAsyncThunk(
  "githubIssues/fetchRepositories",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get repositories from state
      const state = getState() as {
        repositories: { repositories: Record<string, unknown>[] };
      };
      const managedRepos = state.repositories.repositories.filter(
        (repo) => repo.isActive as boolean
      );

      // Convert to match GitHub API format
      const repositories = managedRepos.map((repo) => ({
        id: parseInt(repo.id as string) || Math.floor(Math.random() * 10000), // Generate an ID if none exists
        name: repo.repo as string,
        full_name: `${repo.owner as string}/${repo.repo as string}`,
        description: (repo.description as string) || "",
        stargazers_count: 0, // Default value
        forks_count: 0, // Default value
        open_issues_count: 0, // Default value
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
        state.hasMorePages = calcHasMorePages(
          action.payload.issues.length,
          action.payload.pagination.perPage
        );
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
