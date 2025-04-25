import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchF2EIssues, fetchF2EIssue } from "../api/githubApi";

// 簡化的GitHub Issue類型
export interface F2EIssueType {
  id: number;
  number: number;
  title: string;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  comments: number;
  html_url: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

interface F2EIssuesState {
  issues: F2EIssueType[];
  currentIssue: F2EIssueType | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  hasMorePages: boolean;
}

const initialState: F2EIssuesState = {
  issues: [],
  currentIssue: null,
  status: "idle",
  error: null,
  currentPage: 1,
  hasMorePages: true,
};

// 將GitHub API響應轉換為我們的F2EIssueType類型
const transformGitHubIssue = (issue: unknown): F2EIssueType => {
  const githubIssue = issue as Record<string, unknown>;

  return {
    id: Number(githubIssue.id) || 0,
    number: Number(githubIssue.number) || 0,
    title: String(githubIssue.title || ""),
    body: githubIssue.body ? String(githubIssue.body) : "",
    user: {
      login:
        githubIssue.user && typeof githubIssue.user === "object"
          ? String(
              (githubIssue.user as Record<string, unknown>).login || "unknown"
            )
          : "unknown",
      avatar_url:
        githubIssue.user && typeof githubIssue.user === "object"
          ? String(
              (githubIssue.user as Record<string, unknown>).avatar_url || ""
            )
          : "",
    },
    created_at: githubIssue.created_at
      ? String(githubIssue.created_at)
      : new Date().toISOString(),
    updated_at: githubIssue.updated_at
      ? String(githubIssue.updated_at)
      : new Date().toISOString(),
    comments: Number(githubIssue.comments || 0),
    html_url: githubIssue.html_url ? String(githubIssue.html_url) : "",
    labels: Array.isArray(githubIssue.labels)
      ? githubIssue.labels.map((label: unknown) => {
          const githubLabel = label as Record<string, unknown>;
          return {
            name: githubLabel.name ? String(githubLabel.name) : "",
            color: githubLabel.color ? String(githubLabel.color) : "cccccc",
          };
        })
      : [],
  };
};

// 非同步獲取F2E issues
export const fetchF2EIssuesThunk = createAsyncThunk(
  "f2eIssues/fetchIssues",
  async ({ page, perPage }: { page: number; perPage: number }) => {
    const response = await fetchF2EIssues(page, perPage);
    const transformedData = response.map(transformGitHubIssue);
    return { data: transformedData, page, perPage };
  }
);

// 非同步獲取單個F2E issue
export const fetchF2EIssueThunk = createAsyncThunk(
  "f2eIssues/fetchIssue",
  async (issueNumber: number) => {
    const issue = await fetchF2EIssue(issueNumber);
    return transformGitHubIssue(issue);
  }
);

export const f2eIssuesSlice = createSlice({
  name: "f2eIssues",
  initialState,
  reducers: {
    resetF2EIssuesStatus: (state) => {
      state.status = "idle";
    },
    clearCurrentF2EIssue: (state) => {
      state.currentIssue = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchF2EIssuesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchF2EIssuesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { data, page } = action.payload;

        // 如果是第1頁，則替換所有數據，否則添加到現有數據
        if (page === 1) {
          state.issues = data;
        } else {
          state.issues = [...state.issues, ...data];
        }

        // 如果返回的數據少於請求的perPage，表示沒有更多頁面
        state.hasMorePages = data.length === action.payload.perPage;
        state.currentPage = page;
      })
      .addCase(fetchF2EIssuesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch F2E issues";
      })
      .addCase(fetchF2EIssueThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchF2EIssueThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentIssue = action.payload;
      })
      .addCase(fetchF2EIssueThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch F2E issue";
      });
  },
});

export const { resetF2EIssuesStatus, clearCurrentF2EIssue, setCurrentPage } =
  f2eIssuesSlice.actions;

export default f2eIssuesSlice.reducer;
