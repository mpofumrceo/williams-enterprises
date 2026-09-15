import ServicesPageContent from "./ServicesPageContent";
import { getHeroBackground, getServices } from "@/src/lib/data/public";

export const revalidate = 60;

export const metadata = {
  title: "Services",
  description:
    "Explore Williams Enterprises construction services — from pre-construction planning to roofing, plumbing, electrical, and more.",
};

export default async function ServicesPage() {
  const [hero, allServices] = await Promise.all([
    getHeroBackground("services"),
    getServices(),
  ]);

  const featured = allServices.filter((s) => s.is_featured);
  const trending = allServices.filter((s) => s.is_trending);
  const mostRequested = allServices.filter((s) => s.is_most_requested);

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
