export default function StatsSection({
  stats,
}: {
  stats?: { title: string; subtitle: string }[];
}) {
  if (!stats?.length) return null;

  return (
    <section className="bg-navy py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.subtitle} className="rounded-3xl glass p-8 text-center">
              <h3 className="text-5xl font-bold text-white">{stat.title}</h3>
              <p className="mt-2 text-slate-300">{stat.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
