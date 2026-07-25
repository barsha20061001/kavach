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
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useApi(() => api.dashboard(), []);

  const {
    data: trendsData,
    loading: trendsLoading,
    error: trendsError,
  } = useApi(() => api.crimeTrends(), []);

  const totalCases =
    dashboardData?.kpis?.totalCases ?? 0;

  const solvedCases =
    dashboardData?.kpis?.chargesheetedCases ?? 0;

  const unresolvedCases = Math.max(
    totalCases - solvedCases,
    0,
  );

  const solvedPercentage = totalCases
    ? ((solvedCases / totalCases) * 100).toFixed(1)
    : "0.0";

  const unresolvedPercentage = totalCases
    ? ((unresolvedCases / totalCases) * 100).toFixed(1)
    : "0.0";

  const monthlyCrimeTrend =
    trendsData?.monthlyTrend?.map((item) => ({
      month: item.month,
      cases: item.count,
      solved: 0,
    })) ?? [];

  const crimeCategoryData =
    trendsData?.crimeTypes?.map((item) => ({
      name: item.crimeHeadName,
      value: item.count,
    })) ?? [];

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
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            title="Total cases"
            value={
              loading
                ? "..."
                : totalCases.toLocaleString()
            }
            change="Live dataset"
            icon={TrendingUp}
          />

          <Metric
            title="Cases solved"
            value={
              loading
                ? "..."
                : solvedCases.toLocaleString()
            }
            change={`${solvedPercentage}% of total cases`}
            icon={TrendingUp}
          />

          <Metric
            title="Unresolved cases"
            value={
              loading
                ? "..."
                : unresolvedCases.toLocaleString()
            }
            change={`${unresolvedPercentage}% of total cases`}
            icon={TrendingDown}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <ChartCard title="Monthly case trend">
            {trendsLoading ? (
              <div className="flex h-80 items-center justify-center">
                <p className="text-sm text-slate-500">
                  Loading monthly case trend...
                </p>
              </div>
            ) : monthlyCrimeTrend.length === 0 ? (
              <div className="flex h-80 items-center justify-center">
                <p className="text-sm text-slate-500">
                  No monthly trend data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlyCrimeTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#253247"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                  />

                  <YAxis stroke="#94a3b8" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="cases"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Cases by crime category">
            {trendsLoading ? (
              <div className="flex h-80 items-center justify-center">
                <p className="text-sm text-slate-500">
                  Loading crime categories...
                </p>
              </div>
            ) : crimeCategoryData.length === 0 ? (
              <div className="flex h-80 items-center justify-center">
                <p className="text-sm text-slate-500">
                  No crime category data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={crimeCategoryData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#253247"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={70}
                  />

                  <YAxis stroke="#94a3b8" />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </main>
    </div>
  );
}

function Metric({ title, value, change, icon: Icon }) {
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

export default CrimeTrends;