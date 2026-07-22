import {
  BookOpen,
  Database,
  ExternalLink,
  FileCode2,
  FileText,
  Network,
  ShieldCheck,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";

const schemaResources = [
  {
    title: "CaseMaster",
    description:
      "Primary FIR table containing crime number, registration date, police station, crime heads, status and court details.",
    icon: FileText,
    fields: [
      "CaseMasterID",
      "CrimeNo",
      "CaseNo",
      "CrimeRegisteredDate",
      "PoliceStationID",
      "CrimeMajorHeadID",
      "CrimeMinorHeadID",
      "CaseStatusID",
    ],
  },
  {
    title: "Accused and Arrest",
    description:
      "Accused records linked to FIRs, together with arrest or surrender information.",
    icon: ShieldCheck,
    fields: [
      "AccusedMasterID",
      "AccusedName",
      "AgeYear",
      "GenderID",
      "ArrestSurrenderDate",
      "IOID",
    ],
  },
  {
    title: "Victim and Complainant",
    description:
      "Case-linked victim and complainant demographic information.",
    icon: BookOpen,
    fields: [
      "VictimMasterID",
      "VictimName",
      "ComplainantID",
      "ComplainantName",
      "AgeYear",
      "GenderID",
    ],
  },
  {
    title: "Act and Sections",
    description:
      "Legal acts and sections associated with each FIR.",
    icon: FileCode2,
    fields: [
      "ActCode",
      "ActDescription",
      "SectionCode",
      "SectionDescription",
      "CaseMasterID",
    ],
  },
  {
    title: "Location and Organisation",
    description:
      "Police stations, districts, states and incident coordinates.",
    icon: Database,
    fields: [
      "PoliceStationID",
      "DistrictID",
      "StateID",
      "latitude",
      "longitude",
      "UnitID",
    ],
  },
  {
    title: "Relationship Model",
    description:
      "Connections between cases, accused persons, victims, legal sections, officers and districts.",
    icon: Network,
    fields: [
      "CaseMaster → Accused",
      "CaseMaster → Victim",
      "CaseMaster → ActSection",
      "CaseMaster → Police Station",
    ],
  },
];

function Resources() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={Database}
        title="Resources"
        description="Dataset documentation, schema references and platform guidance"
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-6">
        <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
          <h2 className="font-semibold text-blue-300">
            Karnataka FIR Dataset
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            Kavach AI uses structured FIR records connecting cases,
            police stations, districts, accused persons, victims,
            legal sections, courts and investigation details.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <ResourceButton
              label="Open schema summary"
              onClick={() => {
                document
                  .getElementById("schema-resources")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            />

            <ResourceLink
              label="Zoho Catalyst Console"
              href="https://catalyst.zoho.com/"
            />
          </div>
        </section>

        <section
          id="schema-resources"
          className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {schemaResources.map((resource) => {
            const Icon = resource.icon;

            return (
              <article
                key={resource.title}
                className="rounded-2xl border border-slate-700 bg-[#071225] p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    <Icon size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      {resource.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {resource.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {resource.fields.map((field) => (
                    <span
                      key={field}
                      className="rounded-lg border border-slate-700 bg-[#061124] px-2.5 py-1.5 text-xs text-slate-300"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-700 bg-[#071225] p-5">
          <h2 className="font-semibold text-white">
            Development guidelines
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Guideline
              title="Use safe queries"
              description="Allow read-only queries for analytics and block destructive SQL commands."
            />

            <Guideline
              title="Protect personal information"
              description="Restrict sensitive victim, complainant and accused information using role-based access."
            />

            <Guideline
              title="Verify AI output"
              description="Treat generated insights as investigative support rather than final legal conclusions."
            />

            <Guideline
              title="Maintain audit trails"
              description="Record user, query, result count, timestamp and access status for important activity."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function ResourceButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
    >
      {label}
    </button>
  );
}

function ResourceLink({ label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-blue-500 hover:text-white"
    >
      {label}
      <ExternalLink size={16} />
    </a>
  );
}

function Guideline({ title, description }) {
  return (
    <div className="rounded-xl bg-[#0b1930] p-4">
      <h3 className="text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default Resources;