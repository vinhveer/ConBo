import { createSlice } from "@reduxjs/toolkit";
import {
  DEFAULT_PRACTICE_SETTINGS,
  DEFAULT_STAGE,
  DEFAULT_TIMING,
  EMPTY_PRACTICE_MESSAGE
} from "../../constants/practice.js";
import { normalizeStageOrder } from "../../lib/practice.js";

const initialState = {
  timing: { ...DEFAULT_TIMING },
  settings: { ...DEFAULT_PRACTICE_SETTINGS, stageOrder: [...DEFAULT_PRACTICE_SETTINGS.stageOrder] },
  order: [],
  pointer: 0,
  currentRecordId: null,
  stage: { ...DEFAULT_STAGE },
  infoMessage: EMPTY_PRACTICE_MESSAGE,
  status: "idle",
  resultButtonsEnabled: false,
  isTimingModalOpen: false
};

const practiceSlice = createSlice({
  name: "practice",
  initialState,
  reducers: {
    openTimingModal(state) {
      state.isTimingModalOpen = true;
    },
    closeTimingModal(state) {
      state.isTimingModalOpen = false;
    },
    setTiming(state, action) {
      state.timing = { ...DEFAULT_TIMING, ...action.payload };
    },
    setSettings(state, action) {
      state.settings = {
        ...DEFAULT_PRACTICE_SETTINGS,
        ...action.payload,
        stageOrder: normalizeStageOrder(
          action.payload.stageOrder || state.settings.stageOrder || DEFAULT_PRACTICE_SETTINGS.stageOrder
        )
      };
    },
    syncQueue(state, action) {
      state.order = action.payload.order;
      state.pointer = 0;
      state.currentRecordId = action.payload.order[0] || null;
    },
    resetPointer(state) {
      state.pointer = 0;
      state.currentRecordId = state.order[0] || null;
    },
    advancePointer(state) {
      if (state.pointer < state.order.length - 1) {
        state.pointer += 1;
      }

      state.currentRecordId = state.order[state.pointer] || null;
    },
    setStage(state, action) {
      state.stage = { ...DEFAULT_STAGE, ...action.payload };
    },
    setInfoMessage(state, action) {
      state.infoMessage = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setResultButtonsEnabled(state, action) {
      state.resultButtonsEnabled = action.payload;
    }
  }
});

export const {
  openTimingModal,
  closeTimingModal,
  setTiming,
  setSettings,
  syncQueue,
  resetPointer,
  advancePointer,
  setStage,
  setInfoMessage,
  setStatus,
  setResultButtonsEnabled
} = practiceSlice.actions;

export const selectPracticeTiming = (state) => state.practice.timing;
export const selectPracticeSettings = (state) => state.practice.settings;
export const selectPracticeShuffle = (state) => state.practice.settings.shuffle;
export const selectPracticeInfoMessage = (state) => state.practice.infoMessage;
export const selectPracticeStage = (state) => state.practice.stage;
export const selectPracticeOrder = (state) => state.practice.order;
export const selectPracticePointer = (state) => state.practice.pointer;
export const selectCurrentRecordId = (state) => state.practice.currentRecordId;
export const selectResultButtonsEnabled = (state) => state.practice.resultButtonsEnabled;
export const selectIsTimingModalOpen = (state) => state.practice.isTimingModalOpen;

export default practiceSlice.reducer;
