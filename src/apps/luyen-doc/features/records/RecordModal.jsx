import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppModal } from "../../ui/AppModal.jsx";
import {
  addRecord,
  closeModal,
  selectEditingRecord,
  selectIsRecordModalOpen,
  updateRecord
} from "./recordsSlice.js";

const EMPTY_FORM = {
  initial: "",
  rhyme: "",
  word: ""
};

export function RecordModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsRecordModalOpen);
  const editingRecord = useSelector(selectEditingRecord);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(
      editingRecord
        ? {
            initial: editingRecord.initial,
            rhyme: editingRecord.rhyme,
            word: editingRecord.word
          }
        : EMPTY_FORM
    );
  }, [isOpen, editingRecord]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      initial: form.initial.trim(),
      rhyme: form.rhyme.trim(),
      word: form.word.trim()
    };

    if (!payload.initial || !payload.rhyme || !payload.word) {
      window.alert("Cần nhập đủ chữ đầu, vần, chữ.");
      return;
    }

    if (editingRecord) {
      dispatch(updateRecord({ id: editingRecord.id, changes: payload }));
      return;
    }

    dispatch(addRecord(payload));
  }

  return (
    <AppModal
      footer={
        <>
          <button className="ld-button ld-button-secondary" onClick={() => dispatch(closeModal())} type="button">
            Đóng
          </button>
          <button className="ld-button ld-button-primary" form="record-form" type="submit">
            {editingRecord ? "Cập nhật" : "Lưu"}
          </button>
        </>
      }
      onClose={() => dispatch(closeModal())}
      open={isOpen}
      title={editingRecord ? "Sửa từ" : "Thêm từ mới"}
    >
      <form className="space-y-4" id="record-form" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="ld-label" htmlFor="initialInput">
            Chữ đầu
          </label>
          <input
            className="ld-input"
            id="initialInput"
            maxLength={20}
            name="initial"
            onChange={handleChange}
            type="text"
            value={form.initial}
          />
        </div>

        <div className="space-y-2">
          <label className="ld-label" htmlFor="rhymeInput">
            Vần
          </label>
          <input
            className="ld-input"
            id="rhymeInput"
            maxLength={20}
            name="rhyme"
            onChange={handleChange}
            type="text"
            value={form.rhyme}
          />
        </div>

        <div className="space-y-2">
          <label className="ld-label" htmlFor="wordInput">
            Chữ
          </label>
          <input
            className="ld-input"
            id="wordInput"
            maxLength={60}
            name="word"
            onChange={handleChange}
            type="text"
            value={form.word}
          />
        </div>
      </form>
    </AppModal>
  );
}
