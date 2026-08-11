import ServicesPageContent from "./ServicesPageContent";
import { getHeroBackground, getServices } from "@/src/lib/data/public";

export const metadata = {
  title: "Services",
  description:
    "Explore Williams Enterprises construction services — from pre-construction planning to roofing, plumbing, electrical, and more.",
};

export default async function ServicesPage() {
  const [hero, allServices, featured, trending, mostRequested] = await Promise.all([
    getHeroBackground("services"),
    getServices(),
    getServices({ featured: true }),
    getServices({ trending: true }),
    getServices({ mostRequested: true }),
  ]);

  return (
    <ServicesPageContent
      hero={hero}
      trending={trending.slice(0, 4)}
      mostRequested={mostRequested.slice(0, 4)}
      featured={featured.slice(0, 4)}
      allServices={allServices}
    />
  );
}
