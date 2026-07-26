import { Search, UserRoundSearch } from "lucide-react";
import { useMemo, useState } from "react";

import PageHeader from "../components/common/PageHeader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

function RepeatOffenders() {
  const [search, setSearch] = useState("");

  const {
    data,
    loading,
    error,
  } = useApi(
    () => api.repeatOffenders("?minCases=2"),
    [],
  );

  const offenders = useMemo(() => {
    const source =
      data?.offenders ??
      data?.data?.offenders ??
      data?.data ??
      data ??
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return source
      .map((offender, index) => {
        const caseCount = toNumber(
          offender.caseCount ??
            offender.totalCases ??
            offender.linkedCases,
        );

        const districts = normalizeStringArray(
          offender.districts,
        );

        const crimeTypes = normalizeStringArray(
          offender.crimeTypes ??
            offender.categories,
        );

        return {
          id:
            offender.personId ??
            offender.PersonMasterID ??
            offender.id ??
            `offender-${index}`,

          name:
            offender.name ??
            offender.personName ??
            offender.AccusedName ??
            "Unknown person",

          age:
            offender.age ??
            offender.AgeYear ??
            "Not available",

          caseCount,

          districts,

          crimeTypes,

          preferredMO:
            offender.preferredMO ??
            offender.modusOperandi ??
            "Not available",

          lastKnownCaseDate:
            offender.lastKnownCaseDate ??
            offender.latestCaseDate ??
            null,
        };
      })
      .filter((offender) => offender.caseCount >= 2)
      .filter((offender) => {
        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          offender.name,
          offender.age,
          offender.preferredMO,
          ...offender.districts,
          ...offender.crimeTypes,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch,
        );
      })
      .sort(
        (first, second) =>
          second.caseCount - first.caseCount,
      );
  }, [data, search]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={UserRoundSearch}
        title="Repeat Offenders"
        description="Identify accused persons appearing across multiple FIR records"
        action={
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-500"
            />

            <input
              value={search}
              disabled={loading}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search offender..."
              className="rounded-xl border border-slate-700 bg-[#071225] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {String(error)}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-700 bg-[#071225]">
            <p className="text-sm text-slate-400">
              Analysing accused records for repeat-offender patterns...
            </p>
          </div>
        ) : offenders.length === 0 ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-700 bg-[#071225]">
            <div className="text-center">
              <UserRoundSearch
                size={32}
                className="mx-auto text-slate-600"
              />

              <p className="mt-3 text-sm text-slate-400">
                No matching repeat offenders were found.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {offenders.map((offender) => (
              <article
                key={offender.id}
                className="rounded-2xl border border-slate-700 bg-[#071225] p-5"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {offender.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Accused in{" "}
                      {formatNumber(
                        offender.caseCount,
                      )}{" "}
                      FIR records
                    </p>
                  </div>

                  <span
                    className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${getAttentionClass(
                      offender.caseCount,
                    )}`}
                  >
                    {getAttentionLabel(
                      offender.caseCount,
                    )}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Info
                    label="Districts"
                    value={
                      offender.districts.length
                        ? offender.districts.join(
                            ", ",
                          )
                        : "Not available"
                    }
                  />

                  <Info
                    label="Crime categories"
                    value={
                      offender.crimeTypes.length
                        ? offender.crimeTypes.join(
                            ", ",
                          )
                        : "Not available"
                    }
                  />
                </div>

                <div className="mt-5 space-y-2">
                  <div className="rounded-xl border border-slate-800 bg-[#0b1930] p-3">
                    <p className="text-xs text-slate-500">
                      Preferred modus operandi
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {offender.preferredMO}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-800 bg-[#0b1930] p-3">
                      <p className="text-xs text-slate-500">
                        Age
                      </p>

                      <p className="mt-1 text-sm font-medium text-white">
                        {formatAge(offender.age)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-[#0b1930] p-3">
                      <p className="text-xs text-slate-500">
                        Latest linked case
                      </p>

                      <p className="mt-1 text-sm font-medium text-white">
                        {formatDate(
                          offender.lastKnownCaseDate,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && offenders.length > 0 && (
          <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
            <p className="text-xs leading-5 text-slate-400">
              Repeat offenders are identified by grouping
              accused records using PersonMasterID and
              counting the number of distinct linked FIR
              records. The attention level is an analytical
              indicator based on linked-case count, not a
              legal classification.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .map((item) => {
          if (typeof item === "string") {
            return item.trim();
          }

          return String(
            item?.districtName ??
              item?.crimeHeadName ??
              item?.name ??
              "",
          ).trim();
        })
        .filter(Boolean),
    ),
  ];
}

function getAttentionLabel(caseCount) {
  if (caseCount >= 8) {
    return "High attention";
  }

  if (caseCount >= 5) {
    return "Medium attention";
  }

  return "Monitor";
}

function getAttentionClass(caseCount) {
  if (caseCount >= 8) {
    return "bg-red-500/15 text-red-400";
  }

  if (caseCount >= 5) {
    return "bg-amber-500/15 text-amber-400";
  }

  return "bg-blue-500/15 text-blue-400";
}

function formatAge(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not available";
  }

  const age = Number(value);

  if (!Number.isFinite(age)) {
    return String(value);
  }

  return `${age} years`;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString("en-IN");
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-[#0b1930] p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm leading-5 text-slate-200">
        {value}
      </p>
    </div>
  );
}

export default RepeatOffenders;