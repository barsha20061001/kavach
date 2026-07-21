import { Construction } from "lucide-react";
import PageHeader from "./PageHeader";

export default function PlaceholderPage({
  title,
  description,
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
      />

      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-800 bg-[#0f1930]/85 p-8 shadow-2xl shadow-black/10">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10">
            <Construction
              size={30}
              className="text-blue-400"
            />
          </div>

          <h3 className="mt-5 text-xl font-semibold text-white">
            Module foundation ready
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            The layout and navigation for this module are complete. Its
            functional interface will be developed during the upcoming
            implementation days.
          </p>
        </div>
      </section>
    </>
  );
}