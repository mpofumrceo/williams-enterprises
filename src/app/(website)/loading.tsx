export default function Loading() {
  return (
    <div className="animate-pulse bg-white">
      <div className="h-[42vh] min-h-[280px] bg-navy" />
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-16">
        <div className="h-8 w-56 rounded bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
