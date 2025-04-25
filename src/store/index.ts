import { configureStore } from "@reduxjs/toolkit";
import issuesReducer from "./issuesSlice";
import commentsReducer from "./commentsSlice";
export const store = configureStore({
  reducer: {
    issues: issuesReducer,
    comments: commentsReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
