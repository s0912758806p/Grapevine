import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchIssues,
  fetchIssue,
  createIssue,
  createIssueAsUser,
} from "../api/github";
import { IssueType } from "../types";

interface IssuesState {
  issues: IssueType[];
  currentIssue: IssueType | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IssuesState = {
  issues: [],
  currentIssue: null,
  status: "idle",
  error: null,
};

// Async thunks
export const fetchIssuesThunk = createAsyncThunk(
  "issues/fetchIssues",
  async () => {
    return await fetchIssues();
  }
);

export const fetchIssueThunk = createAsyncThunk(
  "issues/fetchIssue",
  async (issueNumber: number) => {
    return await fetchIssue(issueNumber);
  }
);

// 使用應用默認 token 創建 Issue
export const createIssueThunk = createAsyncThunk(
  "issues/createIssue",
  async ({ title, body }: { title: string; body: string }) => {
    return await createIssue(title, body);
  }
);

// 使用用戶 token 創建 Issue
export const createIssueAsUserThunk = createAsyncThunk(
  "issues/createIssueAsUser",
  async ({
    title,
    body,
    token,
    owner,
    repo,
  }: {
    title: string;
    body: string;
    token: string;
    owner?: string;
    repo?: string;
  }) => {
    if (!token) {
      throw new Error(
        "Authentication required: Please log in to create an issue"
      );
    }
    return await createIssueAsUser(title, body, token, owner, repo);
  }
);

export const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    resetIssuesStatus: (state) => {
      state.status = "idle";
    },
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch issues
      .addCase(fetchIssuesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchIssuesThunk.fulfilled,
        (state, action: PayloadAction<IssueType[]>) => {
          state.status = "succeeded";
          state.issues = action.payload;
        }
      )
      .addCase(fetchIssuesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch issues";
      })
      // Fetch single issue
      .addCase(fetchIssueThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchIssueThunk.fulfilled,
        (state, action: PayloadAction<IssueType | null>) => {
          state.status = "succeeded";
          state.currentIssue = action.payload;
        }
      )
      .addCase(fetchIssueThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch issue";
      })
      // Create issue
      .addCase(createIssueThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createIssueThunk.fulfilled,
        (state, action: PayloadAction<IssueType | null>) => {
          state.status = "succeeded";
          if (action.payload) {
            state.issues = [action.payload, ...state.issues];
          }
        }
      )
      .addCase(createIssueThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to create issue";
      })
      // Create issue as User
      .addCase(createIssueAsUserThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createIssueAsUserThunk.fulfilled,
        (state, action: PayloadAction<IssueType | null>) => {
          state.status = "succeeded";
          if (action.payload) {
            state.issues = [action.payload, ...state.issues];
          }
        }
      )
      .addCase(createIssueAsUserThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message ||
          "Failed to create issue. Make sure you are logged in.";
      });
  },
});

export const { resetIssuesStatus, clearCurrentIssue } = issuesSlice.actions;

export default issuesSlice.reducer;
