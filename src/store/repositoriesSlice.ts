import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RepositorySource, CategoryType, IssueType } from "../types";
import { fetchRepositoryIssues, fetchRepositoryIssue } from "../api/repositoryApi";

// 定義 state 接口
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

// 初始狀態
const initialState: RepositoriesState = {
  repositories: [
    {
      id: "grapevine",
      name: "Grapevine Community",
      owner: import.meta.env.VITE_GITHUB_REPO_OWNER,
      repo: import.meta.env.VITE_GITHUB_REPO_NAME,
      description: "Main Grapevine community discussions",
      isActive: true,
      category: "community"
    },
    {
      id: "f2e-jobs",
      name: "F2E Jobs",
      owner: "f2etw",
      repo: "jobs",
      description: "Front-end job listings",
      isActive: true,
      category: "jobs"
    }
  ],
  categories: [
    {
      id: "all",
      name: "All Sources",
      description: "All available repositories",
      isDefault: true,
      order: 0
    },
    {
      id: "community",
      name: "Community",
      description: "Community discussions",
      order: 1
    },
    {
      id: "jobs",
      name: "Jobs",
      description: "Job listings and opportunities",
      order: 2
    }
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
  activeCategory: "all"
};

// 根據選定的類別獲取問題的 Thunk
export const fetchIssuesByCategory = createAsyncThunk(
  "repositories/fetchIssuesByCategory",
  async (
    { 
      categoryId, 
      page, 
      perPage 
    }: { 
      categoryId: string; 
      page: number; 
      perPage: number 
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { repositories: RepositoriesState };
      let repos = state.repositories.repositories.filter(repo => repo.isActive);
      
      // 如果不是 "all"，則按類別過濾倉庫
      if (categoryId !== "all") {
        repos = repos.filter(repo => repo.category === categoryId);
      }
      
      // 如果沒有可用倉庫，返回空結果
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
      
      // 獲取所有倉庫的問題
      const promises = repos.map(repo => fetchRepositoryIssues(repo, page, perPage));
      const results = await Promise.all(promises);
      
      // 合併結果
      let allIssues: IssueType[] = [];
      let totalCount = 0;
      
      results.forEach((result) => {
        allIssues = [...allIssues, ...result.issues];
        totalCount += result.totalCount;
      });
      
      // 按更新日期排序問題
      allIssues.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      
      // 分頁結果
      const startIndex = 0; // 不需要額外的分頁邏輯，因為 API 已經返回了請求的頁面
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
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

// 獲取特定倉庫中的單個問題
export const fetchRepositoryIssueThunk = createAsyncThunk(
  "repositories/fetchIssue",
  async (
    { 
      repoId, 
      issueNumber 
    }: { 
      repoId: string; 
      issueNumber: number 
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { repositories: RepositoriesState };
      const repository = state.repositories.repositories.find(repo => repo.id === repoId);
      
      if (!repository) {
        throw new Error(`Repository ${repoId} not found`);
      }
      
      const issue = await fetchRepositoryIssue(repository, issueNumber);
      return issue;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

// 創建存儲分片
export const repositoriesSlice = createSlice({
  name: "repositories",
  initialState,
  reducers: {
    // 添加新倉庫
    addRepository: (state, action: PayloadAction<RepositorySource>) => {
      // 檢查是否已存在相同ID的倉庫
      const exists = state.repositories.some(repo => repo.id === action.payload.id);
      if (!exists) {
        state.repositories.push(action.payload);
      }
    },
    
    // 編輯現有倉庫
    updateRepository: (state, action: PayloadAction<RepositorySource>) => {
      const index = state.repositories.findIndex(repo => repo.id === action.payload.id);
      if (index !== -1) {
        state.repositories[index] = action.payload;
      }
    },
    
    // 移除倉庫
    removeRepository: (state, action: PayloadAction<string>) => {
      state.repositories = state.repositories.filter(repo => repo.id !== action.payload);
    },
    
    // 切換倉庫活動狀態
    toggleRepositoryActive: (state, action: PayloadAction<string>) => {
      const repository = state.repositories.find(repo => repo.id === action.payload);
      if (repository) {
        repository.isActive = !repository.isActive;
      }
    },
    
    // 添加新分類
    addCategory: (state, action: PayloadAction<CategoryType>) => {
      const exists = state.categories.some(cat => cat.id === action.payload.id);
      if (!exists) {
        state.categories.push(action.payload);
      }
    },
    
    // 更新分類
    updateCategory: (state, action: PayloadAction<CategoryType>) => {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    
    // 移除分類
    removeCategory: (state, action: PayloadAction<string>) => {
      // 無法移除預設分類 (all)
      if (action.payload === "all") return;
      
      state.categories = state.categories.filter(cat => cat.id !== action.payload);
      
      // 將使用此分類的倉庫重置為無分類
      state.repositories.forEach(repo => {
        if (repo.category === action.payload) {
          repo.category = undefined;
        }
      });
    },
    
    // 設置活動分類
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload;
      // 重置分頁
      state.pagination.currentPage = 1;
      state.issues = [];
    },
    
    // 清除當前問題
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
    
    // 設置頁碼
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    
    // 設置每頁數量
    setPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.perPage = action.payload;
    },
    
    // 清除問題
    clearIssues: (state) => {
      state.issues = [];
      state.pagination.currentPage = 1;
      state.hasMorePages = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // 處理按類別獲取問題
      .addCase(fetchIssuesByCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIssuesByCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { currentPage, totalCount } = action.payload.pagination;
        
        // 如果是第一頁，替換所有數據，否則追加到現有數據
        if (currentPage === 1) {
          state.issues = action.payload.issues;
        } else {
          state.issues = [...state.issues, ...action.payload.issues];
        }
        
        state.pagination = action.payload.pagination;
        
        // 計算是否還有更多頁面：總數是否大於目前已載入的數量
        const loadedIssuesCount = state.issues.length;
        state.hasMorePages = totalCount > loadedIssuesCount;
        
        state.error = null;
      })
      .addCase(fetchIssuesByCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch issues";
      })
      
      // 處理獲取單個問題
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

// 導出 actions
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