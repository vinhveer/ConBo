import { Link } from "react-router-dom";

export function AppsHomePage({ apps }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Tất cả ứng dụng</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Danh sách app được map tự động từ <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">src/apps</code>.
          </p>
        </header>

        <section className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {apps.map((app) => (
            <Link
              className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-sm transition hover:bg-slate-50 first:border-t-0 dark:border-slate-800 dark:hover:bg-slate-800/50"
              key={app.slug}
              to={`/${app.slug}`}
            >
              <div className="min-w-0">
                <h2 className="font-medium text-slate-950 dark:text-slate-50">{app.name}</h2>
                <p className="mt-1 truncate text-slate-600 dark:text-slate-400">{app.description}</p>
              </div>
              <span className="shrink-0 text-slate-500 dark:text-slate-400">/{app.slug}</span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
