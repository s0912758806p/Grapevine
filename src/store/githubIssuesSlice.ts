import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchGrapevineIssues, fetchGrapevineIssue } from "../api/githubApi";
import { IssueType } from "../types";

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
};

// 將 GitHub API 回應處理為我們的 IssueType
function formatIssue(apiIssue: Record<string, unknown>): IssueType {
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
  };
}

export const fetchGithubIssuesThunk = createAsyncThunk(
  "githubIssues/fetchIssues",
  async (
    { page, perPage }: { page: number; perPage: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchGrapevineIssues(page, perPage);

      return {
        issues: response.issues.map((issue: Record<string, unknown>) =>
          formatIssue(issue)
        ),
        pagination: {
          currentPage: page,
          perPage,
          totalCount: response.totalCount,
        },
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
} = githubIssuesSlice.actions;
export default githubIssuesSlice.reducer;
