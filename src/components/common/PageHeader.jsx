export default function PageHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-400 lg:text-base">
          {description}
        </p>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}