"use client";

import dynamic from "next/dynamic";

const ContactMapInner = dynamic(() => import("./ContactMapInner"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-navy text-sm text-white/70">Loading map…</div>,
});

interface ContactMapProps {
  lat: number;
  lng: number;
  zoom: number;
  label?: string;
}

export default function ContactMap({ lat, lng, zoom, label }: ContactMapProps) {
  return (
    <div className="h-[420px] w-full overflow-hidden md:h-[520px]">
      <ContactMapInner lat={lat} lng={lng} zoom={zoom} label={label} />
    </div>
  );
}
