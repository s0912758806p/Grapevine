import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAuthor } from "../api/repositoryApi";

interface UserState {
  currentUser: string | null;
  isAuthor: boolean;
}

const initialState: UserState = {
  currentUser: "visitor", // 默認為訪客用戶
  isAuthor: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<string | null>) => {
      state.currentUser = action.payload;
      state.isAuthor = isAuthor(action.payload);
    },
    // 模擬用戶登入 - 在實際應用中，這將通過真實的身份驗證系統實現
    loginAsAdmin: (state) => {
      state.currentUser = "admin";
      state.isAuthor = true;
    },
    loginAsUser: (state) => {
      state.currentUser = "visitor";
      state.isAuthor = false;
    },
  },
});

export const { setCurrentUser, loginAsAdmin, loginAsUser } = userSlice.actions;

export default userSlice.reducer;
