import { configureStore } from "@reduxjs/toolkit";
import preferencesReducer from "../../features/preferences/preferencesSlice.js";
import recordsReducer from "../../features/records/recordsSlice.js";
import practiceReducer from "../../features/practice/practiceSlice.js";
import { createPreloadedState } from "../persistence/preloadedState.js";
import { persistState } from "../persistence/persistState.js";

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    records: recordsReducer,
    practice: practiceReducer
  },
  preloadedState: createPreloadedState()
});

persistState(store);
