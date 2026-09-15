import {
  HardHat,
  ShieldCheck,
  Clock,
  Award,
} from "lucide-react";
import { SkeuoCard } from "@/src/components/ui/surfaces";

const reasons = [
  {
    title: "Experience",
    text: "Skilled professionals delivering residential, commercial and infrastructure work.",
    icon: HardHat,
  },
  {
    title: "Quality",
    text: "Materials, methods and supervision that stand up on site.",
    icon: ShieldCheck,
  },
  {
    title: "Delivery",
    text: "Clear programmes and accountable handover.",
    icon: Clock,
  },
  {
    title: "Standards",
    text: "Safety, professionalism and workmanship as everyday practice.",
    icon: Award,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Why choose us</p>
          <h2 className="mt-4 text-4xl font-bold text-navy md:text-5xl">Excellence in every project</h2>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <SkeuoCard key={reason.title} className="p-8 text-center">
                <Icon size={40} className="mx-auto mb-5 text-amber-600" />
                <h3 className="text-xl font-bold text-navy">{reason.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{reason.text}</p>
              </SkeuoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
