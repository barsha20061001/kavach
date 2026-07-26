import {
  Activity,
  AlertTriangle,
  FileText,
  MapPin,
} from "lucide-react";

import { useState } from "react";

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
import DashboardTour from "../components/common/DashboardTour";

const CHART_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#ec4899",
  "#a3e635",
  "#f97316",
];

function Dashboard() {
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

  const dashboardData = normalizeDashboardData(
    dashboardResponse,
    trendsResponse,
  );

  const loading = dashboardLoading || trendsLoading;
  const error = dashboardError || trendsError;

  const {
    totalCases,
    activeInvestigations,
    heinousOffences,
    highestCaseVolume,
    categoryDistribution,
    statusDistribution,
    monthlyTrend,
  } = dashboardData;

  const activePercentage = calculatePercentage(
    activeInvestigations,
    totalCases,
  );

  const heinousPercentage = calculatePercentage(
    heinousOffences,
    totalCases,
  );


  const [tourOpen, setTourOpen] =
  useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <div data-tour="dashboard-header">
        <PageHeader
        icon={Activity}
        title="Crime Intelligence Dashboard"
        description="Historical and operational insights from Karnataka FIR records"
        action={
          <button
            type="button"
            onClick={() => setTourOpen(true)}
           className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
           Take a tour
          </button>
        }
        />
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {String(error)}
          </div>
        )}

        <div
          data-tour="dashboard-kpis"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            title="Total Registered Cases"
            value={
              loading
                ? "..."
                : formatNumber(totalCases)
            }
            description="Across the selected period"
            linkText="Live dataset ↗"
            icon={FileText}
          />

          <MetricCard
            title="Active Investigations"
            value={
              loading
                ? "..."
                : formatNumber(activeInvestigations)
            }
            description={
              loading
                ? "Calculating..."
                : `${activePercentage}% of total cases`
            }
            linkText="Investigation records ↗"
            icon={Activity}
          />

          <MetricCard
            title="Heinous Offences"
            value={
              loading
                ? "..."
                : formatNumber(heinousOffences)
            }
            description={
              loading
                ? "Calculating..."
                : `${heinousPercentage}% of total cases`
            }
            linkText="High severity cases ↗"
            icon={AlertTriangle}
          />

          <MetricCard
            title="Highest Case Volume"
            value={
              loading
                ? "..."
                : highestCaseVolume.district
            }
            description={
              loading
                ? "Loading..."
                : `${formatNumber(
                    highestCaseVolume.count,
                  )} registered cases`
            }
            linkText="View map ↗"
            icon={MapPin}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <DashboardPanel
            title="Case Category Distribution"
            tourId="category-chart"
          >
            {loading ? (
              <ChartLoading />
            ) : categoryDistribution.length === 0 ? (
              <NoChartData />
            ) : (
              <div className="rounded-xl border border-slate-800 bg-[#081329] p-3">
                <ResponsiveContainer
                  width="100%"
                  height={270}
                >
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={92}
                      paddingAngle={2}
                      stroke="#cbd5e1"
                      strokeWidth={1}
                    >
                      {categoryDistribution.map(
                        (item, index) => (
                          <Cell
                            key={`${item.name}-${index}`}
                            fill={
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#071225",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#ffffff",
                      }}
                      formatter={(value) => [
                        formatNumber(value),
                        "Cases",
                      ]}
                    />

                    <Legend
                      verticalAlign="bottom"
                      formatter={(value) => (
                        <span className="text-xs text-slate-400">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Offence Severity Distribution"
            tourId="severity-chart"
          >
            {loading ? (
              <ChartLoading />
            ) : statusDistribution.length === 0 ? (
              <NoChartData />
            ) : (
              <div className="rounded-xl border border-slate-800 bg-[#081329] p-3">
                <ResponsiveContainer
                  width="100%"
                  height={270}
                >
                  <BarChart
                    data={statusDistribution}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 35,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      tick={{
                        fontSize: 11,
                      }}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />

                    <YAxis
                      stroke="#94a3b8"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: "rgba(59, 130, 246, 0.05)",
                      }}
                      contentStyle={{
                        backgroundColor: "#071225",
                        border: "1px solid #334155",
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
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashboardPanel>
        </div>

        <div className="mt-5">
          <DashboardPanel
            title="Cases Over Time"
            tourId="time-chart"
          >
            {loading ? (
              <ChartLoading height="h-[310px]" />
            ) : monthlyTrend.length === 0 ? (
              <NoChartData height="h-[310px]" />
            ) : (
              <div className="rounded-xl border border-slate-800 bg-[#081329] p-3">
                <ResponsiveContainer
                  width="100%"
                  height={290}
                >
                  <LineChart
                    data={monthlyTrend}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 15,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                    />

                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      tick={{
                        fontSize: 10,
                      }}
                      minTickGap={25}
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
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#ffffff",
                      }}
                      formatter={(value) => [
                        formatNumber(value),
                        "Cases",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="cases"
                      name="Cases"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{
                        r: 2,
                        fill: "#3b82f6",
                      }}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashboardPanel>
        </div>

        <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <p className="text-xs text-slate-400">
            Synthetic demonstration data generated for
            the Kavach AI prototype. This dashboard does
            not contain real police records or personal
            data.
          </p>
        </div>
      </main>

      <DashboardTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </div>
  );
}

function normalizeDashboardData(
  dashboardResponse,
  trendsResponse,
) {
  const dashboard =
    dashboardResponse?.data ??
    dashboardResponse ??
    {};

  const trendData =
    trendsResponse?.data ??
    trendsResponse ??
    {};

  const kpis =
    dashboard.kpis ??
    dashboard.summary ??
    {};

  const totalCases = toNumber(
    kpis.totalCases ??
      kpis.totalRegisteredCases ??
      dashboard.totalCases ??
      dashboard.totalRegisteredCases,
  );

  const activeInvestigations = toNumber(
    kpis.activeInvestigations ??
      kpis.underInvestigation ??
      kpis.investigationCases ??
      dashboard.activeInvestigations,
  );

  const heinousOffences = toNumber(
    kpis.heinousOffences ??
      kpis.severeCases ??
      kpis.highSeverityCases ??
      dashboard.heinousOffences,
  );

  const districtRows = normalizeArray(
    dashboard.topDistricts ??
      dashboard.districtDistribution ??
      dashboard.districts ??
      dashboard.casesByDistrict,
  );

  const highestDistrictRow =
    districtRows.length > 0
      ? [...districtRows].sort(
          (first, second) =>
            getCount(second) - getCount(first),
        )[0]
      : null;

  const highestCaseVolume = {
    district:
      kpis.highestCaseVolume?.district ??
      kpis.highestCaseVolume?.districtName ??
      dashboard.highestCaseVolume?.district ??
      dashboard.highestCaseVolume?.districtName ??
      highestDistrictRow?.district ??
      highestDistrictRow?.districtName ??
      highestDistrictRow?.name ??
      "No data",

    count: toNumber(
      kpis.highestCaseVolume?.count ??
        dashboard.highestCaseVolume?.count ??
        getCount(highestDistrictRow),
    ),
  };

  const categorySource = normalizeArray(
    dashboard.categoryDistribution ??
      dashboard.crimeCategories ??
      dashboard.topCrimeTypes ??
      dashboard.casesByCrimeCategory ??
      trendData.crimeTypes ??
      trendData.categoryDistribution,
  );

  const categoryDistribution = categorySource
    .map((item) => ({
      name:
        item.name ??
        item.crimeGroupName ??
        item.crimeHeadName ??
        item.category ??
        item.label ??
        "Unknown",

      value: getCount(item),
    }))
    .filter((item) => item.value > 0);

  const statusSource = normalizeArray(
    dashboard.statusDistribution ??
      dashboard.casesByStatus ??
      dashboard.offenceSeverityDistribution ??
      dashboard.caseStatusDistribution ??
      trendData.statusDistribution ??
      trendData.casesByStatus,
  );

  const statusDistribution = statusSource
    .map((item) => ({
      name:
        item.name ??
        item.statusName ??
        item.gravityName ??
        item.status ??
        item.label ??
        "Unknown",

      value: getCount(item),
    }))
    .filter((item) => item.value > 0);

  const monthlySource = normalizeArray(
    dashboard.monthlyTrend ??
      dashboard.casesOverTime ??
      dashboard.monthlyCases ??
      trendData.monthlyTrend ??
      trendData.casesOverTime ??
      trendData.monthlyCases,
  );

  const monthlyTrend = monthlySource
    .map((item) => ({
      month:
        item.month ??
        item.yearMonth ??
        item.period ??
        item.date ??
        item.label ??
        "Unknown",

      cases: toNumber(
        item.cases ??
          item.count ??
          item.value ??
          item.totalCases,
      ),
    }))
    .filter((item) => item.cases >= 0);

  return {
    totalCases,
    activeInvestigations,
    heinousOffences,
    highestCaseVolume,
    categoryDistribution,
    statusDistribution,
    monthlyTrend,
  };
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getCount(item) {
  if (!item) {
    return 0;
  }

  return toNumber(
    item.count ??
      item.value ??
      item.total ??
      item.totalCases ??
      item.caseCount ??
      item.cases,
  );
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function calculatePercentage(value, total) {
  if (!total) {
    return "0.0";
  }

  return ((value / total) * 100).toFixed(1);
}

function formatNumber(value) {
  return toNumber(value).toLocaleString("en-IN");
}

function MetricCard({
  title,
  value,
  description,
  linkText,
  icon: Icon,
}) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-[#0c1730] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-400">
            {title}
          </p>

          <p className="mt-3 truncate text-2xl font-bold text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
          <Icon size={23} />
        </div>
      </div>

      <p className="mt-5 text-xs font-semibold text-blue-400">
        {linkText}
      </p>
    </article>
  );
}

function DashboardPanel({
  title,
  children,
  tourId,
}) {
  return (
    <section
      data-tour={tourId}
      className="rounded-2xl border border-slate-700 bg-[#0c1730] p-6"
    >
      <h2 className="mb-5 font-semibold text-white">
        {title}
      </h2>

      {children}
    </section>
  );
}

function ChartLoading({ height = "h-[270px]" }) {
  return (
    <div
      className={`flex ${height} items-center justify-center rounded-xl border border-slate-800 bg-[#081329]`}
    >
      <p className="text-sm text-slate-400">
        Loading dataset analytics...
      </p>
    </div>
  );
}

function NoChartData({ height = "h-[270px]" }) {
  return (
    <div
      className={`flex ${height} items-center justify-center rounded-xl border border-slate-800 bg-[#081329]`}
    >
      <p className="text-sm text-slate-400">
        No dataset records available.
      </p>
    </div>
  );
}

export default Dashboard;