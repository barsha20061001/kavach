import { useMemo, useState } from "react";
import {
  ClipboardList,
  Download,
  Search,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { auditLogs } from "../data/crimeData";

function AuditLogs() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const searchableText = [
        log.user,
        log.role,
        log.action,
        log.resource,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchableText.includes(query.toLowerCase()) &&
        (status === "All" || log.status === status)
      );
    });
  }, [query, status]);

  const exportLogs = () => {
    const headers = [
      "User",
      "Role",
      "Action",
      "Resource",
      "Timestamp",
      "Status",
    ];

    const rows = filteredLogs.map((log) => [
      log.user,
      log.role,
      log.action,
      log.resource,
      log.timestamp,
      log.status,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${value}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "kavach-audit-logs.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={ClipboardList}
        title="Audit Logs"
        description="Track data access, AI queries, reports and security-related activity"
        action={
          <button
            type="button"
            onClick={exportLogs}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Download size={17} />
            Export CSV
          </button>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-3 rounded-2xl border border-slate-700 bg-[#071225] p-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-3.5 text-slate-500"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users, actions or resources..."
              className="w-full rounded-xl border border-slate-700 bg-[#061124] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-700 bg-[#061124] px-4 py-3 text-sm text-white outline-none"
          >
            <option>All</option>
            <option>Success</option>
            <option>Denied</option>
          </select>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-700">
          <table className="min-w-full text-sm">
            <thead className="bg-[#071225]">
              <tr>
                {[
                  "User",
                  "Role",
                  "Action",
                  "Resource",
                  "Timestamp",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-4 py-4 text-left font-semibold text-slate-300"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 bg-[#061124]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#0b1930]">
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-white">
                    {log.user}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                    {log.role}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                    {log.action}
                  </td>

                  <td className="max-w-72 truncate px-4 py-4 text-slate-400">
                    {log.resource}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                    {log.timestamp}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        log.status === "Success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {log.status === "Success" ? (
                        <ShieldCheck size={14} />
                      ) : (
                        <ShieldX size={14} />
                      )}

                      {log.status}
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

export default AuditLogs;