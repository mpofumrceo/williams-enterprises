import {
  Building2,
  Users,
  Trophy,
  Hammer,
} from "lucide-react";

const stats = [
  {
    title: "50+",
    subtitle: "Projects Completed",
    icon: Building2,
  },
  {
    title: "100+",
    subtitle: "Happy Clients",
    icon: Users,
  },
  {
    title: "10+",
    subtitle: "Years Experience",
    icon: Trophy,
  },
  {
    title: "16+",
    subtitle: "Construction Services",
    icon: Hammer,
  },
];

export default function StatsSection() {
  return (
    <section className="bg-[#0A2540] py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center"
              >
                <Icon
                  className="mx-auto mb-4 text-amber-500"
                  size={40}
                />

                <h3 className="text-5xl font-bold text-white">
                  {stat.title}
                </h3>

                <p className="mt-2 text-slate-300">
                  {stat.subtitle}
                </p>
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}