import {
  DEFAULT_PRACTICE_SETTINGS,
  DEFAULT_STAGE,
  DEFAULT_TIMING,
  EMPTY_PRACTICE_MESSAGE
} from "../../constants/practice.js";
import {
  PRACTICE_SETTINGS_KEY,
  RECORDS_KEY,
  THEME_KEY,
  TIMING_KEY
} from "../../constants/storageKeys.js";
import { normalizeStageOrder } from "../../lib/practice.js";
import { loadJson } from "./localStorage.js";

export function createPreloadedState() {
  const practiceSettings = loadJson(PRACTICE_SETTINGS_KEY, {});

  return {
    preferences: {
      theme: loadJson(THEME_KEY, "light") === "dark" ? "dark" : "light",
      screen: "settings"
    },
    records: {
      items: loadJson(RECORDS_KEY, []),
      selectedIds: [],
      isModalOpen: false,
      editingRecordId: null
    },
    practice: {
      timing: {
        ...DEFAULT_TIMING,
        ...loadJson(TIMING_KEY, {})
      },
      settings: {
        ...DEFAULT_PRACTICE_SETTINGS,
        ...practiceSettings,
        stageOrder: normalizeStageOrder(
          practiceSettings.stageOrder || DEFAULT_PRACTICE_SETTINGS.stageOrder
        )
      },
      order: [],
      pointer: 0,
      currentRecordId: null,
      stage: { ...DEFAULT_STAGE },
      infoMessage: EMPTY_PRACTICE_MESSAGE,
      status: "idle",
      resultButtonsEnabled: false,
      isTimingModalOpen: false
    }
  };
}
