import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PageHeader from "../components/common/PageHeader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

function CaseSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(
    searchParams.get("q") || "",
  );

  const [district, setDistrict] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const {
    data: searchData,
    loading,
    error,
  } = useApi(
    () =>
      api.search({
        query,
        district:
          district === "All" ? "" : district,
        status:
          status === "All" ? "" : status,
      }),
    [query, district, status],
  );

  const {
    data: districtData,
    loading: districtsLoading,
  } = useApi(() => api.districts(), []);

  const results = useMemo(() => {
    const cases =
      searchData?.results ??
      searchData?.cases ??
      searchData?.data ??
      [];

    return cases.map((crime, index) => ({
      id:
        crime.id ??
        crime.caseId ??
        crime.firId ??
        `case-${index}`,

      crimeNo:
        crime.crimeNo ??
        crime.crimeNumber ??
        "",

      caseNo:
        crime.caseNo ??
        crime.firNo ??
        crime.crimeNo ??
        "Not available",

      date:
        crime.date ??
        crime.firDate ??
        crime.registeredDate ??
        "",

      district:
        crime.district ??
        crime.districtName ??
        "Unknown district",

      policeStation:
        crime.policeStation ??
        crime.policeStationName ??
        crime.unitName ??
        "Unknown police station",

      crimeHead:
        crime.crimeHead ??
        crime.crimeHeadName ??
        crime.offenceCategory ??
        "",

      crimeSubHead:
        crime.crimeSubHead ??
        crime.crimeSubHeadName ??
        crime.offence ??
        crime.crimeHead ??
        crime.crimeHeadName ??
        "Unknown offence",

      status:
        crime.status ??
        crime.statusName ??
        crime.caseStatus ??
        "Unknown",

      gravity:
        crime.gravity ??
        crime.gravityName ??
        crime.severity ??
        "Not specified",
    }));
  }, [searchData]);

  const districts = useMemo(() => {
    const items =
      districtData?.districts ??
      districtData?.data ??
      districtData ??
      [];

    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item) =>
        typeof item === "string"
          ? item
          : item.districtName ??
            item.name ??
            item.label,
      )
      .filter(Boolean)
      .sort((first, second) =>
        first.localeCompare(second),
      );
  }, [districtData]);

  const statuses = useMemo(() => {
    const backendStatuses =
      searchData?.filters?.statuses ??
      searchData?.statuses ??
      [];

    if (
      Array.isArray(backendStatuses) &&
      backendStatuses.length > 0
    ) {
      return backendStatuses
        .map((item) =>
          typeof item === "string"
            ? item
            : item.statusName ??
              item.name ??
              item.label,
        )
        .filter(Boolean)
        .sort((first, second) =>
          first.localeCompare(second),
        );
    }

    return [
      ...new Set(
        results
          .map((crime) => crime.status)
          .filter(Boolean),
      ),
    ].sort((first, second) =>
      first.localeCompare(second),
    );
  }, [searchData, results]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GB");
  };

  const isHighGravity = (gravity) => {
    const value = String(gravity).toLowerCase();

    return (
      value.includes("high") ||
      value.includes("grave") ||
      value.includes("heinous") ||
      value.includes("serious")
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={Search}
        title="Case Search"
        description="Search FIRs using case number, district, offence, accused or section"
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-3 rounded-2xl border border-slate-700 bg-[#071225] p-4 md:grid-cols-[1fr_220px_220px]">
          <input
            value={query}
            onChange={(event) => {
              const value = event.target.value;

              setQuery(value);

              const nextParams = new URLSearchParams(
                searchParams,
              );

              if (value.trim()) {
                nextParams.set("q", value);
              } else {
                nextParams.delete("q");
              }

              setSearchParams(nextParams);
            }}
            placeholder="Search Crime No, Case No, accused, offence..."
            className="rounded-xl border border-slate-700 bg-[#061124] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          />

          <select
            value={district}
            onChange={(event) =>
              setDistrict(event.target.value)
            }
            disabled={districtsLoading}
            className="rounded-xl border border-slate-700 bg-[#061124] px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="All">
              {districtsLoading
                ? "Loading districts..."
                : "All"}
            </option>

            {districts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-xl border border-slate-700 bg-[#061124] px-4 py-3 text-sm text-white"
          >
            <option value="All">All</option>

            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-700">
          <table className="min-w-full text-sm">
            <thead className="bg-[#071225]">
              <tr>
                {[
                  "Case No",
                  "Date",
                  "District",
                  "Police Station",
                  "Crime",
                  "Status",
                  "Gravity",
                ].map((title) => (
                  <th
                    key={title}
                    className="whitespace-nowrap px-4 py-4 text-left text-slate-300"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 bg-[#061124]">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    Searching case records...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    No case records found.
                  </td>
                </tr>
              ) : (
                results.map((crime) => (
                  <tr
                    key={crime.id}
                    className="hover:bg-[#0b1930]"
                  >
                    <td className="px-4 py-4 font-medium text-blue-400">
                      {crime.caseNo}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatDate(crime.date)}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {crime.district}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {crime.policeStation}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {crime.crimeSubHead}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {crime.status}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          isHighGravity(crime.gravity)
                            ? "bg-red-500/15 text-red-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {crime.gravity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default CaseSearch;