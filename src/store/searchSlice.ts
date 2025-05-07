import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SearchFilter } from "../types";

interface SearchState {
  currentFilter: SearchFilter;
  savedFilters: SearchFilter[];
}

// Load saved filters from local storage
const loadSavedFilters = (): SearchFilter[] => {
  try {
    const saved = localStorage.getItem("grapevine_saved_filters");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load saved filters:", error);
    return [];
  }
};

// Save filters to local storage
const saveFiltersToStorage = (filters: SearchFilter[]) => {
  try {
    localStorage.setItem("grapevine_saved_filters", JSON.stringify(filters));
  } catch (error) {
    console.error("Failed to save filters:", error);
  }
};

const initialState: SearchState = {
  currentFilter: {},
  savedFilters: loadSavedFilters(),
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    // Set search filter
    setSearchFilter: (state, action: PayloadAction<SearchFilter>) => {
      state.currentFilter = action.payload;
    },

    // Clear search filter
    clearSearchFilter: (state) => {
      state.currentFilter = {};
    },

    // Save search filter
    saveSearchFilter: (state, action: PayloadAction<SearchFilter>) => {
      // Ensure filter has ID and name
      if (!action.payload.id) {
        action.payload.id = `filter-${Date.now()}`;
      }

      // Check if filter with same name already exists
      const existingIndex = state.savedFilters.findIndex(
        (filter) => filter.name === action.payload.name
      );

      if (existingIndex >= 0) {
        // Update existing filter
        state.savedFilters[existingIndex] = action.payload;
      } else {
        // Add new filter
        state.savedFilters.push(action.payload);
      }

      // Save to local storage
      saveFiltersToStorage(state.savedFilters);
    },

    // Delete saved filter
    removeSavedFilter: (state, action: PayloadAction<string>) => {
      state.savedFilters = state.savedFilters.filter(
        (filter) => filter.id !== action.payload
      );

      // Save to local storage
      saveFiltersToStorage(state.savedFilters);
    },

    // Load saved filter
    loadSavedFilter: (state, action: PayloadAction<string>) => {
      const filter = state.savedFilters.find((f) => f.id === action.payload);
      if (filter) {
        state.currentFilter = { ...filter };
      }
    },
  },
});

export const {
  setSearchFilter,
  clearSearchFilter,
  saveSearchFilter,
  removeSavedFilter,
  loadSavedFilter,
} = searchSlice.actions;

export default searchSlice.reducer;
