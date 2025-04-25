import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchIssues,
  fetchIssue,
  createIssue,
  createIssueWithLabels,
} from "../api/mockData";
import { IssueType } from "../types";
interface IssuesState {
  issues: IssueType[];
  currentIssue: IssueType | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  votes: Record<number, number>; 
}
const initialState: IssuesState = {
  issues: [],
  currentIssue: null,
  status: "idle",
  error: null,
  votes: {},
};
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
export const createIssueThunk = createAsyncThunk(
  "issues/createIssue",
  async ({
    title,
    body,
    userName,
  }: {
    title: string;
    body: string;
    userName?: string;
  }) => {
    return await createIssue(title, body, userName);
  }
);
export const createIssueWithLabelsThunk = createAsyncThunk(
  "issues/createIssueWithLabels",
  async ({
    title,
    body,
    tag,
    userName,
  }: {
    title: string;
    body: string;
    tag: string;
    userName?: string;
  }) => {
    return await createIssueWithLabels(title, body, [tag], userName);
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
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(createIssueWithLabelsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createIssueWithLabelsThunk.fulfilled,
        (state, action: PayloadAction<IssueType | null>) => {
          state.status = "succeeded";
          if (action.payload) {
            state.issues = [action.payload, ...state.issues];
          }
        }
      )
      .addCase(createIssueWithLabelsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Failed to create issue with labels";
      });
  },
});
export const {
  resetIssuesStatus,
  clearCurrentIssue,
  upvoteIssue,
  downvoteIssue,
} = issuesSlice.actions;
export default issuesSlice.reducer;
