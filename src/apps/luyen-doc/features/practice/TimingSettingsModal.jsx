import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FIELD_META, FIELD_OPTIONS } from "../../constants/practice.js";
import { AppModal } from "../../ui/AppModal.jsx";
import {
  closeTimingModal,
  selectIsTimingModalOpen,
  selectPracticeSettings,
  selectPracticeTiming,
  setSettings,
  setTiming
} from "./practiceSlice.js";

export function TimingSettingsModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsTimingModalOpen);
  const timing = useSelector(selectPracticeTiming);
  const settings = useSelector(selectPracticeSettings);
  const [form, setForm] = useState({
    ...timing,
    ...settings,
    stageOrder: [...settings.stageOrder]
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm({
      ...timing,
      ...settings,
      stageOrder: [...settings.stageOrder]
    });
  }, [isOpen, timing, settings]);

  function handleValueChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleStageOrderChange(index, value) {
    const nextStageOrder = [...form.stageOrder];
    nextStageOrder[index] = value;
    setForm((current) => ({ ...current, stageOrder: nextStageOrder }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextTiming = {
      initialSeconds: Number(form.initialSeconds),
      hideSeconds: Number(form.hideSeconds),
      rhymeSeconds: Number(form.rhymeSeconds),
      wordSeconds: Number(form.wordSeconds)
    };

    if (Object.values(nextTiming).some((value) => value <= 0)) {
      window.alert("Các giá trị thời gian phải lớn hơn 0.");
      return;
    }

    dispatch(setTiming(nextTiming));
    dispatch(
      setSettings({
        autoRun: form.autoRun,
        shuffle: form.shuffle,
        showResultButtons: form.showResultButtons,
        speechEnabled: form.speechEnabled,
        stageOrder: form.stageOrder
      })
    );
    dispatch(closeTimingModal());
  }

  return (
    <AppModal
      footer={
        <>
          <button className="ld-button ld-button-secondary" onClick={() => dispatch(closeTimingModal())} type="button">
            Đóng
          </button>
          <button className="ld-button ld-button-primary" form="timing-form" type="submit">
            Lưu cài đặt
          </button>
        </>
      }
      onClose={() => dispatch(closeTimingModal())}
      open={isOpen}
      size="wide"
      title="Cài đặt thời gian hiển thị"
    >
      <form className="space-y-6" id="timing-form" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ld-label" htmlFor="initialSecondsInput">
              Giây chữ đầu
            </label>
            <input
              className="ld-input"
              id="initialSecondsInput"
              min="0.2"
              name="initialSeconds"
              onChange={handleValueChange}
              step="0.1"
              type="number"
              value={form.initialSeconds}
            />
          </div>

          <div className="space-y-2">
            <label className="ld-label" htmlFor="hideSecondsInput">
              Giây ẩn
            </label>
            <input
              className="ld-input"
              id="hideSecondsInput"
              min="0.1"
              name="hideSeconds"
              onChange={handleValueChange}
              step="0.1"
              type="number"
              value={form.hideSeconds}
            />
          </div>

          <div className="space-y-2">
            <label className="ld-label" htmlFor="rhymeSecondsInput">
              Giây vần
            </label>
            <input
              className="ld-input"
              id="rhymeSecondsInput"
              min="0.2"
              name="rhymeSeconds"
              onChange={handleValueChange}
              step="0.1"
              type="number"
              value={form.rhymeSeconds}
            />
          </div>

          <div className="space-y-2">
            <label className="ld-label" htmlFor="wordSecondsInput">
              Giây từ
            </label>
            <input
              className="ld-input"
              id="wordSecondsInput"
              min="0.2"
              name="wordSeconds"
              onChange={handleValueChange}
              step="0.1"
              type="number"
              value={form.wordSeconds}
            />
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        <div className="grid gap-3">
          <label className="ld-switch">
            <input
              checked={form.autoRun}
              className="ld-switch-input"
              id="autoRunToggle"
              name="autoRun"
              onChange={handleValueChange}
              type="checkbox"
            />
            <span className="ld-switch-copy">
              <span className="ld-switch-title">Tự chạy</span>
              <span className="ld-switch-text">Tự qua record tiếp theo theo timing đã lưu.</span>
            </span>
          </label>

          <label className="ld-switch">
            <input
              checked={form.shuffle}
              className="ld-switch-input"
              id="shuffleToggle"
              name="shuffle"
              onChange={handleValueChange}
              type="checkbox"
            />
            <span className="ld-switch-copy">
              <span className="ld-switch-title">Shuffle</span>
              <span className="ld-switch-text">Xáo trộn danh sách record trước khi luyện.</span>
            </span>
          </label>

          <label className="ld-switch">
            <input
              checked={form.showResultButtons}
              className="ld-switch-input"
              id="showResultButtonsToggle"
              name="showResultButtons"
              onChange={handleValueChange}
              type="checkbox"
            />
            <span className="ld-switch-copy">
              <span className="ld-switch-title">Hiện nút kết quả</span>
              <span className="ld-switch-text">Cho phép đánh dấu Đọc được hoặc Không đọc được sau mỗi lượt.</span>
            </span>
          </label>

          <label className="ld-switch">
            <input
              checked={form.speechEnabled}
              className="ld-switch-input"
              id="speechEnabledToggle"
              name="speechEnabled"
              onChange={handleValueChange}
              type="checkbox"
            />
            <span className="ld-switch-copy">
              <span className="ld-switch-title">Đọc to tiếng Việt</span>
              <span className="ld-switch-text">Dùng trình đọc mặc định của trình duyệt, chỉ đọc ở bước từ cuối.</span>
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FIELD_OPTIONS.map((field, index) => (
            <div className="space-y-2" key={field}>
              <label className="ld-label" htmlFor={`stage-order-${field}`}>
                {index === 0 ? "Hiện trước" : index === 1 ? "Hiện thứ 2" : "Hiện thứ 3"}
              </label>
              <select
                className="ld-select"
                id={`stage-order-${field}`}
                onChange={(event) => handleStageOrderChange(index, event.target.value)}
                value={form.stageOrder[index]}
              >
                {FIELD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {FIELD_META[option].label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </form>
    </AppModal>
  );
}
