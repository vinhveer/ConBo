import { createSlice } from "@reduxjs/toolkit";

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: {
    theme: "light",
    screen: "settings"
  },
  reducers: {
    setScreen(state, action) {
      state.screen = action.payload === "practice" ? "practice" : "settings";
    },
    setTheme(state, action) {
      state.theme = action.payload === "dark" ? "dark" : "light";
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    }
  }
});

export const { setScreen, setTheme, toggleTheme } = preferencesSlice.actions;

export const selectTheme = (state) => state.preferences.theme;
export const selectScreen = (state) => state.preferences.screen;

export default preferencesSlice.reducer;
