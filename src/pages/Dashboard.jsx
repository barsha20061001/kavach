import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  MapPin,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "../components/common/PageHeader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

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

        {metric.change && (
          <ArrowUpRight size={14} />
        )}
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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0b1325] px-4 py-3 shadow-xl">
      {label && (
        <p className="mb-1 text-xs font-semibold text-slate-300">
          {label}
        </p>
      )}

      {payload.map((item) => (
        <p
          key={`${item.dataKey}-${item.name}`}
          className="text-xs text-slate-400"
        >
          <span className="font-semibold text-white">
            {item.name}:
          </span>{" "}
          {Number(item.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

const pieColours = [
  "#3b82f6",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

export default function Dashboard() {
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useApi(() => api.dashboard(), []);

  const {
    data: trendData,
    loading: trendLoading,
    error: trendError,
  } = useApi(() => api.crimeTrends(), []);

  const totalCases =
    dashboardData?.kpis?.totalCases ?? 0;

  const arrestLinkedCases =
    dashboardData?.kpis?.arrestLinkedCases ?? 0;

  const severeCases =
    dashboardData?.kpis?.severeCases ?? 0;

  const highestDistrict =
    dashboardData?.topDistricts?.[0];

  const activeInvestigationPercentage = totalCases
    ? ((arrestLinkedCases / totalCases) * 100).toFixed(1)
    : "0.0";

  const severeCasePercentage = totalCases
    ? ((severeCases / totalCases) * 100).toFixed(1)
    : "0.0";

  const metrics = [
    {
      title: "Total Registered Cases",
      value: dashboardLoading
        ? "..."
        : totalCases.toLocaleString(),
      detail: "Across the selected period",
      change: dashboardError ? "Unable to load" : "Live dataset",
      icon: FileText,
    },
    {
      title: "Active Investigations",
      value: dashboardLoading
        ? "..."
        : arrestLinkedCases.toLocaleString(),
      detail: `${activeInvestigationPercentage}% of total cases`,
      change: dashboardError ? "Unable to load" : "Arrest-linked cases",
      icon: Activity,
    },
    {
      title: "Heinous Offences",
      value: dashboardLoading
        ? "..."
        : severeCases.toLocaleString(),
      detail: `${severeCasePercentage}% of total cases`,
      change: dashboardError ? "Unable to load" : "High severity cases",
      icon: AlertTriangle,
    },
    {
      title: "Highest Case Volume",
      value: dashboardLoading
        ? "..."
        : highestDistrict?.districtName ?? "No data",
      detail: dashboardLoading
        ? "Loading district data"
        : `${(
            highestDistrict?.count ?? 0
          ).toLocaleString()} registered cases`,
      change: dashboardError ? "Unable to load" : "View map",
      icon: MapPin,
    },
  ];

  const categoryData =
    dashboardData?.topCrimeTypes?.map((item) => ({
      name: item.crimeHeadName,
      value: item.count,
    })) ?? [];

  const severityData =
    dashboardData?.casesByStatus?.map((item) => ({
      name: item.statusName,
      count: item.count,
    })) ?? [];

  const monthlyTrend =
    trendData?.monthlyTrend?.map((item) => ({
      month: item.month,
      cases: item.count,
    })) ?? [];

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

      {dashboardError && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {dashboardError}
        </div>
      )}

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
          <div className="h-72 rounded-xl border border-slate-800 bg-slate-950/20">
            {dashboardLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                  Loading category distribution...
                </p>
              </div>
            ) : categoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                  No category data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          pieColours[
                            index % pieColours.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<ChartTooltip />} />

                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    formatter={(value) => (
                      <span className="text-xs text-slate-400">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Offence Severity Distribution">
          <div className="h-72 rounded-xl border border-slate-800 bg-slate-950/20">
            {dashboardLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                  Loading severity distribution...
                </p>
              </div>
            ) : severityData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                  No severity data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={severityData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 35,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />

                  <YAxis
                    stroke="#64748b"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip content={<ChartTooltip />} />

                  <Bar
                    dataKey="count"
                    name="Cases"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Cases Over Time"
          className="xl:col-span-2"
        >
          <div className="h-80 rounded-xl border border-slate-800 bg-slate-950/20">
            {trendLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                  Loading monthly crime trend...
                </p>
              </div>
            ) : trendError ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-red-300">
                  {trendError}
                </p>
              </div>
            ) : monthlyTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                  No monthly trend data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={monthlyTrend}
                  margin={{
                    top: 20,
                    right: 25,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#64748b"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip content={<ChartTooltip />} />

                  <Line
                    type="monotone"
                    dataKey="cases"
                    name="Cases"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                      fill: "#3b82f6",
                      strokeWidth: 0,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#60a5fa",
                      stroke: "#0f172a",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </DashboardPanel>
      </section>
    </>
  );
}