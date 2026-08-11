import type { HeroBackground } from "@/src/types/database";

interface HeroBackgroundProps {
  hero?: HeroBackground | null;
  fallbackColor?: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}

export default function HeroBackgroundComponent({
  hero,
  fallbackColor = "#0A2540",
  children,
  className = "",
  minHeight = "min-h-[50vh]",
}: HeroBackgroundProps) {
  const overlayColor = hero?.overlay_color || fallbackColor;
  const overlayOpacity = hero?.overlay_opacity ?? 0.85;

  const renderBackground = () => {
    if (!hero?.background_url) {
      return <div className="absolute inset-0" style={{ backgroundColor: fallbackColor }} />;
    }

    switch (hero.background_type) {
      case "youtube": {
        const videoId = extractYouTubeId(hero.background_url);
        if (!videoId) {
          return <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hero.background_url})` }} />;
        }
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0`}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            allow="autoplay; encrypted-media"
            title="Hero background"
          />
        );
      }
      case "video":
        return (
          <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
            <source src={hero.background_url} />
          </video>
        );
      case "image":
      case "url":
      default:
        return (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hero.background_url})` }}
          />
        );
    }
  };

  return (
    <section className={`relative overflow-hidden ${minHeight} ${className}`}>
      {renderBackground()}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
