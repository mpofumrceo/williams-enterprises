import {
  CheckCircle,
  HardHat,
  ShieldCheck,
  Clock,
  Award,
} from "lucide-react";

const reasons = [
  {
    title: "Experienced Professionals",
    icon: HardHat,
  },
  {
    title: "Guaranteed Quality",
    icon: ShieldCheck,
  },
  {
    title: "Timely Delivery",
    icon: Clock,
  },
  {
    title: "Industry Standards",
    icon: Award,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="font-semibold text-amber-600">
            WHY CHOOSE US
          </span>

          <h2 className="mt-4 text-5xl font-bold text-[#0A2540]">
            Excellence In Every Project
          </h2>

        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <div
                key={reason.title}
                className="rounded-3xl border p-8 text-center shadow-lg"
              >
                <Icon
                  size={50}
                  className="mx-auto mb-6 text-amber-600"
                />

                <h3 className="text-xl font-bold text-[#0A2540]">
                  {reason.title}
                </h3>

                <CheckCircle
                  className="mx-auto mt-6 text-green-600"
                  size={24}
                />
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}