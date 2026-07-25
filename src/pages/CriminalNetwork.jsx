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
  const [selectedNode, setSelectedNode] = useState(null);
  const [search, setSearch] = useState("");

  const {
    data: networkData,
    loading,
    error,
  } = useApi(() => api.network(), []);

  const networkNodes = useMemo(() => {
    const nodes = networkData?.nodes ?? [];

    return nodes.map((node, index) => {
      const source = node?.data ?? node;

      return {
        data: {
          ...source,
          id: String(
            source.id ??
              source.nodeId ??
              `${source.type ?? "node"}-${index}`,
          ),
          label:
            source.label ??
            source.name ??
            source.accusedName ??
            source.crimeNo ??
            source.districtName ??
            "Unknown entity",
          type: source.type ?? "unknown",
          risk: source.risk ?? source.riskLevel ?? "",
        },
      };
    });
  }, [networkData]);

  const networkEdges = useMemo(() => {
    const edges = networkData?.edges ?? [];

    return edges
      .map((edge, index) => {
        const source = edge?.data ?? edge;

        const sourceId =
          source.source ??
          source.sourceId ??
          source.from;

        const targetId =
          source.target ??
          source.targetId ??
          source.to;

        if (sourceId == null || targetId == null) {
          return null;
        }

        return {
          data: {
            ...source,
            id: String(
              source.id ??
                source.edgeId ??
                `edge-${index}`,
            ),
            source: String(sourceId),
            target: String(targetId),
            relation:
              source.relation ??
              source.label ??
              source.relationship ??
              "linked",
          },
        };
      })
      .filter(Boolean);
  }, [networkData]);

  const elements = useMemo(
    () => [...networkNodes, ...networkEdges],
    [networkNodes, networkEdges],
  );

  const intelligenceObservation = useMemo(() => {
    if (networkData?.observation) {
      return networkData.observation;
    }

    if (networkData?.insight) {
      return networkData.insight;
    }

    const accusedNodes = networkNodes.filter(
      (node) => node.data.type === "accused",
    );

    if (accusedNodes.length === 0) {
      return "No accused-person relationships are available in the current dataset.";
    }

    const connectionCounts = new Map();

    networkEdges.forEach((edge) => {
      const source = edge.data.source;
      const target = edge.data.target;

      connectionCounts.set(
        source,
        (connectionCounts.get(source) ?? 0) + 1,
      );

      connectionCounts.set(
        target,
        (connectionCounts.get(target) ?? 0) + 1,
      );
    });

    const rankedAccused = accusedNodes
      .map((node) => ({
        ...node.data,
        connections:
          connectionCounts.get(node.data.id) ?? 0,
      }))
      .sort(
        (first, second) =>
          second.connections - first.connections,
      );

    const mostConnected = rankedAccused[0];

    if (!mostConnected || mostConnected.connections === 0) {
      return `${accusedNodes.length.toLocaleString()} accused persons are represented in the current criminal network.`;
    }

    return `${mostConnected.label} has the highest number of visible relationships, with ${mostConnected.connections.toLocaleString()} linked network connections.`;
  }, [networkData, networkNodes, networkEdges]);

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        color: "#e2e8f0",
        "font-size": "11px",
        "text-wrap": "wrap",
        "text-max-width": "100px",
        "text-valign": "bottom",
        "text-margin-y": 10,
        width: 45,
        height: 45,
        "border-width": 2,
        "border-color": "#334155",
        "background-color": "#3b82f6",
      },
    },
    {
      selector: 'node[type="accused"]',
      style: {
        "background-color": "#ef4444",
        shape: "ellipse",
      },
    },
    {
      selector: 'node[type="case"]',
      style: {
        "background-color": "#8b5cf6",
        shape: "round-rectangle",
      },
    },
    {
      selector: 'node[type="district"]',
      style: {
        "background-color": "#14b8a6",
        shape: "hexagon",
      },
    },
    {
      selector: 'node[risk="high"]',
      style: {
        "border-color": "#fca5a5",
        "border-width": 4,
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#475569",
        "target-arrow-color": "#475569",
        "target-arrow-shape": "triangle",
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
      setSelectedNode(event.target.data());
    });
  };

  const handleSearch = () => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return;
    }

    const result = networkNodes.find((node) =>
      String(node.data.label)
        .toLowerCase()
        .includes(normalizedSearch),
    );

    if (result) {
      setSelectedNode(result.data);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={Network}
        title="Criminal Network"
        description="Visualise links between accused persons, FIRs and districts"
        action={
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search accused or FIR..."
              className="rounded-xl border border-slate-700 bg-[#071225] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-500"
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
                Loading criminal network...
              </p>
            </div>
          ) : error ? (
            <div className="flex h-full min-h-[600px] items-center justify-center px-6 text-center">
              <div>
                <ShieldAlert
                  size={28}
                  className="mx-auto text-red-400"
                />

                <p className="mt-3 text-sm font-medium text-red-300">
                  Unable to load criminal network
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {error}
                </p>
              </div>
            </div>
          ) : elements.length === 0 ? (
            <div className="flex h-full min-h-[600px] items-center justify-center">
              <p className="text-sm text-slate-400">
                No network relationships are available.
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
                nodeRepulsion: 8000,
                idealEdgeLength: 130,
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
                label="Accused person"
              />
              <Legend
                color="bg-purple-500"
                label="FIR or case"
              />
              <Legend
                color="bg-teal-500"
                label="District"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
            <h2 className="font-semibold text-white">
              Selected entity
            </h2>

            {selectedNode ? (
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    {selectedNode.type === "accused" ? (
                      <UserRound size={22} />
                    ) : (
                      <ShieldAlert size={22} />
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      {selectedNode.label}
                    </p>

                    <p className="mt-1 text-xs uppercase text-slate-500">
                      {selectedNode.type}
                    </p>
                  </div>
                </div>

                {selectedNode.risk && (
                  <div className="mt-4 rounded-xl bg-red-500/10 p-3">
                    <p className="text-xs text-slate-400">
                      Risk classification
                    </p>

                    <p className="mt-1 font-semibold capitalize text-red-400">
                      {selectedNode.risk}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Select a node in the network to inspect its
                details.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
            <h3 className="font-semibold text-blue-300">
              Intelligence observation
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {loading
                ? "Analysing criminal relationships..."
                : intelligenceObservation}
            </p>
          </section>
        </aside>
      </main>
    </div>
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