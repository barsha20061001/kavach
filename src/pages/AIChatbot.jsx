import { useEffect, useMemo, useRef, useState } from "react";

import {
  Bot,
  Info,
  Map,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";

import { addAuditLog } from "../utils/auditLogger";
import { api } from "../services/api";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getArray(value) {
  return Array.isArray(value) ? value : [];
}

function getNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getDashboardData(response) {
  return response?.data ?? response ?? {};
}

function getTrendData(response) {
  return response?.data ?? response ?? {};
}

function getDistricts(response) {
  const source =
    response?.districts ??
    response?.data?.districts ??
    response?.data ??
    response ??
    [];

  return getArray(source);
}

function getOffenders(response) {
  const source =
    response?.offenders ??
    response?.repeatOffenders ??
    response?.data?.offenders ??
    response?.data ??
    response ??
    [];

  return getArray(source);
}

function AICrimeAssistant() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);

  const [datasetContext, setDatasetContext] = useState({
    dashboard: {},
    trends: {},
    districts: [],
    offenders: [],
  });

  const [messages, setMessages] = useState([
    {
      id: createId(),
      role: "assistant",
      content:
        "Loading the Kavach AI synthetic FIR dataset and preparing crime-intelligence tools...",
      time: getCurrentTime(),
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadDatasetContext() {
      setContextLoading(true);

      try {
        const [
          dashboardResponse,
          trendsResponse,
          districtsResponse,
          offendersResponse,
        ] = await Promise.all([
          api.dashboard(),
          api.crimeTrends(),
          api.districts(),
          api.repeatOffenders(),
        ]);

        if (!active) return;

        const dashboard =
          getDashboardData(dashboardResponse);

        const trends =
          getTrendData(trendsResponse);

        const districts =
          getDistricts(districtsResponse);

        const offenders =
          getOffenders(offendersResponse);

        setDatasetContext({
          dashboard,
          trends,
          districts,
          offenders,
        });

        const totalCases = getNumber(
          dashboard?.kpis?.totalCases ??
            dashboard?.totalCases,
        );

        const districtCount =
          getNumber(
            dashboard?.kpis?.districtsCovered,
          ) || districts.length;

        setMessages([
          {
            id: createId(),
            role: "assistant",
            content:
              `Hello! I am Kavach AI, your dataset-grounded crime intelligence assistant.\n\n` +
              `The current synthetic FIR dataset contains ${totalCases.toLocaleString(
                "en-IN",
              )} registered cases across ${districtCount.toLocaleString(
                "en-IN",
              )} districts.\n\n` +
              "I can analyse case totals, crime categories, district concentration, trends and repeat-offender patterns using the loaded CSV records.\n\nWhat would you like to investigate today?",
            time: getCurrentTime(),
          },
        ]);
      } catch (error) {
        console.error(
          "Failed to load assistant context:",
          error,
        );

        if (!active) return;

        setMessages([
          {
            id: createId(),
            role: "assistant",
            content:
              "I could not load the FIR dataset context. Confirm that the backend is running at http://localhost:5000 and try again.",
            time: getCurrentTime(),
          },
        ]);
      } finally {
        if (active) {
          setContextLoading(false);
        }
      }
    }

    loadDatasetContext();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  const topDistricts = useMemo(() => {
    const dashboardRows = getArray(
      datasetContext.dashboard?.topDistricts,
    );

    if (dashboardRows.length > 0) {
      return [...dashboardRows].sort(
        (first, second) =>
          getNumber(second.count) -
          getNumber(first.count),
      );
    }

    return [...datasetContext.districts]
      .map((district) => ({
        districtId:
          district.DistrictID ??
          district.districtId ??
          district.id,

        districtName:
          district.DistrictName ??
          district.districtName ??
          district.name ??
          "Unknown",

        count: getNumber(
          district.caseCount ??
            district.count ??
            district.totalCases,
        ),
      }))
      .sort(
        (first, second) =>
          second.count - first.count,
      );
  }, [datasetContext]);

  const crimeTypes = useMemo(() => {
    const source =
      getArray(
        datasetContext.dashboard?.topCrimeTypes,
      ).length > 0
        ? getArray(
            datasetContext.dashboard
              ?.topCrimeTypes,
          )
        : getArray(
            datasetContext.trends?.crimeTypes,
          );

    return [...source].sort(
      (first, second) =>
        getNumber(second.count) -
        getNumber(first.count),
    );
  }, [datasetContext]);

  const monthlyTrend = useMemo(() => {
    const source = getArray(
      datasetContext.trends?.monthlyTrend ??
        datasetContext.dashboard?.monthlyTrend,
    );

    return source
      .map((item) => ({
        month:
          item.month ??
          item.period ??
          item.date ??
          "Unknown",

        cases: getNumber(
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
  }, [datasetContext]);

  const presetData = useMemo(() => {
    const leadingDistrict =
      topDistricts[0]?.districtName ??
      "the highest-volume district";

    const leadingCrime =
      crimeTypes[0]?.crimeHeadName ??
      crimeTypes[0]?.name ??
      "the leading crime category";

    return [
      {
        text:
          "Show the districts with the highest number of registered cases",
        icon: ShieldAlert,
        iconClass:
          "bg-red-500/15 text-red-400",
      },
      {
        text: `Find repeat offenders linked to ${leadingDistrict}`,
        icon: UsersRound,
        iconClass:
          "bg-purple-500/15 text-purple-400",
      },
      {
        text: `Analyse ${leadingCrime} across districts`,
        icon: Map,
        iconClass:
          "bg-blue-500/15 text-blue-400",
      },
      {
        text:
          "Compare the latest three months of registered cases",
        icon: TrendingUp,
        iconClass:
          "bg-emerald-500/15 text-emerald-400",
      },
    ];
  }, [topDistricts, crimeTypes]);

  function findDistrictInQuestion(text) {
    const normalized = text.toLowerCase();

    const match = datasetContext.districts.find(
      (district) => {
        const name =
          district.DistrictName ??
          district.districtName ??
          district.name;

        return (
          name &&
          normalized.includes(
            String(name).toLowerCase(),
          )
        );
      },
    );

    return (
      match?.DistrictName ??
      match?.districtName ??
      match?.name ??
      null
    );
  }

  function findCrimeTypeInQuestion(text) {
    const normalized = text.toLowerCase();

    const match = crimeTypes.find((crime) => {
      const name =
        crime.crimeHeadName ??
        crime.name ??
        crime.category;

      return (
        name &&
        normalized.includes(
          String(name).toLowerCase(),
        )
      );
    });

    return (
      match?.crimeHeadName ??
      match?.name ??
      match?.category ??
      null
    );
  }

  function buildLocalDatasetAnswer(text) {
    const normalized = text.toLowerCase();

    const dashboard = datasetContext.dashboard;
    const kpis = dashboard?.kpis ?? {};

    const totalCases = getNumber(
      kpis.totalCases ??
        dashboard?.totalCases,
    );

    const activeInvestigations = getNumber(
      kpis.activeInvestigations,
    );

    const heinousOffences = getNumber(
      kpis.heinousOffences ??
        kpis.severeCases,
    );

    if (
      normalized.includes("total") &&
      normalized.includes("case")
    ) {
      return {
        content:
          `The current synthetic FIR dataset contains ${totalCases.toLocaleString(
            "en-IN",
          )} registered cases.`,
        rows: [
          {
            metric: "Total registered cases",
            value: totalCases.toLocaleString(
              "en-IN",
            ),
          },
        ],
      };
    }

    if (
      normalized.includes("active") ||
      normalized.includes(
        "under investigation",
      )
    ) {
      const percentage = totalCases
        ? (
            (activeInvestigations /
              totalCases) *
            100
          ).toFixed(1)
        : "0.0";

      return {
        content:
          `${activeInvestigations.toLocaleString(
            "en-IN",
          )} cases are under active investigation, representing ${percentage}% of all registered cases in the dataset.`,
        rows: [
          {
            metric: "Active investigations",
            value:
              activeInvestigations.toLocaleString(
                "en-IN",
              ),
          },
          {
            metric: "Share of total cases",
            value: `${percentage}%`,
          },
        ],
      };
    }

    if (
      normalized.includes("heinous") ||
      normalized.includes("severe") ||
      normalized.includes("gravity")
    ) {
      const percentage = totalCases
        ? (
            (heinousOffences /
              totalCases) *
            100
          ).toFixed(1)
        : "0.0";

      return {
        content:
          `${heinousOffences.toLocaleString(
            "en-IN",
          )} cases are classified as heinous offences, representing ${percentage}% of the dataset.`,
        rows: [
          {
            metric: "Heinous offences",
            value:
              heinousOffences.toLocaleString(
                "en-IN",
              ),
          },
          {
            metric: "Share of total cases",
            value: `${percentage}%`,
          },
        ],
      };
    }

    if (
      normalized.includes("district") ||
      normalized.includes("hotspot") ||
      normalized.includes(
        "highest number",
      ) ||
      normalized.includes(
        "highest case",
      )
    ) {
      const rows = topDistricts
        .slice(0, 10)
        .map((district, index) => ({
          rank: index + 1,

          district:
            district.districtName ??
            district.DistrictName ??
            district.name ??
            "Unknown",

          registered_cases: getNumber(
            district.count ??
              district.caseCount,
          ).toLocaleString("en-IN"),
        }));

      const leading = rows[0];

      return {
        content: leading
          ? `${leading.district} has the highest case volume with ${leading.registered_cases} registered cases. The table shows the leading districts calculated directly from CaseMaster and Unit district relationships.`
          : "No district-level records are currently available.",
        rows,
      };
    }

    if (
      normalized.includes("repeat") ||
      normalized.includes("offender")
    ) {
      const districtName =
        findDistrictInQuestion(text);

      let matchingOffenders =
        datasetContext.offenders;

      if (districtName) {
        matchingOffenders =
          matchingOffenders.filter(
            (offender) =>
              getArray(
                offender.districts,
              ).some(
                (district) =>
                  String(
                    typeof district ===
                      "string"
                      ? district
                      : district.districtName ??
                          district.name,
                  ).toLowerCase() ===
                  districtName.toLowerCase(),
              ),
          );
      }

      matchingOffenders = [
        ...matchingOffenders,
      ].sort(
        (first, second) =>
          getNumber(second.caseCount) -
          getNumber(first.caseCount),
      );

      const rows = matchingOffenders
        .slice(0, 20)
        .map((offender, index) => ({
          rank: index + 1,

          person:
            offender.name ??
            offender.personName ??
            "Unknown",

          linked_cases: getNumber(
            offender.caseCount ??
              offender.totalCases,
          ),

          districts: getArray(
            offender.districts,
          )
            .map((district) =>
              typeof district === "string"
                ? district
                : district.districtName ??
                  district.name,
            )
            .filter(Boolean)
            .join(", "),

          crime_types: getArray(
            offender.crimeTypes,
          )
            .map((crime) =>
              typeof crime === "string"
                ? crime
                : crime.name,
            )
            .filter(Boolean)
            .join(", "),
        }));

      const locationText = districtName
        ? ` linked to ${districtName}`
        : "";

      return {
        content:
          `${matchingOffenders.length.toLocaleString(
            "en-IN",
          )} repeat offenders${locationText} were found using PersonMasterID links across distinct accused-case records. The table shows the highest case-linked persons.`,
        rows,
      };
    }

    if (
      normalized.includes("crime") ||
      normalized.includes("category") ||
      normalized.includes("type")
    ) {
      const requestedCrime =
        findCrimeTypeInQuestion(text);

      const rows = crimeTypes.map(
        (crime, index) => ({
          rank: index + 1,

          crime_category:
            crime.crimeHeadName ??
            crime.name ??
            crime.category ??
            "Unknown",

          registered_cases: getNumber(
            crime.count ??
              crime.value ??
              crime.totalCases,
          ).toLocaleString("en-IN"),
        }),
      );

      if (requestedCrime) {
        const selected = rows.find(
          (row) =>
            row.crime_category.toLowerCase() ===
            requestedCrime.toLowerCase(),
        );

        return {
          content: selected
            ? `${selected.crime_category} contains ${selected.registered_cases} registered cases in the current dataset.`
            : `No matching records were found for ${requestedCrime}.`,
          rows: selected ? [selected] : [],
        };
      }

      const leading = rows[0];

      return {
        content: leading
          ? `${leading.crime_category} is the largest crime category with ${leading.registered_cases} registered cases.`
          : "No crime-category data is currently available.",
        rows,
      };
    }

    if (
      normalized.includes("trend") ||
      normalized.includes("month") ||
      normalized.includes("over time") ||
      normalized.includes("latest")
    ) {
      const requestedThreeMonths =
        normalized.includes("three") ||
        normalized.includes("3 month");

      const rows = requestedThreeMonths
        ? monthlyTrend.slice(-3)
        : monthlyTrend.slice(-12);

      const first = rows[0];
      const last = rows.at(-1);

      let content =
        "Monthly case trend calculated from CrimeRegisteredDate.";

      if (first && last) {
        const difference =
          last.cases - first.cases;

        const direction =
          difference > 0
            ? "increased"
            : difference < 0
              ? "decreased"
              : "remained unchanged";

        content =
          `Registered cases ${direction} from ${first.cases.toLocaleString(
            "en-IN",
          )} in ${first.month} to ${last.cases.toLocaleString(
            "en-IN",
          )} in ${last.month}.`;
      }

      return {
        content,
        rows: rows.map((item) => ({
          month: item.month,
          registered_cases:
            item.cases.toLocaleString("en-IN"),
        })),
      };
    }

    return null;
  }

  async function handleSend(selectedQuestion) {
    const finalQuestion =
      typeof selectedQuestion === "string"
        ? selectedQuestion.trim()
        : question.trim();

    if (
      !finalQuestion ||
      isLoading ||
      contextLoading
    ) {
      return;
    }

    const userMessage = {
      id: createId(),
      role: "user",
      content: finalQuestion,
      time: getCurrentTime(),
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion("");
    setIsLoading(true);

    try {
      const localResult =
        buildLocalDatasetAnswer(finalQuestion);

      let assistantResult = localResult;

      if (!assistantResult) {
        const backendResult =
          await api.assistant(finalQuestion);

        assistantResult = {
          content:
            backendResult?.answer ??
            backendResult?.summary ??
            "No matching dataset analysis was returned.",

          rows:
            backendResult?.rows ??
            backendResult?.data ??
            [],

          note:
            backendResult?.note ??
            "Response generated from the local synthetic FIR dataset.",
        };
      }

      const assistantMessage = {
        id: createId(),
        role: "assistant",
        content: assistantResult.content,
        rows: getArray(assistantResult.rows),
        note:
          assistantResult.note ??
          "Dataset-grounded result generated from the local synthetic CSV records.",
        time: getCurrentTime(),
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      addAuditLog({
        action: "Generated AI query",
        resource: finalQuestion,
        category: "AI Query",
        status: "Success",
      });
    } catch (error) {
      console.error(
        "Assistant request failed:",
        error,
      );

      addAuditLog({
        action: "Generated AI query",
         resource: finalQuestion,
        category: "AI Query",
       status: "Failed",
    details:
       error?.message ??
       "Assistant request failed",
     });

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content:
            error?.message ??
            "I could not process that dataset query. Confirm that the backend is running and try again.",
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleSend(question);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#020817]">
      <header className="shrink-0 border-b border-slate-800 bg-[#051022] px-6 py-5 lg:px-8">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Sparkles
                className="text-blue-400"
                size={24}
              />

              <h1 className="text-xl font-bold text-white md:text-2xl">
                Kavach AI Copilot
              </h1>

              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                Dataset Intelligence
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Dataset-grounded crime investigation
              assistant and intelligence analysis
              engine
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden p-4 lg:p-5">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#071225] xl:flex">
            <div className="shrink-0 border-b border-slate-800 px-5 py-5">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={17}
                  className="text-yellow-300"
                />

                <h2 className="text-sm font-bold uppercase tracking-wide text-white">
                  Investigation Presets
                </h2>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {presetData.map(
                  ({
                    text,
                    icon: Icon,
                    iconClass,
                  }) => (
                    <button
                      key={text}
                      type="button"
                      disabled={
                        isLoading ||
                        contextLoading
                      }
                      onClick={() =>
                        handleSend(text)
                      }
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-700 bg-[#081426] p-4 text-left transition hover:border-blue-500/60 hover:bg-[#0c1b33] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                      >
                        <Icon size={20} />
                      </div>

                      <span className="text-sm font-medium leading-6 text-slate-100">
                        {text}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-800 p-4">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-start gap-3">
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <p className="text-xs leading-5 text-slate-300">
                    <span className="font-semibold text-blue-300">
                      Synthetic Dataset Intelligence
                    </span>

                    <br />

                    Results are calculated from the
                    loaded Kavach AI CSV dataset. No
                    real police records or personal
                    data are used.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#061124]">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-7">
              <div className="mx-auto flex max-w-5xl flex-col gap-7">
                {messages.map((message) => {
                  const isUser =
                    message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="mt-7 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-500/60 bg-blue-500/10 text-blue-300">
                          <Bot size={21} />
                        </div>
                      )}

                      <div
                        className={`min-w-0 ${
                          isUser
                            ? "max-w-[82%] md:max-w-[65%]"
                            : "max-w-[88%] md:max-w-[78%]"
                        }`}
                      >
                        <div
                          className={`mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300 ${
                            isUser
                              ? "justify-end"
                              : ""
                          }`}
                        >
                          <span>
                            {isUser
                              ? "Investigator"
                              : "Kavach AI"}
                          </span>

                          <span className="text-slate-600">
                            •
                          </span>

                          <span>
                            {message.time}
                          </span>
                        </div>

                        <div
                          className={`rounded-2xl border px-5 py-4 ${
                            isUser
                              ? "rounded-tr-md border-blue-500 bg-blue-600 text-white"
                              : "rounded-tl-md border-slate-600 bg-[#1a2940] text-slate-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-7">
                            {message.content}
                          </p>

                          {message.rows?.length >
                            0 && (
                            <div className="mt-4 max-w-full overflow-x-auto rounded-xl border border-slate-600">
                              <table className="min-w-full text-xs">
                                <thead className="bg-[#061124]">
                                  <tr>
                                    {Object.keys(
                                      message.rows[0],
                                    ).map(
                                      (column) => (
                                        <th
                                          key={
                                            column
                                          }
                                          className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-200"
                                        >
                                          {column
                                            .replace(
                                              /_/g,
                                              " ",
                                            )
                                            .replace(
                                              /\b\w/g,
                                              (
                                                character,
                                              ) =>
                                                character.toUpperCase(),
                                            )}
                                        </th>
                                      ),
                                    )}
                                  </tr>
                                </thead>

                                <tbody>
                                  {message.rows.map(
                                    (
                                      row,
                                      rowIndex,
                                    ) => (
                                      <tr
                                        key={`${message.id}-${rowIndex}`}
                                        className="border-t border-slate-700"
                                      >
                                        {Object.keys(
                                          message
                                            .rows[0],
                                        ).map(
                                          (
                                            column,
                                          ) => (
                                            <td
                                              key={
                                                column
                                              }
                                              className="max-w-72 whitespace-normal px-4 py-3 text-slate-300"
                                            >
                                              {row[
                                                column
                                              ] ??
                                                "—"}
                                            </td>
                                          ),
                                        )}
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {message.note && (
                            <div className="mt-4 border-t border-slate-600 pt-3">
                              <p className="text-xs leading-5 text-slate-400">
                                {message.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {isUser && (
                        <div className="mt-7 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                          <UserRound size={18} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="mt-7 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-500/60 bg-blue-500/10 text-blue-300">
                      <Bot size={21} />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <span>Kavach AI</span>

                        <span className="text-slate-600">
                          •
                        </span>

                        <span>
                          Analysing
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-600 bg-[#1a2940] px-5 py-4">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />

                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />

                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />

                        <span className="ml-2 text-sm text-slate-300">
                          Analysing CSV dataset...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-700 bg-[#0a1629] p-4">
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex max-w-5xl items-center gap-3"
              >
                <input
                  type="text"
                  value={question}
                  disabled={
                    isLoading ||
                    contextLoading
                  }
                  onChange={(event) =>
                    setQuestion(
                      event.target.value,
                    )
                  }
                  placeholder={
                    contextLoading
                      ? "Loading FIR dataset..."
                      : "Ask Kavach AI about cases, offenders, crime trends or districts..."
                  }
                  className="h-13 min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#061124] px-5 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={
                    !question.trim() ||
                    isLoading ||
                    contextLoading
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={19} />
                </button>
              </form>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AICrimeAssistant;