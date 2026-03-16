import { useDispatch, useSelector } from "react-redux";
import { setScreen } from "../preferences/preferencesSlice.js";
import {
  selectPracticeInfoMessage,
  selectPracticeSettings,
  selectPracticeStage,
  selectResultButtonsEnabled
} from "./practiceSlice.js";
import { usePracticeRunner } from "./usePracticeRunner.js";

export function PracticeScreen() {
  const dispatch = useDispatch();
  const infoMessage = useSelector(selectPracticeInfoMessage);
  const stage = useSelector(selectPracticeStage);
  const settings = useSelector(selectPracticeSettings);
  const resultButtonsEnabled = useSelector(selectResultButtonsEnabled);
  const { runPractice, resetPractice, markPracticeResult } = usePracticeRunner();

  function handleStartPractice() {
    dispatch(setScreen("practice"));
    runPractice();
  }

  return (
    <section className="ld-panel">
      <div className="flex flex-wrap gap-3">
        <button className="ld-button ld-button-primary" onClick={handleStartPractice} type="button">
          Bắt đầu
        </button>
        <button className="ld-button ld-button-secondary" onClick={resetPractice} type="button">
          Đặt lại
        </button>
      </div>

      <div className="ld-subpanel mt-4 text-sm">
        {infoMessage}
      </div>

      <div className="practice-stage-wrap mt-5">
        <div className="practice-stage-label">{stage.label}</div>
        <div
          className={`practice-stage-display ${stage.mode === "hidden" ? "stage-hidden" : ""} ${
            stage.mode === "final" ? "stage-final" : ""
          }`}
        >
          {stage.text}
        </div>
      </div>

      {settings.showResultButtons ? (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            className="ld-button ld-button-success practice-result-btn"
            disabled={!resultButtonsEnabled}
            onClick={() => markPracticeResult("correct")}
            type="button"
          >
            Đọc được
          </button>
          <button
            className="ld-button ld-button-danger practice-result-btn"
            disabled={!resultButtonsEnabled}
            onClick={() => markPracticeResult("wrong")}
            type="button"
          >
            Không đọc được
          </button>
        </div>
      ) : null}
    </section>
  );
}
