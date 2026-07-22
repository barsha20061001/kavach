import { Building2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "../components/common/PageHeader";
import { districtSummary } from "../data/crimeData";

function DistrictAnalysis() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={Building2}
        title="District Analysis"
        description="Compare case volume, resolution and high-risk incidents by district"
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <section className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
          <h2 className="mb-5 font-semibold text-white">
            District-wise case comparison
          </h2>

          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={districtSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#253247" />
              <XAxis dataKey="district" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="cases" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="solved" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {districtSummary.map((district) => {
            const solveRate = Math.round(
              (district.solved / district.cases) * 100
            );

            return (
              <article
                key={district.district}
                className="rounded-2xl border border-slate-700 bg-[#071225] p-5"
              >
                <h2 className="font-semibold text-white">
                  {district.district}
                </h2>

                <div className="mt-5 space-y-3">
                  <Row label="Total cases" value={district.cases} />
                  <Row label="Cases solved" value={district.solved} />
                  <Row label="Solve rate" value={`${solveRate}%`} />
                  <Row label="High-risk cases" value={district.highRisk} />
                  <Row label="Police stations" value={district.stations} />
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default DistrictAnalysis;