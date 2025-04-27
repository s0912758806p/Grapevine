import { configureStore } from "@reduxjs/toolkit";
import commentsReducer from "./commentsSlice";
import f2eIssuesReducer from "./f2eIssuesSlice";
import userReducer from "./userSlice";
import githubIssuesReducer from "./githubIssuesSlice";
import repositoriesReducer from "./repositoriesSlice";
import searchReducer from "./searchSlice";
import locationReducer from "./locationSlice";

export const store = configureStore({
  reducer: {
    comments: commentsReducer,
    f2eIssues: f2eIssuesReducer,
    user: userReducer,
    githubIssues: githubIssuesReducer,
    repositories: repositoriesReducer,
    search: searchReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
