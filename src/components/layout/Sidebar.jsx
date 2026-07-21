import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  primaryNavigation,
  secondaryNavigation,
} from "../../config/navigation";

function SidebarLink({ item, collapsed }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          "group flex min-h-11 items-center rounded-xl border px-3",
          "transition-all duration-200",
          collapsed ? "justify-center" : "gap-3",
          isActive
            ? "border-blue-500/30 bg-blue-600/15 text-blue-100"
            : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white",
        ].join(" ")
      }
    >
      <Icon
        size={20}
        strokeWidth={1.9}
        className="shrink-0"
        aria-hidden="true"
      />

      {!collapsed && (
        <span className="truncate text-sm font-medium">{item.label}</span>
      )}
    </NavLink>
  );
}

function SidebarSection({ items, collapsed }) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <SidebarLink
          key={item.path}
          item={item}
          collapsed={collapsed}
        />
      ))}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 flex flex-col",
        "border-r border-slate-800 bg-[#0b1426]",
        "transition-[width] duration-300",
        collapsed ? "w-20" : "w-72",
      ].join(" ")}
    >
      <div className="border-b border-slate-800 px-4 py-5">
        <div
          className={[
            "flex items-center",
            collapsed ? "justify-center" : "gap-3",
          ].join(" ")}
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10">
            <ShieldCheck
              size={27}
              className="text-blue-400"
              aria-hidden="true"
            />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-wide">
                Kavach AI
              </h1>

              <p className="truncate text-xs text-slate-400">
                Crime Intelligence Platform
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-4 rounded-lg border border-blue-500/25 bg-blue-500/5 px-3 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
              Karnataka FIR Intelligence
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <SidebarSection
          items={primaryNavigation}
          collapsed={collapsed}
        />

        <div className="my-4 border-t border-slate-800" />

        <SidebarSection
          items={secondaryNavigation}
          collapsed={collapsed}
        />
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={onToggle}
          className={[
            "flex min-h-11 w-full items-center rounded-xl px-3",
            "text-slate-300 transition hover:bg-white/5 hover:text-white",
            collapsed ? "justify-center" : "gap-3",
          ].join(" ")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />

              <span className="text-sm font-medium">
                Collapse sidebar
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}