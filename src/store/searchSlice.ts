import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchFilter } from '../types';

interface SearchState {
  currentFilter: SearchFilter;
  savedFilters: SearchFilter[];
}

// 從本地存儲加載已保存的過濾器
const loadSavedFilters = (): SearchFilter[] => {
  try {
    const saved = localStorage.getItem('grapevine_saved_filters');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load saved filters:', error);
    return [];
  }
};

// 保存過濾器到本地存儲
const saveFiltersToStorage = (filters: SearchFilter[]) => {
  try {
    localStorage.setItem('grapevine_saved_filters', JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save filters:', error);
  }
};

const initialState: SearchState = {
  currentFilter: {},
  savedFilters: loadSavedFilters(),
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // 設置搜索過濾器
    setSearchFilter: (state, action: PayloadAction<SearchFilter>) => {
      state.currentFilter = action.payload;
    },
    
    // 清空搜索過濾器
    clearSearchFilter: (state) => {
      state.currentFilter = {};
    },
    
    // 保存搜索過濾器
    saveSearchFilter: (state, action: PayloadAction<SearchFilter>) => {
      // 確保過濾器有ID和名稱
      if (!action.payload.id) {
        action.payload.id = `filter-${Date.now()}`;
      }
      
      // 檢查是否已存在同名過濾器
      const existingIndex = state.savedFilters.findIndex(
        filter => filter.name === action.payload.name
      );
      
      if (existingIndex >= 0) {
        // 更新現有過濾器
        state.savedFilters[existingIndex] = action.payload;
      } else {
        // 添加新過濾器
        state.savedFilters.push(action.payload);
      }
      
      // 保存到本地存儲
      saveFiltersToStorage(state.savedFilters);
    },
    
    // 刪除已保存的過濾器
    removeSavedFilter: (state, action: PayloadAction<string>) => {
      state.savedFilters = state.savedFilters.filter(
        filter => filter.id !== action.payload
      );
      
      // 保存到本地存儲
      saveFiltersToStorage(state.savedFilters);
    },
    
    // 加載已保存的過濾器
    loadSavedFilter: (state, action: PayloadAction<string>) => {
      const filter = state.savedFilters.find(f => f.id === action.payload);
      if (filter) {
        state.currentFilter = { ...filter };
      }
    }
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