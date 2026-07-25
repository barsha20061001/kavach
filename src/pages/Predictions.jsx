import {
  BrainCircuit,
  CircleAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "../components/common/PageHeader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

function PredictiveIntelligence() {
  const {
    data,
    loading,
    error,
  } = useApi(() => api.predictive(), []);

  const predictions = (
    data?.predictions ??
    data?.forecast ??
    data?.districtForecast ??
    []
  ).map((prediction, index) => {
    const previousCases = Number(
      prediction.previousCases ??
        prediction.currentCases ??
        prediction.historicalCases ??
        prediction.actualCases ??
        0,
    );

    const predictedCases = Number(
      prediction.predictedCases ??
        prediction.forecastCases ??
        prediction.expectedCases ??
        prediction.prediction ??
        0,
    );

    const calculatedChange = previousCases
      ? ((predictedCases - previousCases) / previousCases) * 100
      : 0;

    const percentageChange = Number(
      prediction.percentageChange ??
        prediction.changePercentage ??
        calculatedChange,
    );

    const riskScore = Number(
      prediction.riskScore ??
        prediction.risk ??
        prediction.score ??
        0,
    );

    const confidence = Number(
      prediction.confidence ??
        prediction.confidenceScore ??
        data?.modelConfidence ??
        0,
    );

    return {
      id:
        prediction.id ??
        prediction.districtId ??
        `prediction-${index}`,

      district:
        prediction.district ??
        prediction.districtName ??
        "Unknown district",

      category:
        prediction.category ??
        prediction.crimeCategory ??
        prediction.crimeHeadName ??
        "All crime categories",

      previousCases,
      predictedCases,
      riskScore,
      confidence,
      percentageChange,

      trend:
        prediction.trend ??
        (predictedCases >= previousCases
          ? "Increasing"
          : "Decreasing"),
    };
  });

  const modelConfidence = Number(
    data?.modelConfidence ??
      data?.confidence ??
      (predictions.length
        ? predictions.reduce(
            (total, prediction) =>
              total + prediction.confidence,
            0,
          ) / predictions.length
        : 0),
  );

  const highRiskDistricts = predictions.filter(
    (prediction) => prediction.riskScore > 70,
  ).length;

  const totalPreviousCases = predictions.reduce(
    (total, prediction) =>
      total + prediction.previousCases,
    0,
  );

  const totalPredictedCases = predictions.reduce(
    (total, prediction) =>
      total + prediction.predictedCases,
    0,
  );

  const expectedCaseIncrease = totalPreviousCases
    ? ((totalPredictedCases - totalPreviousCases) /
        totalPreviousCases) *
      100
    : 0;

  const highestRiskPrediction =
    predictions.length > 0
      ? [...predictions].sort(
          (first, second) =>
            second.riskScore - first.riskScore,
        )[0]
      : null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={BrainCircuit}
        title="Predictive Intelligence"
        description="Forecast crime patterns and identify emerging operational risks"
        action={
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300">
            Model confidence:{" "}
            {loading
              ? "..."
              : `${modelConfidence.toFixed(0)}%`}
          </span>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            title="High-risk districts"
            value={
              loading
                ? "..."
                : highRiskDistricts.toLocaleString()
            }
            description="Risk score above 70"
          />

          <Metric
            title="Expected case increase"
            value={
              loading
                ? "..."
                : `${expectedCaseIncrease >= 0 ? "+" : ""}${expectedCaseIncrease.toFixed(1)}%`
            }
            description="Next 30-day period"
          />

          <Metric
            title="Highest-risk category"
            value={
              loading
                ? "..."
                : highestRiskPrediction?.category ??
                  "No data"
            }
            description={
              loading
                ? "Loading district data"
                : highestRiskPrediction?.district ??
                  "No district available"
            }
          />
        </div>

        <section className="mt-5 rounded-2xl border border-slate-700 bg-[#071225] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                District risk forecast
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Predicted case volume compared with previous records
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-[340px] items-center justify-center">
              <p className="text-sm text-slate-400">
                Loading district risk forecast...
              </p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="flex h-[340px] items-center justify-center">
              <p className="text-sm text-slate-400">
                No predictive data available.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={predictions}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#253247"
                />

                <XAxis
                  dataKey="district"
                  stroke="#94a3b8"
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip />

                <Bar
                  dataKey="previousCases"
                  fill="#475569"
                  name="Previous cases"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="predictedCases"
                  name="Predicted cases"
                  radius={[5, 5, 0, 0]}
                >
                  {predictions.map((prediction) => (
                    <Cell
                      key={prediction.id}
                      fill={
                        prediction.riskScore >= 75
                          ? "#ef4444"
                          : prediction.riskScore >= 55
                            ? "#f59e0b"
                            : "#3b82f6"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {loading ? (
            <div className="col-span-full flex min-h-[220px] items-center justify-center">
              <p className="text-sm text-slate-400">
                Loading prediction details...
              </p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="col-span-full flex min-h-[220px] items-center justify-center">
              <p className="text-sm text-slate-400">
                No district predictions are available.
              </p>
            </div>
          ) : (
            predictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
              />
            ))
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex items-start gap-3">
            <CircleAlert
              size={21}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div>
              <h3 className="font-semibold text-amber-300">
                Explainable prediction notice
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Forecasts should support planning and resource allocation.
                They must not be treated as evidence that a specific
                individual will commit an offence.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Metric({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PredictionCard({ prediction }) {
  const isIncreasing =
    prediction.trend.toLowerCase() === "increasing" ||
    prediction.predictedCases > prediction.previousCases;

  const riskClass =
    prediction.riskScore >= 75
      ? "bg-red-500/15 text-red-400"
      : prediction.riskScore >= 55
        ? "bg-amber-500/15 text-amber-400"
        : "bg-blue-500/15 text-blue-400";

  return (
    <article className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">
            {prediction.district}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {prediction.category}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${riskClass}`}
        >
          Risk {prediction.riskScore.toFixed(0)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <DataBox
          label="Predicted cases"
          value={prediction.predictedCases.toLocaleString()}
        />

        <DataBox
          label="Previous cases"
          value={prediction.previousCases.toLocaleString()}
        />

        <DataBox
          label="Confidence"
          value={`${prediction.confidence.toFixed(0)}%`}
        />

        <div className="rounded-xl bg-[#0b1930] p-3">
          <p className="text-xs text-slate-500">
            Trend
          </p>

          <div
            className={`mt-1 flex items-center gap-2 text-sm font-semibold ${
              isIncreasing
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {isIncreasing ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}

            {prediction.trend}
          </div>
        </div>
      </div>
    </article>
  );
}

function DataBox({ label, value }) {
  return (
    <div className="rounded-xl bg-[#0b1930] p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

export default PredictiveIntelligence;