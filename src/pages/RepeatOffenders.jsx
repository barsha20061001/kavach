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
  } = useApi(() => api.repeatOffenders(), []);

  const offenders = useMemo(() => {
    const repeatOffenders =
      data?.offenders ??
      data?.repeatOffenders ??
      data?.data ??
      [];

    const normalizedSearch = search.trim().toLowerCase();

    return repeatOffenders
      .map((offender, offenderIndex) => {
        const cases =
          offender.cases ??
          offender.firs ??
          offender.caseRecords ??
          [];

        const districts = Array.isArray(offender.districts)
          ? offender.districts
          : offender.districts
            ? [offender.districts]
            : [];

        const sections = Array.isArray(offender.sections)
          ? offender.sections
          : offender.sections
            ? [offender.sections]
            : [];

        return {
          id:
            offender.id ??
            offender.accusedId ??
            offender.personId ??
            `offender-${offenderIndex}`,

          name:
            offender.name ??
            offender.accusedName ??
            offender.personName ??
            "Unknown accused",

          caseCount:
            offender.caseCount ??
            offender.totalCases ??
            offender.firCount ??
            cases.length,

          districts,
          sections,
          cases,

          risk:
            offender.risk ??
            offender.riskLevel ??
            offender.attentionLevel ??
            "High attention",
        };
      })
      .filter((offender) => offender.caseCount > 1)
      .filter((offender) =>
        offender.name.toLowerCase().includes(normalizedSearch),
      )
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search offender..."
              className="rounded-xl border border-slate-700 bg-[#071225] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm text-slate-400">
              Loading repeat offenders...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-center">
              <p className="font-semibold text-red-300">
                Unable to load repeat offenders
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {error}
              </p>
            </div>
          </div>
        ) : offenders.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm text-slate-400">
              {search.trim()
                ? "No repeat offender matches your search."
                : "No repeat offenders found in the current dataset."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {offenders.map((offender) => (
              <article
                key={offender.id}
                className="rounded-2xl border border-slate-700 bg-[#071225] p-5"
              >
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {offender.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Accused in{" "}
                      {offender.caseCount.toLocaleString()} FIR records
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
                    {offender.risk}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Info
                    label="Districts"
                    value={
                      offender.districts.length > 0
                        ? offender.districts
                            .map((district) =>
                              typeof district === "string"
                                ? district
                                : district.districtName ??
                                  district.name ??
                                  "Unknown",
                            )
                            .join(", ")
                        : "Not available"
                    }
                  />

                  <Info
                    label="Sections"
                    value={
                      offender.sections.length > 0
                        ? offender.sections
                            .map((section) =>
                              typeof section === "string"
                                ? section
                                : section.sectionName ??
                                  section.section ??
                                  section.code ??
                                  "Unknown",
                            )
                            .join(", ")
                        : "Not available"
                    }
                  />
                </div>

                <div className="mt-5 space-y-2">
                  {offender.cases.length > 0 ? (
                    offender.cases.map((crime, crimeIndex) => {
                      const crimeId =
                        crime.id ??
                        crime.caseId ??
                        crime.firId ??
                        `${offender.id}-case-${crimeIndex}`;

                      const crimeHead =
                        crime.crimeHead ??
                        crime.crimeHeadName ??
                        crime.offence ??
                        "Unknown offence";

                      const crimeSubHead =
                        crime.crimeSubHead ??
                        crime.crimeSubHeadName ??
                        crime.subCategory ??
                        "";

                      const caseNumber =
                        crime.caseNo ??
                        crime.crimeNo ??
                        crime.firNo ??
                        "Case number unavailable";

                      const district =
                        crime.district ??
                        crime.districtName ??
                        "Unknown district";

                      const dateValue =
                        crime.date ??
                        crime.firDate ??
                        crime.registeredDate ??
                        "";

                      const formattedDate = dateValue
                        ? new Date(dateValue).toLocaleDateString(
                            "en-GB",
                          )
                        : "Date unavailable";

                      return (
                        <div
                          key={crimeId}
                          className="rounded-xl border border-slate-800 bg-[#0b1930] p-3"
                        >
                          <p className="text-sm font-medium text-white">
                            {crimeHead}
                            {crimeSubHead
                              ? ` — ${crimeSubHead}`
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {caseNumber} · {district} ·{" "}
                            {formattedDate}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-[#0b1930] p-3">
                      <p className="text-sm text-slate-400">
                        Detailed FIR records are not available.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-[#0b1930] p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-200">
        {value}
      </p>
    </div>
  );
}

export default RepeatOffenders;