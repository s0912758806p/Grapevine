import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  city?: string;
  country?: string;
  region?: string;
}

interface LocationState {
  currentLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  currentLocation: null,
  isLoading: false,
  error: null,
};

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocationLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setLocationSuccess: (state, action: PayloadAction<LocationData>) => {
      state.currentLocation = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateLocationAddress: (state, action: PayloadAction<{
      address?: string;
      city?: string;
      country?: string;
      region?: string;
    }>) => {
      if (state.currentLocation) {
        state.currentLocation = {
          ...state.currentLocation,
          ...action.payload
        };
      }
    },
    setLocationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearLocation: (state) => {
      state.currentLocation = null;
    },
  },
});

export const { 
  setLocationLoading, 
  setLocationSuccess, 
  setLocationError,
  updateLocationAddress,
  clearLocation 
} = locationSlice.actions;

export default locationSlice.reducer; 