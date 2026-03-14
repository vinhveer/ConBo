const RECORDS_KEY = "reading-mobile-records-v2";
const TIMING_KEY = "reading-mobile-timing-v2";

const appState = {
  records: [],
  timing: {
    initialSeconds: 1,
    hideSeconds: 0.3,
    rhymeSeconds: 1
  },
  practiceOrder: [],
  practicePointer: 0,
  currentRecordId: null,
  timers: []
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
  $(".tabbar-btn").removeClass("active");
  $(`.tabbar-btn[data-screen="${screen}"]`).addClass("active");

  $(".screen").removeClass("active");
  screen === "settings" ? $("#settingsScreen").addClass("active") : $("#practiceScreen").addClass("active");
}

function renderTiming() {
  $("#initialSecondsInput").val(appState.timing.initialSeconds);
  $("#hideSecondsInput").val(appState.timing.hideSeconds);
  $("#rhymeSecondsInput").val(appState.timing.rhymeSeconds);
  $("#stageSequence").text(
    `${appState.timing.initialSeconds}s chữ đầu -> ${appState.timing.hideSeconds}s ẩn -> ${appState.timing.rhymeSeconds}s vần -> ${appState.timing.hideSeconds}s ẩn -> chữ`
  );
}

function renderRecordList() {
  $("#recordCountBadge").text(appState.records.length);
  $("#settingsEmptyState").toggle(appState.records.length === 0);

  if (!appState.records.length) {
    $("#recordList").html("");
    return;
  }

  const html = appState.records
    .map(
      (record) => `
        <article class="record-item">
          <div class="record-line">
            <span class="record-word">${escapeHtml(record.word)}</span>
            <span class="record-build">${escapeHtml(record.initial)} + ${escapeHtml(record.rhyme)}</span>
          </div>
          <div class="record-meta">
            <span>Đọc được: ${record.correct || 0}</span>
            <span>Không đọc được: ${record.wrong || 0}</span>
          </div>
          <div class="record-actions">
            <button class="mini-btn" data-action="edit" data-id="${record.id}">Sửa</button>
            <button class="mini-btn delete" data-action="delete" data-id="${record.id}">Xóa</button>
          </div>
        </article>
      `
    )
    .join("");

  $("#recordList").html(html);
}

function renderStats() {
  const total = appState.records.length;
  const correct = appState.records.reduce((sum, record) => sum + (record.correct || 0), 0);
  const wrong = appState.records.reduce((sum, record) => sum + (record.wrong || 0), 0);
  const totalOrder = appState.practiceOrder.length || total;
  const current = appState.currentRecordId ? Math.min(appState.practicePointer + 1, totalOrder) : 0;

  $("#summaryTotal").text(`${total} record`);
  $("#summaryCorrect").text(`${correct} đọc được`);
  $("#summaryWrong").text(`${wrong} không đọc được`);
  $("#summaryIndex").text(`${current} / ${totalOrder || 0}`);
}

function clearPracticeStage(message = "Nhấn Bắt đầu") {
  resetTimers();
  appState.currentRecordId = null;
  $("#stageLabel").text("Sẵn sàng");
  $("#stageDisplay").removeClass("stage-hidden stage-final").text(message);
  $("#resultActions").addClass("hidden");
  $("#practiceNote").text("Nhập dữ liệu ở màn Thiết đặt hệ thống rồi qua đây để luyện.");
  renderStats();
}

function buildPracticeOrder() {
  const ids = appState.records.map((record) => record.id);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  appState.practiceOrder = ids;
  appState.practicePointer = 0;
}

function getCurrentRecord() {
  const id = appState.practiceOrder[appState.practicePointer];
  return appState.records.find((record) => record.id === id) || null;
}

function runPractice(record) {
  const initialMs = appState.timing.initialSeconds * 1000;
  const hideMs = appState.timing.hideSeconds * 1000;
  const rhymeMs = appState.timing.rhymeSeconds * 1000;

  resetTimers();
  appState.currentRecordId = record.id;
  renderStats();

  $("#resultActions").addClass("hidden");
  $("#practiceNote").text(`Record: ${record.initial} + ${record.rhyme} -> ${record.word}`);

  $("#stageLabel").text("Chữ đầu");
  $("#stageDisplay").removeClass("stage-hidden stage-final").text(record.initial);

  appState.timers.push(
    setTimeout(() => {
      $("#stageDisplay").addClass("stage-hidden").text("•");
    }, initialMs)
  );

  appState.timers.push(
    setTimeout(() => {
      $("#stageLabel").text("Vần");
      $("#stageDisplay").removeClass("stage-hidden stage-final").text(record.rhyme);
    }, initialMs + hideMs)
  );

  appState.timers.push(
    setTimeout(() => {
      $("#stageDisplay").addClass("stage-hidden").text("•");
    }, initialMs + hideMs + rhymeMs)
  );

  appState.timers.push(
    setTimeout(() => {
      $("#stageLabel").text("Chữ");
      $("#stageDisplay").removeClass("stage-hidden").addClass("stage-final").text(record.word);
      $("#resultActions").removeClass("hidden");
      $("#practiceNote").text("Chọn kết quả sau khi bé đọc xong.");
    }, initialMs + hideMs + rhymeMs + hideMs)
  );
}

function nextPractice(forceRestart = false) {
  if (!appState.records.length) {
    clearPracticeStage("Chưa có record");
    $("#practiceNote").text("Hãy nhập record ở màn Thiết đặt hệ thống.");
    return;
  }

  if (!appState.practiceOrder.length || forceRestart || appState.practicePointer >= appState.practiceOrder.length) {
    buildPracticeOrder();
  }

  const record = getCurrentRecord();
  if (!record) {
    clearPracticeStage("Không tìm thấy record");
    return;
  }

  runPractice(record);
}

function resetForm() {
  $("#editId").val("");
  $("#initialInput").val("").focus();
  $("#rhymeInput").val("");
  $("#wordInput").val("");
  $("#saveRecordBtn").text("Lưu");
}

function fillForm(record) {
  $("#editId").val(record.id);
  $("#initialInput").val(record.initial);
  $("#rhymeInput").val(record.rhyme);
  $("#wordInput").val(record.word);
  $("#saveRecordBtn").text("Cập nhật");
}

function upsertRecord() {
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
    appState.records.unshift({
      id: uid(),
      ...payload,
      correct: 0,
      wrong: 0
    });
  }

  saveRecords();
  renderRecordList();
  renderStats();
  resetForm();
}

function deleteRecord(id) {
  appState.records = appState.records.filter((record) => record.id !== id);
  appState.practiceOrder = appState.practiceOrder.filter((recordId) => recordId !== id);

  if (appState.currentRecordId === id) {
    clearPracticeStage();
  } else {
    renderStats();
  }

  saveRecords();
  renderRecordList();
}

function saveTimingFromForm() {
  const initialSeconds = Number($("#initialSecondsInput").val());
  const hideSeconds = Number($("#hideSecondsInput").val());
  const rhymeSeconds = Number($("#rhymeSecondsInput").val());

  if (initialSeconds <= 0 || hideSeconds <= 0 || rhymeSeconds <= 0) {
    alert("Các giá trị giây phải lớn hơn 0.");
    return;
  }

  appState.timing = {
    initialSeconds,
    hideSeconds,
    rhymeSeconds
  };

  saveTiming();
  renderTiming();
}

function markResult(type) {
  if (!appState.currentRecordId) {
    return;
  }

  appState.records = appState.records.map((record) => {
    if (record.id !== appState.currentRecordId) {
      return record;
    }

    return {
      ...record,
      correct: record.correct + (type === "correct" ? 1 : 0),
      wrong: record.wrong + (type === "wrong" ? 1 : 0)
    };
  });

  saveRecords();
  renderRecordList();
  $("#resultActions").addClass("hidden");
  $("#practiceNote").text(type === "correct" ? "Đã lưu: đọc được." : "Đã lưu: không đọc được.");

  appState.practicePointer += 1;
  renderStats();

  appState.timers.push(
    setTimeout(() => {
      nextPractice();
    }, 450)
  );
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

  renderTiming();
  renderRecordList();
  clearPracticeStage();

  $(document).on("click", ".tabbar-btn", function () {
    setScreen($(this).data("screen"));
  });

  $("#timingForm").on("submit", function (event) {
    event.preventDefault();
    saveTimingFromForm();
  });

  $("#recordForm").on("submit", function (event) {
    event.preventDefault();
    upsertRecord();
  });

  $("#resetFormBtn").on("click", function () {
    resetForm();
  });

  $(document).on("click", ".mini-btn", function () {
    const id = $(this).data("id");
    const action = $(this).data("action");
    const record = appState.records.find((item) => item.id === id);

    if (action === "edit" && record) {
      fillForm(record);
      setScreen("settings");
    }

    if (action === "delete") {
      deleteRecord(id);
    }
  });

  $("#startPracticeBtn").on("click", function () {
    setScreen("practice");
    nextPractice(true);
  });

  $("#nextPracticeBtn").on("click", function () {
    appState.practicePointer += 1;
    nextPractice();
  });

  $(document).on("click", "#resultActions button", function () {
    markResult($(this).data("result"));
  });
});
