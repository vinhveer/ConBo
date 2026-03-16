import { createSlice } from "@reduxjs/toolkit";
import { uid } from "../../lib/uid.js";

const initialState = {
  items: [],
  selectedIds: [],
  isModalOpen: false,
  editingRecordId: null
};

const recordsSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    openCreateModal(state) {
      state.isModalOpen = true;
      state.editingRecordId = null;
    },
    openEditModal(state, action) {
      state.isModalOpen = true;
      state.editingRecordId = action.payload;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.editingRecordId = null;
    },
    addRecord: {
      reducer(state, action) {
        state.items.push({
          ...action.payload,
          correct: 0,
          wrong: 0
        });
        state.isModalOpen = false;
        state.editingRecordId = null;
      },
      prepare(payload) {
        return {
          payload: {
            id: uid(),
            initial: payload.initial,
            rhyme: payload.rhyme,
            word: payload.word
          }
        };
      }
    },
    updateRecord(state, action) {
      const { id, changes } = action.payload;
      state.items = state.items.map((record) => (record.id === id ? { ...record, ...changes } : record));
      state.isModalOpen = false;
      state.editingRecordId = null;
    },
    deleteSelectedRecords(state) {
      state.items = state.items.filter((record) => !state.selectedIds.includes(record.id));
      state.selectedIds = [];
    },
    clearAllRecords(state) {
      state.items = [];
      state.selectedIds = [];
    },
    setRowSelected(state, action) {
      const { id, selected } = action.payload;

      if (selected && !state.selectedIds.includes(id)) {
        state.selectedIds.push(id);
      }

      if (!selected) {
        state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
      }
    },
    setAllSelected(state, action) {
      state.selectedIds = action.payload ? state.items.map((record) => record.id) : [];
    },
    markRecordResult(state, action) {
      const { id, result } = action.payload;
      state.items = state.items.map((record) =>
        record.id === id
          ? {
              ...record,
              correct: record.correct + (result === "correct" ? 1 : 0),
              wrong: record.wrong + (result === "wrong" ? 1 : 0)
            }
          : record
      );
    }
  }
});

export const {
  openCreateModal,
  openEditModal,
  closeModal,
  addRecord,
  updateRecord,
  deleteSelectedRecords,
  clearAllRecords,
  setRowSelected,
  setAllSelected,
  markRecordResult
} = recordsSlice.actions;

export const selectRecords = (state) => state.records.items;
export const selectSelectedIds = (state) => state.records.selectedIds;
export const selectSelectedCount = (state) => state.records.selectedIds.length;
export const selectIsRecordModalOpen = (state) => state.records.isModalOpen;
export const selectEditingRecord = (state) =>
  state.records.items.find((record) => record.id === state.records.editingRecordId) || null;
export const selectIsAllSelected = (state) =>
  state.records.items.length > 0 && state.records.items.length === state.records.selectedIds.length;

export default recordsSlice.reducer;
