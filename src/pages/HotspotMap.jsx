import { MapContainer, CircleMarker, Popup, TileLayer } from "react-leaflet";
import { MapPinned, ShieldAlert } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

function isHighRiskIncident(crime) {
  const gravity = String(crime?.gravityName || "").toLowerCase();

  return (
    gravity.includes("high") ||
    gravity.includes("heinous") ||
    gravity.includes("grave") ||
    gravity.includes("serious")
  );
}

function HotspotMap() {
  const {
    data,
    loading,
    error,
  } = useApi(() => api.hotspots(), []);

  const crimeCases = data?.points ?? [];
  const hotspotClusters = data?.clusters ?? [];

  const highRiskIncidents = crimeCases.filter(
    isHighRiskIncident,
  ).length;

  const districtsCovered = new Set(
    crimeCases
      .map((crime) => crime.districtId)
      .filter(Boolean),
  ).size;

  const mostAffectedDistrict =
    hotspotClusters.length > 0
      ? [...hotspotClusters].sort(
          (first, second) => second.count - first.count,
        )[0]
      : null;

  const summaryItems = [
    [
      "High-risk incidents",
      loading ? "..." : highRiskIncidents.toLocaleString(),
    ],
    [
      "Mapped incidents",
      loading ? "..." : crimeCases.length.toLocaleString(),
    ],
    [
      "Districts covered",
      loading ? "..." : districtsCovered.toLocaleString(),
    ],
    [
      "Most affected",
      loading
        ? "..."
        : mostAffectedDistrict?.districtName ?? "No data",
    ],
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={MapPinned}
        title="Crime Hotspot Map"
        description="Geospatial distribution of FIR incidents across Karnataka"
      />

      <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[600px] overflow-hidden rounded-2xl border border-slate-700">
          {loading ? (
            <div className="flex h-full min-h-[600px] items-center justify-center bg-[#071225]">
              <p className="text-sm text-slate-400">
                Loading crime hotspot data...
              </p>
            </div>
          ) : error ? (
            <div className="flex h-full min-h-[600px] items-center justify-center bg-[#071225] px-6 text-center">
              <div>
                <ShieldAlert
                  size={28}
                  className="mx-auto text-red-400"
                />

                <p className="mt-3 text-sm font-medium text-red-300">
                  Unable to load hotspot data
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {error}
                </p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[14.5, 76.2]}
              zoom={7}
              className="h-full min-h-[600px] w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {crimeCases.map((crime) => {
                const highRisk = isHighRiskIncident(crime);

                return (
                  <CircleMarker
                    key={crime.caseId}
                    center={[
                      crime.latitude,
                      crime.longitude,
                    ]}
                    radius={highRisk ? 14 : 9}
                    pathOptions={{
                      color: highRisk
                        ? "#ef4444"
                        : "#3b82f6",
                      fillColor: highRisk
                        ? "#ef4444"
                        : "#3b82f6",
                      fillOpacity: 0.65,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="min-w-52">
                        <strong>
                          {crime.crimeHeadName || "Unknown offence"}
                        </strong>

                        <p>
                          Crime number:{" "}
                          {crime.crimeNo || "Not available"}
                        </p>

                        <p>
                          District:{" "}
                          {crime.districtName || "Unknown"}
                        </p>

                        <p>
                          Severity:{" "}
                          {crime.gravityName || "Not specified"}
                        </p>

                        <p>
                          Date:{" "}
                          {crime.date
                            ? new Date(
                                crime.date,
                              ).toLocaleDateString("en-GB")
                            : "Not available"}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
            <h2 className="font-semibold text-white">
              Hotspot Summary
            </h2>

            <div className="mt-5 space-y-3">
              {summaryItems.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 rounded-xl bg-[#0b1930] px-4 py-3"
                >
                  <span className="text-sm text-slate-400">
                    {label}
                  </span>

                  <span className="max-w-36 truncate text-right text-sm font-semibold text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex gap-3">
              <ShieldAlert
                className="shrink-0 text-red-400"
                size={20}
              />

              <div>
                <h3 className="font-semibold text-white">
                  Emerging hotspot
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {loading
                    ? "Analysing mapped incidents..."
                    : mostAffectedDistrict
                      ? `${mostAffectedDistrict.districtName} has the highest concentration of mapped incidents, with ${mostAffectedDistrict.count.toLocaleString()} cases in the current dataset.`
                      : "No hotspot information is currently available."}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HotspotMap;