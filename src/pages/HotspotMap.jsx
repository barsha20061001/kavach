import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import {
  MapPinned,
  ShieldAlert,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

function HotspotMap() {
  const {
    data,
    loading,
    error,
  } = useApi(() => api.hotspots(), []);

  const points = useMemo(() => {
    const source =
      data?.points ??
      data?.data?.points ??
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source
      .map((point, index) => ({
        id:
          point.caseId ??
          point.CaseMasterID ??
          point.id ??
          `point-${index}`,

        crimeNo:
          point.crimeNo ??
          point.CrimeNo ??
          "Not available",

        latitude: toNumber(
          point.latitude ??
            point.Latitude,
        ),

        longitude: toNumber(
          point.longitude ??
            point.Longitude,
        ),

        districtId:
          point.districtId ??
          point.DistrictID ??
          "",

        districtName:
          point.districtName ??
          point.DistrictName ??
          "Unknown",

        crimeHeadName:
          point.crimeHeadName ??
          point.CrimeGroupName ??
          "Unknown",

        gravityOffenceId:
          point.gravityOffenceId ??
          point.GravityOffenceID ??
          null,

        gravityName:
          point.gravityName ??
          point.LookupValue ??
          "Unknown",

        date:
          point.date ??
          point.CrimeRegisteredDate ??
          null,
      }))
      .filter(
        (point) =>
          Number.isFinite(point.latitude) &&
          Number.isFinite(point.longitude),
      );
  }, [data]);

  const clusters = useMemo(() => {
    const source =
      data?.clusters ??
      data?.data?.clusters ??
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source
      .map((cluster, index) => ({
        id:
          cluster.districtId ??
          cluster.DistrictID ??
          `cluster-${index}`,

        districtName:
          cluster.districtName ??
          cluster.DistrictName ??
          "Unknown",

        count: toNumber(
          cluster.count ??
            cluster.caseCount ??
            cluster.totalCases,
        ),

        latitude: toNumber(
          cluster.latitude ??
            cluster.Latitude,
        ),

        longitude: toNumber(
          cluster.longitude ??
            cluster.Longitude,
        ),

        risk: normalizeRisk(cluster.risk),
      }))
      .filter(
        (cluster) =>
          Number.isFinite(cluster.latitude) &&
          Number.isFinite(cluster.longitude),
      )
      .sort(
        (first, second) =>
          second.count - first.count,
      );
  }, [data]);

  const highRiskIncidents = useMemo(() => {
    return points.filter(isHeinousPoint).length;
  }, [points]);

  const mostAffected = clusters[0] ?? {
    districtName: "No data",
    count: 0,
    risk: "low",
  };

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
                Loading geospatial FIR records...
              </p>
            </div>
          ) : error ? (
            <div className="flex h-full min-h-[600px] items-center justify-center bg-[#071225] p-6">
              <div className="text-center">
                <p className="font-semibold text-red-300">
                  Unable to load hotspot data
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {String(error)}
                </p>
              </div>
            </div>
          ) : clusters.length === 0 ? (
            <div className="flex h-full min-h-[600px] items-center justify-center bg-[#071225]">
              <p className="text-sm text-slate-400">
                No mapped district records are available.
              </p>
            </div>
          ) : (
            <MapContainer
              center={getMapCentre(clusters)}
              zoom={7}
              className="h-full min-h-[600px] w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitMapToClusters clusters={clusters} />

              {clusters.map((cluster) => (
                <CircleMarker
                  key={cluster.id}
                  center={[
                    cluster.latitude,
                    cluster.longitude,
                  ]}
                  radius={calculateRadius(
                    cluster.count,
                    clusters,
                  )}
                  pathOptions={{
                    color: getRiskColour(
                      cluster.risk,
                    ),
                    fillColor: getRiskColour(
                      cluster.risk,
                    ),
                    fillOpacity: 0.72,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="min-w-52">
                      <strong>
                        {cluster.districtName}
                      </strong>

                      <p>
                        Registered cases:{" "}
                        {formatNumber(
                          cluster.count,
                        )}
                      </p>

                      <p>
                        Risk classification:{" "}
                        {formatRisk(cluster.risk)}
                      </p>

                      <p>
                        Share of mapped cases:{" "}
                        {calculateShare(
                          cluster.count,
                          points.length,
                        )}
                        %
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
            <h2 className="font-semibold text-white">
              Hotspot Summary
            </h2>

            <div className="mt-5 space-y-3">
              {[
                [
                  "High-risk incidents",
                  loading
                    ? "..."
                    : formatNumber(
                        highRiskIncidents,
                      ),
                ],
                [
                  "Mapped incidents",
                  loading
                    ? "..."
                    : formatNumber(
                        points.length,
                      ),
                ],
                [
                  "Districts covered",
                  loading
                    ? "..."
                    : formatNumber(
                        clusters.length,
                      ),
                ],
                [
                  "Most affected",
                  loading
                    ? "..."
                    : mostAffected.districtName,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 rounded-xl bg-[#0b1930] px-4 py-3"
                >
                  <span className="text-sm text-slate-400">
                    {label}
                  </span>

                  <span className="text-right text-sm font-semibold text-white">
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

                {loading ? (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Analysing district concentrations...
                  </p>
                ) : clusters.length === 0 ? (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    No hotspot concentration could be calculated.
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {mostAffected.districtName} has
                    the highest concentration of
                    mapped incidents, with{" "}
                    {formatNumber(
                      mostAffected.count,
                    )}{" "}
                    registered cases in the current
                    dataset.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-xs leading-5 text-slate-400">
              District markers are calculated from
              CaseMaster records linked to police
              stations and districts. Marker size
              represents relative case concentration.
              The data is synthetic and does not
              represent real police incidents.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FitMapToClusters({ clusters }) {
  const map = useMap();

  useEffect(() => {
    if (!clusters.length) {
      return;
    }

    const bounds = clusters.map((cluster) => [
      cluster.latitude,
      cluster.longitude,
    ]);

    map.fitBounds(bounds, {
      padding: [30, 30],
      maxZoom: 8,
    });
  }, [clusters, map]);

  return null;
}

function isHeinousPoint(point) {
  if (
    point.gravityOffenceId !== null &&
    point.gravityOffenceId !== undefined &&
    point.gravityOffenceId !== ""
  ) {
    return (
      String(point.gravityOffenceId) === "1"
    );
  }

  const gravity = String(
    point.gravityName ?? "",
  ).toLowerCase();

  return (
    gravity.includes("heinous") ||
    gravity.includes("high") ||
    gravity.includes("severe")
  );
}

function normalizeRisk(value) {
  const risk = String(
    value ?? "",
  ).toLowerCase();

  if (risk === "high") {
    return "high";
  }

  if (risk === "medium") {
    return "medium";
  }

  return "low";
}

function getRiskColour(risk) {
  if (risk === "high") {
    return "#ef4444";
  }

  if (risk === "medium") {
    return "#f59e0b";
  }

  return "#3b82f6";
}

function formatRisk(risk) {
  return (
    risk.charAt(0).toUpperCase() +
    risk.slice(1)
  );
}

function calculateRadius(count, clusters) {
  if (!clusters.length) {
    return 8;
  }

  const maximum = Math.max(
    ...clusters.map((cluster) =>
      toNumber(cluster.count),
    ),
    1,
  );

  const minimum = Math.min(
    ...clusters.map((cluster) =>
      toNumber(cluster.count),
    ),
  );

  if (maximum === minimum) {
    return 14;
  }

  const normalized =
    (toNumber(count) - minimum) /
    (maximum - minimum);

  return 8 + normalized * 12;
}

function getMapCentre(clusters) {
  if (!clusters.length) {
    return [14.5, 76.2];
  }

  const latitude =
    clusters.reduce(
      (sum, cluster) =>
        sum + cluster.latitude,
      0,
    ) / clusters.length;

  const longitude =
    clusters.reduce(
      (sum, cluster) =>
        sum + cluster.longitude,
      0,
    ) / clusters.length;

  return [latitude, longitude];
}

function calculateShare(value, total) {
  if (!total) {
    return "0.0";
  }

  return (
    (toNumber(value) / total) *
    100
  ).toFixed(1);
}

function formatNumber(value) {
  return toNumber(value).toLocaleString(
    "en-IN",
  );
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

export default HotspotMap;