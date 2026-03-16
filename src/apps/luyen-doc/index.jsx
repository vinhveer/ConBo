import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { NavigationBar } from "./features/preferences/NavigationBar.jsx";
import { selectScreen, selectTheme } from "./features/preferences/preferencesSlice.js";
import { PracticeScreen } from "./features/practice/PracticeScreen.jsx";
import { selectPracticeShuffle, syncQueue } from "./features/practice/practiceSlice.js";
import { RecordModal } from "./features/records/RecordModal.jsx";
import { RecordsScreen } from "./features/records/RecordsScreen.jsx";
import { selectRecords, selectSelectedIds } from "./features/records/recordsSlice.js";
import { TimingSettingsModal } from "./features/practice/TimingSettingsModal.jsx";
import { store } from "./infrastructure/store/index.js";
import { buildPracticeOrder } from "./lib/practice.js";
import "./app.css";

export const meta = {
  name: "Luyện đọc",
  description: "Quản lý bộ chữ, chọn tập dữ liệu và chạy bài luyện đọc theo nhịp hiển thị tùy chỉnh.",
  tagline: "Bộ công cụ luyện đọc theo nhịp",
  order: 1
};

function LuyenDocScreen() {
  const dispatch = useDispatch();
  const screen = useSelector(selectScreen);
  const theme = useSelector(selectTheme);
  const records = useSelector(selectRecords);
  const selectedIds = useSelector(selectSelectedIds);
  const shuffle = useSelector(selectPracticeShuffle);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    dispatch(
      syncQueue({
        order: buildPracticeOrder(records, selectedIds, shuffle)
      })
    );
  }, [dispatch, records, selectedIds, shuffle]);

  return (
    <div className="ld-shell">
      <NavigationBar />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {screen === "practice" ? <PracticeScreen /> : <RecordsScreen />}
      </main>

      <RecordModal />
      <TimingSettingsModal />
    </div>
  );
}

export default function LuyenDocApp() {
  return (
    <Provider store={store}>
      <LuyenDocScreen />
    </Provider>
  );
}
