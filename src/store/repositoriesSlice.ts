import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RepositorySource, CategoryType, IssueType } from "../types";
import {
  fetchRepositoryIssues,
  fetchRepositoryIssue,
} from "../api/repositoryApi";
import { calcHasMorePages } from "../utils";

// State interface definition
interface RepositoriesState {
  repositories: RepositorySource[];
  categories: CategoryType[];
  issues: IssueType[];
  currentIssue: IssueType | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: {
    currentPage: number;
    perPage: number;
    totalCount: number;
  };
  hasMorePages: boolean;
  activeCategory: string | null;
}

// Initial state
const initialState: RepositoriesState = {
  repositories: [
    {
      id: "grapevine",
      name: "Grapevine Community",
      owner: import.meta.env.VITE_GITHUB_REPO_OWNER,
      repo: import.meta.env.VITE_GITHUB_REPO_NAME,
      description: "Main Grapevine community discussions",
      isActive: true,
      category: "community",
    },
    {
      id: "f2e-jobs",
      name: "F2E Jobs",
      owner: "f2etw",
      repo: "jobs",
      description: "Front-end job listings",
      isActive: true,
      category: "jobs",
    },
  ],
  categories: [
    {
      id: "all",
      name: "All Sources",
      description: "All available repositories",
      isDefault: true,
      order: 0,
    },
    {
      id: "community",
      name: "Community",
      description: "Community discussions",
      order: 1,
    },
    {
      id: "jobs",
      name: "Jobs",
      description: "Job listings and opportunities",
      order: 2,
    },
  ],
  issues: [],
  currentIssue: null,
  status: "idle",
  error: null,
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalCount: 0,
  },
  hasMorePages: true,
  activeCategory: "all",
};

// Thunk to fetch issues filtered by category
export const fetchIssuesByCategory = createAsyncThunk(
  "repositories/fetchIssuesByCategory",
  async (
    {
      categoryId,
      page,
      perPage,
    }: {
      categoryId: string;
      page: number;
      perPage: number;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { repositories: RepositoriesState };
      let repos = state.repositories.repositories.filter(
        (repo) => repo.isActive
      );

      // Filter repositories by category unless "all" is selected
      if (categoryId !== "all") {
        repos = repos.filter((repo) => repo.category === categoryId);
      }

      // Return empty result if no repositories are available
      if (repos.length === 0) {
        return {
          issues: [],
          pagination: {
            currentPage: page,
            perPage,
            totalCount: 0,
          },
        };
      }

      // Fetch issues from all matching repositories
      const promises = repos.map((repo) =>
        fetchRepositoryIssues(repo, page, perPage)
      );
      const results = await Promise.all(promises);

      // Merge results from all repositories
      let allIssues: IssueType[] = [];
      let totalCount = 0;

      results.forEach((result) => {
        allIssues = [...allIssues, ...result.issues];
        totalCount += result.totalCount;
      });

      // Sort issues by updated date
      allIssues.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      // Paginate results
      const startIndex = 0; // No extra pagination needed — the API already returns the requested page
      const endIndex = allIssues.length;
      const paginatedIssues = allIssues.slice(startIndex, endIndex);

      return {
        issues: paginatedIssues,
        pagination: {
          currentPage: page,
          perPage,
          totalCount,
        },
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Thunk to fetch a single issue from a specific repository
export const fetchRepositoryIssueThunk = createAsyncThunk(
  "repositories/fetchIssue",
  async (
    {
      repoId,
      issueNumber,
    }: {
      repoId: string;
      issueNumber: number;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { repositories: RepositoriesState };
      const repository = state.repositories.repositories.find(
        (repo) => repo.id === repoId
      );

      if (!repository) {
        throw new Error(`Repository ${repoId} not found`);
      }

      const issue = await fetchRepositoryIssue(repository, issueNumber);
      return issue;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Create the store slice
export const repositoriesSlice = createSlice({
  name: "repositories",
  initialState,
  reducers: {
    // Add a new repository
    addRepository: (state, action: PayloadAction<RepositorySource>) => {
      // Check if a repository with the same ID already exists
      const exists = state.repositories.some(
        (repo) => repo.id === action.payload.id
      );
      if (!exists) {
        state.repositories.push(action.payload);
      }
    },

    // Update an existing repository
    updateRepository: (state, action: PayloadAction<RepositorySource>) => {
      const index = state.repositories.findIndex(
        (repo) => repo.id === action.payload.id
      );
      if (index !== -1) {
        state.repositories[index] = action.payload;
      }
    },

    // Remove a repository
    removeRepository: (state, action: PayloadAction<string>) => {
      state.repositories = state.repositories.filter(
        (repo) => repo.id !== action.payload
      );
    },

    // Toggle repository active state
    toggleRepositoryActive: (state, action: PayloadAction<string>) => {
      const repository = state.repositories.find(
        (repo) => repo.id === action.payload
      );
      if (repository) {
        repository.isActive = !repository.isActive;
      }
    },

    // Add a new category
    addCategory: (state, action: PayloadAction<CategoryType>) => {
      const exists = state.categories.some(
        (cat) => cat.id === action.payload.id
      );
      if (!exists) {
        state.categories.push(action.payload);
      }
    },

    // Update a category
    updateCategory: (state, action: PayloadAction<CategoryType>) => {
      const index = state.categories.findIndex(
        (cat) => cat.id === action.payload.id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },

    // Remove a category
    removeCategory: (state, action: PayloadAction<string>) => {
      // Cannot remove the default "all" category
      if (action.payload === "all") return;

      state.categories = state.categories.filter(
        (cat) => cat.id !== action.payload
      );

      // Reset repositories using this category to uncategorized
      state.repositories.forEach((repo) => {
        if (repo.category === action.payload) {
          repo.category = undefined;
        }
      });
    },

    // Set the active category
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload;
      // Reset pagination
      state.pagination.currentPage = 1;
      state.issues = [];
    },

    // Clear the current issue
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },

    // Set the current page number
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },

    // Set items per page
    setPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.perPage = action.payload;
    },

    // Clear all issues
    clearIssues: (state) => {
      state.issues = [];
      state.pagination.currentPage = 1;
      state.hasMorePages = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetch issues by category
      .addCase(fetchIssuesByCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIssuesByCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { currentPage, totalCount } = action.payload.pagination;

        // If page 1, replace all data; otherwise append to existing data
        if (currentPage === 1) {
          state.issues = action.payload.issues;
        } else {
          state.issues = [...state.issues, ...action.payload.issues];
        }

        state.pagination = action.payload.pagination;
        state.hasMorePages = calcHasMorePages(
          action.payload.issues.length,
          action.payload.pagination.perPage,
          totalCount,
          state.issues.length
        );

        state.error = null;
      })
      .addCase(fetchIssuesByCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch issues";
      })

      // Handle fetch single issue
      .addCase(fetchRepositoryIssueThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRepositoryIssueThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentIssue = action.payload;
        state.error = null;
      })
      .addCase(fetchRepositoryIssueThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch issue";
      });
  },
});

// Export actions
export const {
  addRepository,
  updateRepository,
  removeRepository,
  toggleRepositoryActive,
  addCategory,
  updateCategory,
  removeCategory,
  setActiveCategory,
  clearCurrentIssue,
  setPage,
  setPerPage,
  clearIssues,
} = repositoriesSlice.actions;

export default repositoriesSlice.reducer;
