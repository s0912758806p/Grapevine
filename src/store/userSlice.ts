import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAuthor } from "../api/repositoryApi";

interface UserState {
  currentUser: string | null;
  isAuthor: boolean;
}

const initialState: UserState = {
  currentUser: "visitor", // Default to guest user
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
    // Simulated login — in production this will go through a real auth system
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
