import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { discoverApps } from "./shared/lib/discoverApps.js";
import { AppsHomePage } from "./shared/ui/AppsHomePage.jsx";

const apps = discoverApps();

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppsHomePage apps={apps} />} path="/" />
        {apps.map(({ Component, slug }) => (
          <Route element={<Component />} key={slug} path={`/${slug}`} />
        ))}
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
