import { useMemo, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

import {
  Network,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

function CriminalNetwork() {
  const [selectedNode, setSelectedNode] =
    useState(null);

  const [search, setSearch] = useState("");
  const [searchMessage, setSearchMessage] =
    useState("");

  const {
    data,
    loading,
    error,
  } = useApi(() => api.network(), []);

  const networkNodes = useMemo(() => {
    const source =
      data?.nodes ??
      data?.data?.nodes ??
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source
      .map((node, index) => {
        const degree = toNumber(
          node.degree ??
            node.connectionCount ??
            node.connections,
        );

        return {
          data: {
            id: String(
              node.id ??
                node.personId ??
                node.PersonMasterID ??
                `person-${index}`,
            ),

            label:
              node.label ??
              node.name ??
              node.personName ??
              "Unknown person",

            type: "accused",

            degree,

            risk: normalizeRisk(
              node.risk ??
                calculateRisk(degree),
            ),
          },
        };
      })
      .filter(
        (node) =>
          node.data.id &&
          node.data.label,
      );
  }, [data]);

  const networkEdges = useMemo(() => {
    const source =
      data?.edges ??
      data?.data?.edges ??
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source
      .map((edge, index) => {
        const weight = toNumber(
          edge.weight ??
            edge.count ??
            edge.sharedCases,
        );

        const sourceId = String(
          edge.source ??
            edge.sourceId ??
            "",
        );

        const targetId = String(
          edge.target ??
            edge.targetId ??
            "",
        );

        return {
          data: {
            id:
              edge.id ??
              `edge-${sourceId}-${targetId}-${index}`,

            source: sourceId,
            target: targetId,
            weight,

            relation:
              weight === 1
                ? "1 shared case"
                : `${weight} shared cases`,
          },
        };
      })
      .filter(
        (edge) =>
          edge.data.source &&
          edge.data.target,
      );
  }, [data]);

  const elements = useMemo(
    () => [
      ...networkNodes,
      ...networkEdges,
    ],
    [networkNodes, networkEdges],
  );

  const networkSummary = useMemo(() => {
    const highRisk = networkNodes.filter(
      (node) =>
        node.data.risk === "high",
    ).length;

    const mediumRisk = networkNodes.filter(
      (node) =>
        node.data.risk === "medium",
    ).length;

    const lowRisk = networkNodes.filter(
      (node) =>
        node.data.risk === "low",
    ).length;

    const mostConnected =
      networkNodes.length > 0
        ? [...networkNodes].sort(
            (first, second) =>
              second.data.degree -
              first.data.degree,
          )[0]?.data
        : null;

    return {
      highRisk,
      mediumRisk,
      lowRisk,
      mostConnected,
    };
  }, [networkNodes]);

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        color: "#e2e8f0",
        "font-size": "10px",
        "text-wrap": "wrap",
        "text-max-width": "100px",
        "text-valign": "bottom",
        "text-margin-y": 10,
        width: 42,
        height: 42,
        "border-width": 2,
        "border-color": "#334155",
        "background-color": "#3b82f6",
      },
    },
    {
      selector: 'node[risk="high"]',
      style: {
        "background-color": "#ef4444",
        "border-color": "#fca5a5",
        "border-width": 4,
        width: 52,
        height: 52,
      },
    },
    {
      selector: 'node[risk="medium"]',
      style: {
        "background-color": "#f59e0b",
        "border-color": "#fcd34d",
        "border-width": 3,
        width: 47,
        height: 47,
      },
    },
    {
      selector: 'node[risk="low"]',
      style: {
        "background-color": "#3b82f6",
        "border-color": "#60a5fa",
      },
    },
    {
      selector: "edge",
      style: {
        width:
          "mapData(weight, 1, 10, 1, 6)",
        "line-color": "#475569",
        "target-arrow-color": "#475569",
        "target-arrow-shape": "none",
        "curve-style": "bezier",
        label: "data(relation)",
        color: "#94a3b8",
        "font-size": "8px",
        "text-background-color": "#071225",
        "text-background-opacity": 1,
        "text-background-padding": 3,
      },
    },
    {
      selector: ":selected",
      style: {
        "border-color": "#f8fafc",
        "border-width": 4,
      },
    },
  ];

  const handleCy = (cy) => {
    cy.off("tap", "node");

    cy.on("tap", "node", (event) => {
      setSelectedNode(
        event.target.data(),
      );

      setSearchMessage("");
    });
  };

  const handleSearch = () => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      setSearchMessage(
        "Enter an accused-person name.",
      );

      return;
    }

    const result = networkNodes.find(
      (node) =>
        node.data.label
          .toLowerCase()
          .includes(normalizedSearch),
    );

    if (result) {
      setSelectedNode(result.data);
      setSearchMessage("");
    } else {
      setSelectedNode(null);

      setSearchMessage(
        "No matching accused person was found in the current network dataset.",
      );
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={Network}
        title="Criminal Network"
        description="Visualise accused-person relationships derived from shared FIR records"
        action={
          <div className="flex gap-2">
            <input
              value={search}
              disabled={loading}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );

                setSearchMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search accused person..."
              className="rounded-xl border border-slate-700 bg-[#071225] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
            />

            <button
              type="button"
              disabled={loading}
              onClick={handleSearch}
              className="rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search size={18} />
            </button>
          </div>
        }
      />

      <main className="grid min-h-0 flex-1 gap-5 overflow-hidden p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-h-[600px] overflow-hidden rounded-2xl border border-slate-700 bg-[#061124]">
          {loading ? (
            <div className="flex h-full min-h-[600px] items-center justify-center">
              <p className="text-sm text-slate-400">
                Building accused-person
                relationship network...
              </p>
            </div>
          ) : error ? (
            <div className="flex h-full min-h-[600px] items-center justify-center p-6">
              <div className="text-center">
                <p className="font-semibold text-red-300">
                  Unable to load criminal
                  network
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {String(error)}
                </p>
              </div>
            </div>
          ) : elements.length === 0 ? (
            <div className="flex h-full min-h-[600px] items-center justify-center">
              <p className="text-sm text-slate-400">
                No accused-person
                relationships are available.
              </p>
            </div>
          ) : (
            <CytoscapeComponent
              elements={elements}
              stylesheet={stylesheet}
              cy={handleCy}
              layout={{
                name: "cose",
                animate: true,
                nodeRepulsion: 9000,
                idealEdgeLength: 120,
                edgeElasticity: 120,
                gravity: 0.3,
                numIter: 1000,
                randomize: true,
              }}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "600px",
              }}
            />
          )}
        </section>

        <aside className="space-y-4 overflow-y-auto">
          <section className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
            <h2 className="font-semibold text-white">
              Network legend
            </h2>

            <div className="mt-5 space-y-3">
              <Legend
                color="bg-red-500"
                label={`High connectivity (${formatNumber(
                  networkSummary.highRisk,
                )})`}
              />

              <Legend
                color="bg-amber-500"
                label={`Medium connectivity (${formatNumber(
                  networkSummary.mediumRisk,
                )})`}
              />

              <Legend
                color="bg-blue-500"
                label={`Low connectivity (${formatNumber(
                  networkSummary.lowRisk,
                )})`}
              />
            </div>

            <div className="mt-5 border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-500">
                {formatNumber(
                  networkNodes.length,
                )}{" "}
                accused persons
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatNumber(
                  networkEdges.length,
                )}{" "}
                shared-case relationships
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
            <h2 className="font-semibold text-white">
              Selected entity
            </h2>

            {searchMessage && (
              <p className="mt-4 text-sm leading-6 text-amber-400">
                {searchMessage}
              </p>
            )}

            {selectedNode ? (
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    <UserRound size={22} />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      {
                        selectedNode.label
                      }
                    </p>

                    <p className="mt-1 text-xs uppercase text-slate-500">
                      Accused person
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#0b1930] p-3">
                  <p className="text-xs text-slate-400">
                    Connection strength
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {formatNumber(
                      selectedNode.degree,
                    )}{" "}
                    weighted links
                  </p>
                </div>

                <div
                  className={`mt-3 rounded-xl p-3 ${
                    selectedNode.risk ===
                    "high"
                      ? "bg-red-500/10"
                      : selectedNode.risk ===
                          "medium"
                        ? "bg-amber-500/10"
                        : "bg-blue-500/10"
                  }`}
                >
                  <p className="text-xs text-slate-400">
                    Network classification
                  </p>

                  <p
                    className={`mt-1 font-semibold capitalize ${
                      selectedNode.risk ===
                      "high"
                        ? "text-red-400"
                        : selectedNode.risk ===
                            "medium"
                          ? "text-amber-400"
                          : "text-blue-400"
                    }`}
                  >
                    {selectedNode.risk}
                  </p>
                </div>
              </div>
            ) : (
              !searchMessage && (
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Select a node in the
                  network to inspect its
                  dataset-derived details.
                </p>
              )
            )}
          </section>

          <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
            <h3 className="font-semibold text-blue-300">
              Intelligence observation
            </h3>

            {loading ? (
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Analysing accused-person
                relationships...
              </p>
            ) : networkSummary.mostConnected ? (
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {
                  networkSummary
                    .mostConnected.label
                }{" "}
                has the highest weighted
                connectivity in the current
                graph, with{" "}
                {formatNumber(
                  networkSummary
                    .mostConnected.degree,
                )}{" "}
                shared-case links.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-300">
                No shared accused-person
                relationships are available in
                the current dataset.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-700 bg-[#071225] p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={18}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <p className="text-xs leading-5 text-slate-400">
                Nodes are created from accused
                records grouped by person.
                Connections indicate that two
                accused persons appear in the
                same FIR. Network
                classification is an analytical
                indicator, not evidence of
                criminal association.
              </p>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

function normalizeRisk(value) {
  const risk = String(value ?? "")
    .trim()
    .toLowerCase();

  if (risk === "high") {
    return "high";
  }

  if (risk === "medium") {
    return "medium";
  }

  return "low";
}

function calculateRisk(degree) {
  if (degree >= 6) {
    return "high";
  }

  if (degree >= 3) {
    return "medium";
  }

  return "low";
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

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-3 w-3 rounded-full ${color}`}
      />

      <span className="text-sm text-slate-300">
        {label}
      </span>
    </div>
  );
}

export default CriminalNetwork;