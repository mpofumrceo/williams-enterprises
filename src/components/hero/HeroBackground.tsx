import Image from "next/image";
import { isOptimizableImageUrl, isVideoUrl } from "@/src/lib/utils/media";
import type { HeroBackground } from "@/src/types/database";
import { resolveHeroImage } from "@/src/lib/content/hero-images";
import type { UiStyle } from "@/src/lib/cms/constants";

interface HeroBackgroundProps {
  hero?: HeroBackground | null;
  fallbackColor?: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  uiStyle?: UiStyle;
}

export default function HeroBackgroundComponent({
  hero,
  fallbackColor = "#0A2540",
  children,
  className = "",
  minHeight = "min-h-dvh",
  uiStyle,
}: HeroBackgroundProps) {
  const desktopUrl = resolveHeroImage(hero?.page_key, hero?.background_url);
  const mobileUrl = hero?.mobile_background_url || desktopUrl;

  return (
    <div className={`relative overflow-hidden ${minHeight} ${className}`} data-hero-style={uiStyle}>
      <div className="absolute inset-0" style={{ backgroundColor: fallbackColor }} />
      <div className="absolute inset-0 md:hidden">
        <HeroMedia url={mobileUrl} />
      </div>
      <div className="absolute inset-0 hidden md:block">
        <HeroMedia url={desktopUrl} />
      </div>
      <div className="hero-media-overlay absolute inset-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function HeroMedia({ url }: { url: string }) {
  if (isVideoUrl(url)) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={url} />
      </video>
    );
  }

  if (isOptimizableImageUrl(url)) {
    return (
      <Image
        src={url}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      fetchPriority="high"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
