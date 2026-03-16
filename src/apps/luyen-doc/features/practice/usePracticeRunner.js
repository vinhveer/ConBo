import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stopSpeech, speakVietnamese } from "../../infrastructure/browser/speech.js";
import {
  DEFAULT_STAGE,
  EMPTY_PRACTICE_MESSAGE,
  FIELD_META
} from "../../constants/practice.js";
import {
  createPreviewMessage,
  createRunningMessage
} from "../../lib/practice.js";
import {
  markRecordResult,
  selectRecords
} from "../records/recordsSlice.js";
import {
  advancePointer,
  resetPointer,
  selectCurrentRecordId,
  selectPracticeOrder,
  selectPracticePointer,
  selectPracticeSettings,
  selectPracticeTiming,
  setInfoMessage,
  setResultButtonsEnabled,
  setStage,
  setStatus
} from "./practiceSlice.js";

export function usePracticeRunner() {
  const dispatch = useDispatch();
  const records = useSelector(selectRecords);
  const order = useSelector(selectPracticeOrder);
  const pointer = useSelector(selectPracticePointer);
  const currentRecordId = useSelector(selectCurrentRecordId);
  const settings = useSelector(selectPracticeSettings);
  const timing = useSelector(selectPracticeTiming);
  const timersRef = useRef([]);
  const pendingRunRef = useRef(false);

  const currentRecord = records.find((record) => record.id === currentRecordId) || null;
  const orderSignature = order.join("|");
  const currentRecordSignature = currentRecord
    ? `${currentRecord.id}:${currentRecord.initial}:${currentRecord.rhyme}:${currentRecord.word}`
    : "";
  const stageOrderSignature = settings.stageOrder.join("|");

  function clearScheduledWork() {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }

  function showEmptyState() {
    dispatch(setResultButtonsEnabled(false));
    dispatch(setStatus("idle"));
    dispatch(setStage(DEFAULT_STAGE));
    dispatch(setInfoMessage(EMPTY_PRACTICE_MESSAGE));
  }

  function showMissingState() {
    dispatch(setResultButtonsEnabled(false));
    dispatch(setStatus("idle"));
    dispatch(setStage(DEFAULT_STAGE));
    dispatch(setInfoMessage("Không tìm thấy record để luyện."));
  }

  function showPreview(record) {
    dispatch(setResultButtonsEnabled(false));
    dispatch(setStatus("idle"));
    dispatch(setStage(DEFAULT_STAGE));
    dispatch(
      setInfoMessage(
        createPreviewMessage({
          record,
          stageOrder: settings.stageOrder
        })
      )
    );
  }

  function runPractice() {
    if (!records.length || !order.length) {
      showEmptyState();
      return;
    }

    if (!currentRecord) {
      showMissingState();
      return;
    }

    clearScheduledWork();
    stopSpeech();
    dispatch(setResultButtonsEnabled(false));
    dispatch(setStatus("running"));
    dispatch(
      setInfoMessage(
        createRunningMessage({
          record: currentRecord,
          stageOrder: settings.stageOrder
        })
      )
    );

    const hideMs = timing.hideSeconds * 1000;
    let elapsedMs = 0;

    settings.stageOrder.forEach((field, index) => {
      const meta = FIELD_META[field];
      const isLastStage = index === settings.stageOrder.length - 1;
      const durationMs = timing[meta.timingKey] * 1000;

      timersRef.current.push(
        window.setTimeout(() => {
          dispatch(
            setStage({
              label: meta.label,
              text: currentRecord[field],
              mode: meta.final && isLastStage ? "final" : ""
            })
          );

          if (field === "word") {
            speakVietnamese(currentRecord[field], settings.speechEnabled);
          }
        }, elapsedMs)
      );

      if (isLastStage) {
        timersRef.current.push(
          window.setTimeout(() => {
            if (settings.showResultButtons) {
              dispatch(setResultButtonsEnabled(true));
              dispatch(setStatus("awaiting_result"));
              return;
            }

            if (pointer < order.length - 1) {
              pendingRunRef.current = true;
              dispatch(advancePointer());
              return;
            }

            dispatch(setStatus("idle"));
          }, elapsedMs + durationMs)
        );
        return;
      }

      elapsedMs += durationMs;

      timersRef.current.push(
        window.setTimeout(() => {
          dispatch(setStage({ label: "", text: "", mode: "hidden" }));
        }, elapsedMs)
      );

      elapsedMs += hideMs;
    });
  }

  function resetPractice() {
    clearScheduledWork();
    stopSpeech();

    if (!order.length) {
      showEmptyState();
      return;
    }

    if (pointer !== 0) {
      pendingRunRef.current = settings.autoRun;
      dispatch(resetPointer());
      return;
    }

    if (!currentRecord) {
      showMissingState();
      return;
    }

    showPreview(currentRecord);

    if (settings.autoRun) {
      runPractice();
    }
  }

  function markPracticeResult(result) {
    clearScheduledWork();
    stopSpeech();

    if (!currentRecord) {
      return;
    }

    dispatch(markRecordResult({ id: currentRecord.id, result }));

    if (pointer < order.length - 1) {
      pendingRunRef.current = settings.autoRun;
      dispatch(advancePointer());
      return;
    }

    showPreview(currentRecord);
  }

  useEffect(() => {
    return () => {
      clearScheduledWork();
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    clearScheduledWork();
    stopSpeech();

    if (!records.length || !order.length) {
      showEmptyState();
      return;
    }

    if (!currentRecord) {
      showMissingState();
      return;
    }

    showPreview(currentRecord);
  }, [dispatch, records.length, orderSignature, currentRecordSignature, pointer, stageOrderSignature]);

  useEffect(() => {
    if (!pendingRunRef.current || !currentRecord) {
      return;
    }

    pendingRunRef.current = false;
    runPractice();
  }, [pointer, currentRecordId]);

  return {
    runPractice,
    resetPractice,
    markPracticeResult
  };
}
