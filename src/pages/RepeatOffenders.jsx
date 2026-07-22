import { Search, UserRoundSearch } from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { crimeCases } from "../data/crimeData";

function RepeatOffenders() {
  const [search, setSearch] = useState("");

  const offenders = useMemo(() => {
    const map = {};

    crimeCases.forEach((crime) => {
      crime.accused.forEach((name) => {
        if (!map[name]) {
          map[name] = {
            name,
            cases: [],
            districts: new Set(),
            sections: new Set(),
          };
        }

        map[name].cases.push(crime);
        map[name].districts.add(crime.district);

        crime.sections.forEach((section) => {
          map[name].sections.add(section);
        });
      });
    });

    return Object.values(map)
      .map((offender) => ({
        ...offender,
        districts: [...offender.districts],
        sections: [...offender.sections],
      }))
      .filter((offender) => offender.cases.length > 1)
      .filter((offender) =>
        offender.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.cases.length - a.cases.length);
  }, [search]);

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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search offender..."
              className="rounded-xl border border-slate-700 bg-[#071225] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          {offenders.map((offender) => (
            <article
              key={offender.name}
              className="rounded-2xl border border-slate-700 bg-[#071225] p-5"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {offender.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Accused in {offender.cases.length} FIR records
                  </p>
                </div>

                <span className="h-fit rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
                  High attention
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Info
                  label="Districts"
                  value={offender.districts.join(", ")}
                />
                <Info
                  label="Sections"
                  value={offender.sections.join(", ")}
                />
              </div>

              <div className="mt-5 space-y-2">
                {offender.cases.map((crime) => (
                  <div
                    key={crime.id}
                    className="rounded-xl border border-slate-800 bg-[#0b1930] p-3"
                  >
                    <p className="text-sm font-medium text-white">
                      {crime.crimeHead} — {crime.crimeSubHead}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {crime.caseNo} · {crime.district} · {crime.date}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-[#0b1930] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
}

export default RepeatOffenders;