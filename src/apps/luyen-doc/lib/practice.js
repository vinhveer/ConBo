import { FIELD_META, FIELD_OPTIONS } from "../constants/practice.js";

export function shuffleArray(items) {
  const list = [...items];

  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }

  return list;
}

export function normalizeStageOrder(stageOrder = []) {
  const unique = [];

  stageOrder.forEach((value) => {
    if (FIELD_OPTIONS.includes(value) && !unique.includes(value)) {
      unique.push(value);
    }
  });

  FIELD_OPTIONS.forEach((value) => {
    if (!unique.includes(value)) {
      unique.push(value);
    }
  });

  return unique.slice(0, FIELD_OPTIONS.length);
}

export function buildPracticeSourceIds(records, selectedIds) {
  if (selectedIds.length) {
    return records.filter((record) => selectedIds.includes(record.id)).map((record) => record.id);
  }

  return records.map((record) => record.id);
}

export function buildPracticeOrder(records, selectedIds, shuffle) {
  const sourceIds = buildPracticeSourceIds(records, selectedIds);
  return shuffle ? shuffleArray(sourceIds) : sourceIds;
}

export function getStageOrderLabels(stageOrder) {
  return normalizeStageOrder(stageOrder)
    .map((field) => FIELD_META[field].label)
    .join(" -> ");
}

export function createPreviewMessage({ record, stageOrder }) {
  return `Chuẩn bị: ${record.initial} + ${record.rhyme} -> ${record.word} | thứ tự: ${getStageOrderLabels(stageOrder)}`;
}

export function createRunningMessage({ record, stageOrder }) {
  return `Đang chạy: ${record.initial} + ${record.rhyme} -> ${record.word} | thứ tự: ${getStageOrderLabels(stageOrder)}`;
}
