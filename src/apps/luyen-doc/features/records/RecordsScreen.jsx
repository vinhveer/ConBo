import { useDispatch, useSelector } from "react-redux";
import { openTimingModal } from "../practice/practiceSlice.js";
import {
  clearAllRecords,
  deleteSelectedRecords,
  openCreateModal,
  openEditModal,
  selectIsAllSelected,
  selectRecords,
  selectSelectedCount,
  selectSelectedIds,
  setAllSelected,
  setRowSelected
} from "./recordsSlice.js";

export function RecordsScreen() {
  const dispatch = useDispatch();
  const records = useSelector(selectRecords);
  const selectedIds = useSelector(selectSelectedIds);
  const selectedCount = useSelector(selectSelectedCount);
  const isAllSelected = useSelector(selectIsAllSelected);

  function handleDeleteSelected() {
    if (!selectedCount) {
      return;
    }

    if (window.confirm(`Xóa ${selectedCount} dòng đã chọn?`)) {
      dispatch(deleteSelectedRecords());
    }
  }

  function handleClearAll() {
    if (!records.length) {
      return;
    }

    if (window.confirm("Xóa toàn bộ dữ liệu?")) {
      dispatch(clearAllRecords());
    }
  }

  function handleEditSelected() {
    if (selectedIds.length === 1) {
      dispatch(openEditModal(selectedIds[0]));
    }
  }

  return (
    <section className="ld-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <button className="ld-button ld-button-primary" onClick={() => dispatch(openCreateModal())} type="button">
            Thêm từ mới
          </button>
          <button className="ld-button ld-button-danger" onClick={handleClearAll} type="button">
            Xóa tất cả
          </button>
        </div>

        <button className="ld-button ld-button-secondary" onClick={() => dispatch(openTimingModal())} type="button">
          Cài đặt thời gian hiển thị
        </button>
      </div>

      <div className="ld-subpanel mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {selectedCount
            ? `Đang chọn ${selectedCount} dòng. Phần Thực hành sẽ dùng đúng các dòng này.`
            : "Đang chọn 0 dòng. Nếu có chọn, phần Thực hành sẽ dùng các dòng này."}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="ld-button ld-button-secondary ld-button-sm"
            disabled={selectedCount !== 1}
            onClick={handleEditSelected}
            type="button"
          >
            Sửa dòng chọn
          </button>
          <button
            className="ld-button ld-button-danger ld-button-sm"
            disabled={!selectedCount}
            onClick={handleDeleteSelected}
            type="button"
          >
            Xóa dòng chọn
          </button>
        </div>
      </div>

      <div className="ld-table-wrap mt-5">
        <div className="overflow-x-auto">
          <table className="ld-table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    checked={isAllSelected}
                    className="ld-checkbox"
                    onChange={(event) => dispatch(setAllSelected(event.target.checked))}
                    type="checkbox"
                  />
                </th>
                <th>Chữ đầu</th>
                <th>Vần</th>
                <th>Chữ</th>
                <th>Đọc được</th>
                <th>Không đọc được</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const selected = selectedIds.includes(record.id);

                return (
                  <tr
                    className={`ld-table-row ${selected ? "is-selected" : ""}`}
                    key={record.id}
                    onClick={() => dispatch(setRowSelected({ id: record.id, selected: !selected }))}
                  >
                    <td>
                      <input
                        checked={selected}
                        className="ld-checkbox"
                        onChange={(event) =>
                          dispatch(setRowSelected({ id: record.id, selected: event.target.checked }))
                        }
                        onClick={(event) => event.stopPropagation()}
                        type="checkbox"
                      />
                    </td>
                    <td>{record.initial}</td>
                    <td>{record.rhyme}</td>
                    <td className="font-medium text-slate-900 dark:text-slate-100">{record.word}</td>
                    <td>{record.correct || 0}</td>
                    <td>{record.wrong || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!records.length ? (
        <div className="ld-empty-state mt-4">
          Chưa có record nào. Hãy bấm "Thêm từ mới".
        </div>
      ) : null}
    </section>
  );
}
