import {
  Bell,
  CalendarDays,
  Languages,
  Menu,
  Search,
} from "lucide-react";

export default function Topbar({ sidebarCollapsed, onOpenMobileSidebar }) {
  return (
    <header
      className={[
        "fixed right-0 top-0 z-30 h-18",
        "border-b border-slate-800/90 bg-[#07101f]/90 backdrop-blur-xl",
        "transition-[left] duration-300",
        sidebarCollapsed ? "left-20" : "left-72",
      ].join(" ")}
    >
      <div className="flex h-full items-center justify-between gap-4 px-5 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="hidden max-w-md flex-1 md:block">
          <label className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              placeholder="Search case number, accused or district..."
              className={[
                "h-10 w-full rounded-xl border border-slate-700",
                "bg-slate-900/70 pl-10 pr-4 text-sm text-slate-100",
                "outline-none transition",
                "placeholder:text-slate-500",
                "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              ].join(" ")}
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white sm:flex"
          >
            <CalendarDays size={17} />
            <span>Last 12 months</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <Languages size={17} />
            <span className="hidden sm:inline">English</span>
          </button>

          <button
            type="button"
            className="relative rounded-xl border border-slate-700 bg-slate-900/60 p-2.5 text-slate-300 transition hover:border-slate-600 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
          </button>

          <button
            type="button"
            className="ml-1 flex size-10 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
            aria-label="Open user profile"
          >
            KP
          </button>
        </div>
      </div>
    </header>
  );
}