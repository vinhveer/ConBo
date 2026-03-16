import {
  PRACTICE_SETTINGS_KEY,
  RECORDS_KEY,
  THEME_KEY,
  TIMING_KEY
} from "../../constants/storageKeys.js";
import { saveJson } from "./localStorage.js";

export function persistState(store) {
  let previousState = {
    records: "",
    timing: "",
    practiceSettings: "",
    theme: ""
  };

  store.subscribe(() => {
    const state = store.getState();
    const nextState = {
      records: JSON.stringify(state.records.items),
      timing: JSON.stringify(state.practice.timing),
      practiceSettings: JSON.stringify(state.practice.settings),
      theme: JSON.stringify(state.preferences.theme)
    };

    if (nextState.records !== previousState.records) {
      saveJson(RECORDS_KEY, state.records.items);
    }

    if (nextState.timing !== previousState.timing) {
      saveJson(TIMING_KEY, state.practice.timing);
    }

    if (nextState.practiceSettings !== previousState.practiceSettings) {
      saveJson(PRACTICE_SETTINGS_KEY, state.practice.settings);
    }

    if (nextState.theme !== previousState.theme) {
      saveJson(THEME_KEY, state.preferences.theme);
    }

    previousState = nextState;
  });
}
