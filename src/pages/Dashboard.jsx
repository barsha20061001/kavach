import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  MapPin,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";

const metrics = [
  {
    title: "Total Registered Cases",
    value: "8,173",
    detail: "Across the selected period",
    change: "+8.4%",
    icon: FileText,
  },
  {
    title: "Active Investigations",
    value: "1,007",
    detail: "12.3% of total cases",
    change: "+2.1%",
    icon: Activity,
  },
  {
    title: "Heinous Offences",
    value: "1,633",
    detail: "20.0% of total cases",
    change: "-1.7%",
    icon: AlertTriangle,
  },
  {
    title: "Highest Case Volume",
    value: "Bengaluru Urban",
    detail: "294 linked police-station records",
    change: "View map",
    icon: MapPin,
  },
];

function MetricCard({ metric }) {
  const Icon = metric.icon;

  return (
    <article className="rounded-2xl border border-slate-800 bg-[#0f1930]/90 p-6 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">
            {metric.title}
          </p>

          <p className="mt-3 truncate text-2xl font-bold text-white">
            {metric.value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {metric.detail}
          </p>
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
          <Icon
            size={23}
            className="text-blue-400"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-400">
        <span>{metric.change}</span>
        <ArrowUpRight size={14} />
      </div>
    </article>
  );
}

function DashboardPanel({ title, children, className = "" }) {
  return (
    <section
      className={[
        "rounded-2xl border border-slate-800",
        "bg-[#0f1930]/90 p-6 shadow-xl shadow-black/10",
        className,
      ].join(" ")}
    >
      <h3 className="text-base font-semibold text-white">
        {title}
      </h3>

      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Crime Intelligence Dashboard"
        description="Historical and operational insights from Karnataka FIR records"
        action={
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Take a tour
          </button>
        }
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            metric={metric}
          />
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <DashboardPanel title="Case Category Distribution">
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/20">
            <p className="text-sm text-slate-500">
              Doughnut chart will be implemented on Day 2
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Offence Severity Distribution">
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/20">
            <p className="text-sm text-slate-500">
              Severity bar chart will be implemented on Day 2
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Cases Over Time"
          className="xl:col-span-2"
        >
          <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/20">
            <p className="text-sm text-slate-500">
              Monthly crime trend chart will be implemented on Day 2
            </p>
          </div>
        </DashboardPanel>
      </section>
    </>
  );
}