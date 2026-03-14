const RECORDS_KEY = "reading-bootstrap-records-v1";
const TIMING_KEY = "reading-bootstrap-timing-v1";

const appState = {
  records: [],
  selectedIds: [],
  timing: {
    initialSeconds: 1,
    hideSeconds: 0.3,
    rhymeSeconds: 1
  },
  practiceOrder: [],
  practicePointer: 0,
  currentRecordId: null,
  timers: [],
  recordModal: null,
  timingModal: null
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveRecords() {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(appState.records));
}

function saveTiming() {
  localStorage.setItem(TIMING_KEY, JSON.stringify(appState.timing));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function resetTimers() {
  appState.timers.forEach((timerId) => clearTimeout(timerId));
  appState.timers = [];
}

function setScreen(screen) {
  $(".nav-screen-btn").removeClass("active");
  $(`.nav-screen-btn[data-screen="${screen}"]`).addClass("active");
  $(".screen-section").addClass("d-none");
  screen === "settings" ? $("#settingsScreen").removeClass("d-none") : $("#practiceScreen").removeClass("d-none");
}

function getPracticeSourceIds() {
  if (appState.selectedIds.length) {
    return appState.records
      .filter((record) => appState.selectedIds.includes(record.id))
      .map((record) => record.id);
  }
  return appState.records.map((record) => record.id);
}

function rebuildPracticeOrder(resetPointer = true) {
  appState.practiceOrder = getPracticeSourceIds();
  if (resetPointer || appState.practicePointer >= appState.practiceOrder.length) {
    appState.practicePointer = 0;
  }
  syncCurrentPracticeRecord();
}

function syncCurrentPracticeRecord() {
  appState.currentRecordId = appState.practiceOrder[appState.practicePointer] || null;
}

function getCurrentRecord() {
  return appState.records.find((record) => record.id === appState.currentRecordId) || null;
}

function renderTimingForm() {
  $("#initialSecondsInput").val(appState.timing.initialSeconds);
  $("#hideSecondsInput").val(appState.timing.hideSeconds);
  $("#rhymeSecondsInput").val(appState.timing.rhymeSeconds);
}

function renderSelectionSummary() {
  const count = appState.selectedIds.length;
  $("#selectionSummary").text(
    count
      ? `Đang chọn ${count} dòng. Phần Thực hành sẽ dùng đúng các dòng này.`
      : "Đang chọn 0 dòng. Nếu có chọn, phần Thực hành sẽ dùng các dòng này."
  );

  $("#editSelectedBtn").prop("disabled", count !== 1);
  $("#deleteSelectedBtn").prop("disabled", count === 0);
}

function renderTable() {
  const rows = appState.records
    .map((record) => {
      const selected = appState.selectedIds.includes(record.id);
      return `
        <tr class="selectable-row ${selected ? "row-selected" : ""}" data-id="${record.id}">
          <td>
            <input class="form-check-input row-checkbox" type="checkbox" data-id="${record.id}" ${selected ? "checked" : ""} />
          </td>
          <td>${escapeHtml(record.initial)}</td>
          <td>${escapeHtml(record.rhyme)}</td>
          <td>${escapeHtml(record.word)}</td>
          <td>${record.correct || 0}</td>
          <td>${record.wrong || 0}</td>
        </tr>
      `;
    })
    .join("");

  $("#recordsTableBody").html(rows);
  $("#emptyTableState").toggleClass("d-none", appState.records.length > 0);
  $("#selectAllRows").prop(
    "checked",
    appState.records.length > 0 && appState.selectedIds.length === appState.records.length
  );
  renderSelectionSummary();
}

function renderPracticeInfo(message) {
  if (message) {
    $("#practiceInfo").text(message);
    return;
  }

  const total = appState.practiceOrder.length || getPracticeSourceIds().length;
  const current = appState.currentRecordId ? appState.practicePointer + 1 : 0;
  const sourceText = appState.selectedIds.length
    ? `đang luyện ${appState.selectedIds.length} dòng đã chọn`
    : `đang luyện toàn bộ ${appState.records.length} dòng`;

  $("#practiceInfo").text(total ? `${sourceText} | vị trí ${current}/${total}` : "Chưa có dữ liệu luyện tập.");
}

function setStage(label, text, mode = "") {
  $("#stageLabel").text(label);
  $("#stageDisplay")
    .removeClass("stage-hidden stage-final")
    .toggleClass("stage-hidden", mode === "hidden")
    .toggleClass("stage-final", mode === "final")
    .text(text);
}

function setPracticeButtons(enabled) {
  $(".practice-result-btn").prop("disabled", !enabled);
}

function previewCurrentRecord() {
  resetTimers();
  setPracticeButtons(false);

  if (!appState.records.length) {
    appState.currentRecordId = null;
    setStage("Sẵn sàng", "|");
    renderPracticeInfo("Chưa có dữ liệu luyện tập.");
    return;
  }

  if (!appState.practiceOrder.length) {
    rebuildPracticeOrder();
  }

  syncCurrentPracticeRecord();
  const record = getCurrentRecord();
  if (!record) {
    setStage("Sẵn sàng", "|");
    renderPracticeInfo("Không tìm thấy record để luyện.");
    return;
  }

  setStage("Sẵn sàng", "|");
  renderPracticeInfo(`Chuẩn bị: ${record.initial} + ${record.rhyme} -> ${record.word}`);
}

function runPractice() {
  if (!appState.records.length) {
    previewCurrentRecord();
    return;
  }

  if (!appState.practiceOrder.length) {
    rebuildPracticeOrder();
  }

  syncCurrentPracticeRecord();
  const record = getCurrentRecord();
  if (!record) {
    previewCurrentRecord();
    return;
  }

  const initialMs = appState.timing.initialSeconds * 1000;
  const hideMs = appState.timing.hideSeconds * 1000;
  const rhymeMs = appState.timing.rhymeSeconds * 1000;

  resetTimers();
  setPracticeButtons(false);
  renderPracticeInfo(`Đang chạy: ${record.initial} + ${record.rhyme} -> ${record.word}`);

  setStage("Chữ đầu", record.initial);

  appState.timers.push(
    setTimeout(() => {
      setStage("Ẩn", "|", "hidden");
    }, initialMs)
  );

  appState.timers.push(
    setTimeout(() => {
      setStage("Vần", record.rhyme);
    }, initialMs + hideMs)
  );

  appState.timers.push(
    setTimeout(() => {
      setStage("Ẩn", "|", "hidden");
    }, initialMs + hideMs + rhymeMs)
  );

  appState.timers.push(
    setTimeout(() => {
      setStage("Chữ", record.word, "final");
      setPracticeButtons(true);
    }, initialMs + hideMs + rhymeMs + hideMs)
  );
}

function openRecordModal(record = null) {
  $("#recordModalTitle").text(record ? "Sửa từ" : "Thêm từ mới");
  $("#saveRecordBtn").text(record ? "Cập nhật" : "Lưu");
  $("#editId").val(record ? record.id : "");
  $("#initialInput").val(record ? record.initial : "");
  $("#rhymeInput").val(record ? record.rhyme : "");
  $("#wordInput").val(record ? record.word : "");
  appState.recordModal.show();
}

function handleSaveRecord() {
  const editId = $("#editId").val();
  const payload = {
    initial: $("#initialInput").val().trim(),
    rhyme: $("#rhymeInput").val().trim(),
    word: $("#wordInput").val().trim()
  };

  if (!payload.initial || !payload.rhyme || !payload.word) {
    alert("Cần nhập đủ chữ đầu, vần, chữ.");
    return;
  }

  if (editId) {
    appState.records = appState.records.map((record) =>
      record.id === editId ? { ...record, ...payload } : record
    );
  } else {
    appState.records.push({
      id: uid(),
      ...payload,
      correct: 0,
      wrong: 0
    });
  }

  saveRecords();
  rebuildPracticeOrder();
  renderTable();
  previewCurrentRecord();
  appState.recordModal.hide();
}

function deleteSelectedRecords() {
  if (!appState.selectedIds.length) {
    return;
  }

  if (!window.confirm(`Xóa ${appState.selectedIds.length} dòng đã chọn?`)) {
    return;
  }

  appState.records = appState.records.filter((record) => !appState.selectedIds.includes(record.id));
  appState.selectedIds = [];
  saveRecords();
  rebuildPracticeOrder();
  renderTable();
  previewCurrentRecord();
}

function clearAllRecords() {
  if (!appState.records.length) {
    return;
  }

  if (!window.confirm("Xóa toàn bộ dữ liệu?")) {
    return;
  }

  appState.records = [];
  appState.selectedIds = [];
  saveRecords();
  rebuildPracticeOrder();
  renderTable();
  previewCurrentRecord();
}

function saveTimingFromForm() {
  const initialSeconds = Number($("#initialSecondsInput").val());
  const hideSeconds = Number($("#hideSecondsInput").val());
  const rhymeSeconds = Number($("#rhymeSecondsInput").val());

  if (initialSeconds <= 0 || hideSeconds <= 0 || rhymeSeconds <= 0) {
    alert("Các giá trị thời gian phải lớn hơn 0.");
    return;
  }

  appState.timing = {
    initialSeconds,
    hideSeconds,
    rhymeSeconds
  };
  saveTiming();
  appState.timingModal.hide();
}

function toggleRowSelection(id, checked) {
  if (checked) {
    if (!appState.selectedIds.includes(id)) {
      appState.selectedIds.push(id);
    }
  } else {
    appState.selectedIds = appState.selectedIds.filter((selectedId) => selectedId !== id);
  }

  rebuildPracticeOrder();
  renderTable();
  previewCurrentRecord();
}

function setPointer(nextPointer) {
  if (!appState.practiceOrder.length) {
    rebuildPracticeOrder();
  }
  if (!appState.practiceOrder.length) {
    previewCurrentRecord();
    return;
  }

  appState.practicePointer = Math.max(0, Math.min(nextPointer, appState.practiceOrder.length - 1));
  syncCurrentPracticeRecord();
  previewCurrentRecord();
}

function markResult(type) {
  const record = getCurrentRecord();
  if (!record) {
    return;
  }

  appState.records = appState.records.map((item) =>
    item.id === record.id
      ? {
          ...item,
          correct: item.correct + (type === "correct" ? 1 : 0),
          wrong: item.wrong + (type === "wrong" ? 1 : 0)
        }
      : item
  );

  saveRecords();
  renderTable();

  if (appState.practicePointer < appState.practiceOrder.length - 1) {
    appState.practicePointer += 1;
  }
  syncCurrentPracticeRecord();
  previewCurrentRecord();
}

function exportBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    timing: appState.timing,
    records: appState.records
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `luyen-doc-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

$(function () {
  appState.records = loadJson(RECORDS_KEY, []);
  appState.timing = { ...appState.timing, ...loadJson(TIMING_KEY, {}) };
  appState.recordModal = new bootstrap.Modal(document.getElementById("recordModal"));
  appState.timingModal = new bootstrap.Modal(document.getElementById("timingModal"));

  renderTimingForm();
  rebuildPracticeOrder();
  renderTable();
  previewCurrentRecord();

  $(document).on("click", ".nav-screen-btn", function () {
    setScreen($(this).data("screen"));
  });

  $("#exportBackupBtn").on("click", exportBackup);

  $("#addWordBtn").on("click", function () {
    openRecordModal();
  });

  $("#timingSettingsBtn").on("click", function () {
    renderTimingForm();
    appState.timingModal.show();
  });

  $("#recordForm").on("submit", function (event) {
    event.preventDefault();
    handleSaveRecord();
  });

  $("#timingForm").on("submit", function (event) {
    event.preventDefault();
    saveTimingFromForm();
  });

  $("#clearAllBtn").on("click", clearAllRecords);
  $("#deleteSelectedBtn").on("click", deleteSelectedRecords);

  $("#editSelectedBtn").on("click", function () {
    if (appState.selectedIds.length !== 1) {
      return;
    }
    const record = appState.records.find((item) => item.id === appState.selectedIds[0]);
    if (record) {
      openRecordModal(record);
    }
  });

  $("#selectAllRows").on("change", function () {
    appState.selectedIds = $(this).is(":checked") ? appState.records.map((record) => record.id) : [];
    rebuildPracticeOrder();
    renderTable();
    previewCurrentRecord();
  });

  $(document).on("change", ".row-checkbox", function (event) {
    event.stopPropagation();
    toggleRowSelection($(this).data("id"), $(this).is(":checked"));
  });

  $(document).on("click", ".selectable-row", function (event) {
    if ($(event.target).is("input")) {
      return;
    }
    const checkbox = $(this).find(".row-checkbox");
    checkbox.prop("checked", !checkbox.prop("checked")).trigger("change");
  });

  $("#startPracticeBtn").on("click", function () {
    setScreen("practice");
    runPractice();
  });

  $("#resetPracticeBtn").on("click", function () {
    rebuildPracticeOrder();
    previewCurrentRecord();
  });

  $("#prevPracticeBtn").on("click", function () {
    setPointer(appState.practicePointer - 1);
  });

  $("#nextPracticeBtn").on("click", function () {
    setPointer(appState.practicePointer + 1);
  });

  $(document).on("click", ".practice-result-btn", function () {
    markResult($(this).data("result"));
  });
});
