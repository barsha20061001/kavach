import {
  BarChart3,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "../components/common/PageHeader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

function CrimeTrends() {
  const {
    data: dashboardResponse,
    loading: dashboardLoading,
    error: dashboardError,
  } = useApi(() => api.dashboard(), []);

  const {
    data: trendsResponse,
    loading: trendsLoading,
    error: trendsError,
  } = useApi(() => api.crimeTrends(), []);

  const dashboard =
    dashboardResponse?.data ??
    dashboardResponse ??
    {};

  const trends =
    trendsResponse?.data ??
    trendsResponse ??
    {};

  const casesByStatus = normalizeArray(
    dashboard.casesByStatus ??
      dashboard.statusDistribution,
  );

  const monthlyCrimeTrend = normalizeArray(
    trends.monthlyTrend ??
      dashboard.monthlyTrend,
  )
    .map((item) => ({
      month:
        item.month ??
        item.period ??
        item.date ??
        "Unknown",

      cases: toNumber(
        item.count ??
          item.cases ??
          item.value,
      ),
    }))
    .sort((first, second) =>
      String(first.month).localeCompare(
        String(second.month),
      ),
    );

  const crimeCategoryData = normalizeArray(
    trends.crimeTypes ??
      dashboard.topCrimeTypes ??
      dashboard.categoryDistribution,
  )
    .map((item) => ({
      name:
        item.crimeHeadName ??
        item.name ??
        item.category ??
        "Unknown",

      value: toNumber(
        item.count ??
          item.value ??
          item.totalCases,
      ),
    }))
    .filter((item) => item.value > 0)
    .sort(
      (first, second) =>
        second.value - first.value,
    );

  const totalCases = toNumber(
    dashboard?.kpis?.totalCases ??
      dashboard.totalCases,
  );

  const unresolvedCases = casesByStatus
    .filter((item) =>
      isUnresolvedStatus(
        item.statusName ??
          item.name ??
          item.status,
      ),
    )
    .reduce(
      (sum, item) =>
        sum +
        toNumber(
          item.count ??
            item.value ??
            item.totalCases,
        ),
      0,
    );

  const solvedCases = Math.max(
    totalCases - unresolvedCases,
    0,
  );

  const solvedPercentage =
    calculatePercentage(
      solvedCases,
      totalCases,
    );

  const unresolvedPercentage =
    calculatePercentage(
      unresolvedCases,
      totalCases,
    );

  const loading =
    dashboardLoading || trendsLoading;

  const error =
    dashboardError || trendsError;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={BarChart3}
        title="Crime Trends"
        description="Analyse changes in crime volume, categories and case resolution"
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {String(error)}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            title="Total cases"
            value={
              loading
                ? "..."
                : formatNumber(totalCases)
            }
            change={
              loading
                ? "Loading dataset..."
                : "Live dataset"
            }
            icon={TrendingUp}
          />

          <Metric
            title="Cases solved"
            value={
              loading
                ? "..."
                : formatNumber(solvedCases)
            }
            change={
              loading
                ? "Calculating..."
                : `${solvedPercentage}% of total cases`
            }
            icon={TrendingUp}
          />

          <Metric
            title="Unresolved cases"
            value={
              loading
                ? "..."
                : formatNumber(
                    unresolvedCases,
                  )
            }
            change={
              loading
                ? "Calculating..."
                : `${unresolvedPercentage}% of total cases`
            }
            icon={TrendingDown}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <ChartCard title="Monthly case trend">
            {loading ? (
              <ChartLoading />
            ) : monthlyCrimeTrend.length === 0 ? (
              <NoChartData />
            ) : (
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <AreaChart
                  data={monthlyCrimeTrend}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#253247"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    minTickGap={25}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#071225",
                      border:
                        "1px solid #334155",
                      borderRadius: "12px",
                      color: "#ffffff",
                    }}
                    formatter={(value) => [
                      formatNumber(value),
                      "Cases",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="cases"
                    name="Registered cases"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Cases by crime category">
            {loading ? (
              <ChartLoading />
            ) : crimeCategoryData.length ===
              0 ? (
              <NoChartData />
            ) : (
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart
                  data={crimeCategoryData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 65,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#253247"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    interval={0}
                    angle={-22}
                    textAnchor="end"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill:
                        "rgba(59, 130, 246, 0.06)",
                    }}
                    contentStyle={{
                      backgroundColor: "#071225",
                      border:
                        "1px solid #334155",
                      borderRadius: "12px",
                      color: "#ffffff",
                    }}
                    formatter={(value) => [
                      formatNumber(value),
                      "Cases",
                    ]}
                  />

                  <Bar
                    dataKey="value"
                    name="Registered cases"
                    fill="#3b82f6"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <p className="text-xs leading-5 text-slate-400">
            Crime volumes, category totals and case
            resolution figures are calculated from
            the loaded synthetic FIR dataset. A case
            is treated as unresolved when its status
            is Under Investigation or Undetected.
          </p>
        </div>
      </main>
    </div>
  );
}

function isUnresolvedStatus(value) {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();

  return (
    status.includes(
      "under investigation",
    ) ||
    status.includes("undetected") ||
    status.includes("unresolved") ||
    status.includes("pending")
  );
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString(
    "en-IN",
  );
}

function calculatePercentage(value, total) {
  if (!total) {
    return "0.0";
  }

  return (
    (toNumber(value) /
      toNumber(total)) *
    100
  ).toFixed(1);
}

function Metric({
  title,
  value,
  change,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>
        </div>

        <Icon className="text-blue-400" />
      </div>

      <p className="mt-4 text-sm text-emerald-400">
        {change}
      </p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
      <h2 className="mb-5 font-semibold text-white">
        {title}
      </h2>

      {children}
    </section>
  );
}

function ChartLoading() {
  return (
    <div className="flex h-[320px] items-center justify-center">
      <p className="text-sm text-slate-400">
        Loading crime trend records...
      </p>
    </div>
  );
}

function NoChartData() {
  return (
    <div className="flex h-[320px] items-center justify-center">
      <p className="text-sm text-slate-400">
        No dataset records available.
      </p>
    </div>
  );
}

export default CrimeTrends;