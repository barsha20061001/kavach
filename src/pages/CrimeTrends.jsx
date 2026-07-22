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
import {
  crimeCategoryData,
  monthlyCrimeTrend,
} from "../data/crimeData";

function CrimeTrends() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={BarChart3}
        title="Crime Trends"
        description="Analyse changes in crime volume, categories and case resolution"
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            title="Total cases"
            value="2,365"
            change="+8.4%"
            icon={TrendingUp}
          />

          <Metric
            title="Cases solved"
            value="1,592"
            change="+11.2%"
            icon={TrendingUp}
          />

          <Metric
            title="Unresolved cases"
            value="773"
            change="-2.5%"
            icon={TrendingDown}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <ChartCard title="Monthly case trend">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyCrimeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#253247" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cases"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="solved"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cases by crime category">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={crimeCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#253247" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
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
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>

        <Icon className="text-blue-400" />
      </div>

      <p className="mt-4 text-sm text-emerald-400">{change}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
      <h2 className="mb-5 font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default CrimeTrends;