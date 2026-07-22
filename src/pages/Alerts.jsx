import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  CircleAlert,
  Filter,
  ShieldAlert,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { alertsData } from "../data/crimeData";

function Alerts() {
  const [alerts, setAlerts] = useState(alertsData);
  const [filter, setFilter] = useState("All");

  const filteredAlerts = useMemo(() => {
    if (filter === "All") return alerts;

    return alerts.filter((alert) => alert.type === filter);
  }, [alerts, filter]);

  const acknowledgeAlert = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status: "Acknowledged",
            }
          : alert
      )
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={Bell}
        title="Intelligence Alerts"
        description="Review emerging hotspots, unusual patterns and operational warnings"
        action={
          <div className="flex items-center gap-2">
            <Filter size={17} className="text-slate-400" />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-[#071225] px-4 py-2.5 text-sm text-white outline-none"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Summary title="All alerts" value={alerts.length} />
          <Summary
            title="Critical"
            value={alerts.filter((alert) => alert.type === "Critical").length}
          />
          <Summary
            title="New"
            value={alerts.filter((alert) => alert.status === "New").length}
          />
          <Summary
            title="Acknowledged"
            value={
              alerts.filter(
                (alert) => alert.status === "Acknowledged"
              ).length
            }
          />
        </div>

        <div className="mt-5 space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={() => acknowledgeAlert(alert.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function Summary({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function AlertCard({ alert, onAcknowledge }) {
  const typeClasses = {
    Critical: "border-red-500/40 bg-red-500/10 text-red-400",
    High: "border-orange-500/40 bg-orange-500/10 text-orange-400",
    Medium: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    Low: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  };

  return (
    <article className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
              typeClasses[alert.type]
            }`}
          >
            {alert.type === "Critical" ? (
              <ShieldAlert size={22} />
            ) : (
              <CircleAlert size={22} />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-semibold text-white">
                {alert.title}
              </h2>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  typeClasses[alert.type]
                }`}
              >
                {alert.type}
              </span>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              {alert.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>{alert.district}</span>
              <span>{alert.time}</span>
              <span>Status: {alert.status}</span>
            </div>
          </div>
        </div>

        {alert.status !== "Acknowledged" && (
          <button
            type="button"
            onClick={onAcknowledge}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-blue-500 hover:text-white"
          >
            <Check size={17} />
            Acknowledge
          </button>
        )}
      </div>
    </article>
  );
}

export default Alerts;