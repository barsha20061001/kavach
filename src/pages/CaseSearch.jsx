import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { crimeCases } from "../data/crimeData";

function CaseSearch() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All");
  const [status, setStatus] = useState("All");

  const results = useMemo(() => {
    return crimeCases.filter((crime) => {
      const text = [
        crime.crimeNo,
        crime.caseNo,
        crime.district,
        crime.policeStation,
        crime.crimeHead,
        crime.crimeSubHead,
        ...crime.accused,
        ...crime.sections,
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(query.toLowerCase()) &&
        (district === "All" || crime.district === district) &&
        (status === "All" || crime.status === status)
      );
    });
  }, [query, district, status]);

  const districts = [...new Set(crimeCases.map((crime) => crime.district))];
  const statuses = [...new Set(crimeCases.map((crime) => crime.status))];

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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Crime No, Case No, accused, offence..."
            className="rounded-xl border border-slate-700 bg-[#061124] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          />

          <select
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            className="rounded-xl border border-slate-700 bg-[#061124] px-4 py-3 text-sm text-white"
          >
            <option>All</option>
            {districts.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-700 bg-[#061124] px-4 py-3 text-sm text-white"
          >
            <option>All</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

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
              {results.map((crime) => (
                <tr key={crime.id} className="hover:bg-[#0b1930]">
                  <td className="px-4 py-4 font-medium text-blue-400">
                    {crime.caseNo}
                  </td>
                  <td className="px-4 py-4 text-slate-300">{crime.date}</td>
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
                        crime.gravity === "High"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {crime.gravity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default CaseSearch;