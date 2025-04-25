import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchComments, addComment } from "../api/mockData";
import { CommentType } from "../types";
interface CommentsState {
  comments: Record<number, CommentType[]>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
const initialState: CommentsState = {
  comments: {},
  status: "idle",
  error: null,
};
export const fetchCommentsThunk = createAsyncThunk(
  "comments/fetchComments",
  async (issueNumber: number) => {
    return {
      issueNumber,
      comments: await fetchComments(issueNumber),
    };
  }
);
export const addCommentThunk = createAsyncThunk(
  "comments/addComment",
  async ({
    issueNumber,
    body,
    userName,
  }: {
    issueNumber: number;
    body: string;
    userName?: string;
  }) => {
    const comment = await addComment(issueNumber, body, userName);
    return {
      issueNumber,
      comment,
    };
  }
);
export const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCommentsThunk.fulfilled,
        (
          state,
          action: PayloadAction<{
            issueNumber: number;
            comments: CommentType[];
          }>
        ) => {
          state.status = "succeeded";
          state.comments[action.payload.issueNumber] = action.payload.comments;
        }
      )
      .addCase(fetchCommentsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch comments";
      })
      .addCase(addCommentThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        addCommentThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ issueNumber: number; comment: CommentType }>
        ) => {
          state.status = "succeeded";
          const { issueNumber, comment } = action.payload;
          if (!state.comments[issueNumber]) {
            state.comments[issueNumber] = [];
          }
          state.comments[issueNumber].push(comment);
        }
      )
      .addCase(addCommentThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to add comment";
      });
  },
});
export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
