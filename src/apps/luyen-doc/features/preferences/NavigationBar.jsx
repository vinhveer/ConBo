import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { downloadJson } from "../../infrastructure/browser/download.js";
import {
  selectScreen,
  selectTheme,
  setScreen,
  toggleTheme
} from "./preferencesSlice.js";

export function NavigationBar() {
  const dispatch = useDispatch();
  const screen = useSelector(selectScreen);
  const theme = useSelector(selectTheme);
  const records = useSelector((state) => state.records.items);
  const timing = useSelector((state) => state.practice.timing);
  const practiceSettings = useSelector((state) => state.practice.settings);

  function handleExportBackup() {
    downloadJson(`luyen-doc-backup-${new Date().toISOString().slice(0, 10)}.json`, {
      exportedAt: new Date().toISOString(),
      timing,
      practiceSettings,
      records
    });
  }

  function handleToggleTheme() {
    dispatch(toggleTheme());
  }

  return (
    <nav className="ld-topbar">
      <div className="mx-auto grid max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="ld-app-icon">
            <span className="ld-app-icon-grid">
              <span />
              <span />
              <span />
              <span />
            </span>
          </div>
          <Link className="ld-all-apps-link" to="/">
            Tất cả ứng dụng
          </Link>
        </div>

        <div className="ld-app-title-wrap">
          <p className="ld-app-title">Luyện đọc</p>
        </div>

        <div className="ld-options">
          <button
            className={`ld-navlink ${screen === "settings" ? "is-active" : ""}`}
            onClick={() => dispatch(setScreen("settings"))}
            type="button"
          >
            Thiết đặt
          </button>
          <button
            className={`ld-navlink ${screen === "practice" ? "is-active" : ""}`}
            onClick={() => dispatch(setScreen("practice"))}
            type="button"
          >
            Thực hành
          </button>
          <button className="ld-button ld-button-secondary" onClick={handleToggleTheme} type="button">
            {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
          </button>
          <button className="ld-button ld-button-primary" onClick={handleExportBackup} type="button">
            Backup
          </button>
        </div>
      </div>
    </nav>
  );
}
