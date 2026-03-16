export const FIELD_OPTIONS = ["initial", "rhyme", "word"];

export const FIELD_META = {
  initial: { label: "Chữ đầu", timingKey: "initialSeconds", final: false },
  rhyme: { label: "Vần", timingKey: "rhymeSeconds", final: false },
  word: { label: "Từ", timingKey: "wordSeconds", final: true }
};

export const DEFAULT_TIMING = {
  initialSeconds: 1,
  hideSeconds: 0.3,
  rhymeSeconds: 1,
  wordSeconds: 1
};

export const DEFAULT_PRACTICE_SETTINGS = {
  autoRun: false,
  shuffle: false,
  showResultButtons: true,
  speechEnabled: false,
  stageOrder: [...FIELD_OPTIONS]
};

export const DEFAULT_STAGE = {
  label: "Sẵn sàng",
  text: "",
  mode: ""
};

export const EMPTY_PRACTICE_MESSAGE = "Chưa có dữ liệu luyện tập.";
