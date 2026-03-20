import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type BookmarkType = "article" | "job" | "rumor" | "weekly";

export interface Bookmark {
  id: string;            // unique id (e.g. "article-123")
  type: BookmarkType;
  title: string;
  url: string;           // internal route
  tags?: string[];
  savedAt: string;       // ISO timestamp
}

interface BookmarksState {
  items: Bookmark[];
}

const STORAGE_KEY = "grapevine_bookmarks";

function loadFromStorage(): BookmarksState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { items: [] };
}

function saveToStorage(state: BookmarksState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const bookmarksSlice = createSlice({
  name: "bookmarks",
  initialState: loadFromStorage(),
  reducers: {
    addBookmark(state, action: PayloadAction<Omit<Bookmark, "savedAt">>) {
      const exists = state.items.some((b) => b.id === action.payload.id);
      if (!exists) {
        state.items.unshift({ ...action.payload, savedAt: new Date().toISOString() });
        saveToStorage({ ...state });
      }
    },

    removeBookmark(state, action: PayloadAction<string>) {
      state.items = state.items.filter((b) => b.id !== action.payload);
      saveToStorage({ ...state });
    },

    clearBookmarks(state) {
      state.items = [];
      saveToStorage({ ...state });
    },
  },
});

export const { addBookmark, removeBookmark, clearBookmarks } = bookmarksSlice.actions;
export default bookmarksSlice.reducer;
