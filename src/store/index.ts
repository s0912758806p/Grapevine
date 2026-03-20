import { configureStore } from "@reduxjs/toolkit";
import commentsReducer from "./commentsSlice";
import f2eIssuesReducer from "./f2eIssuesSlice";
import userReducer from "./userSlice";
import githubIssuesReducer from "./githubIssuesSlice";
import repositoriesReducer from "./repositoriesSlice";
import searchReducer from "./searchSlice";
import locationReducer from "./locationSlice";
import ruanyfWeeklyReducer from "./ruanyfWeeklySlice";
import characterReducer from "./characterSlice";
import bookmarksReducer from "./bookmarksSlice";

export const store = configureStore({
  reducer: {
    comments: commentsReducer,
    f2eIssues: f2eIssuesReducer,
    user: userReducer,
    githubIssues: githubIssuesReducer,
    repositories: repositoriesReducer,
    search: searchReducer,
    location: locationReducer,
    ruanyfWeekly: ruanyfWeeklyReducer,
    character: characterReducer,
    bookmarks: bookmarksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
