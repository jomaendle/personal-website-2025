"use client";
import posterImg1 from "../public/crafts/preview/html-details.webp";
import posterImg2 from "../public/crafts/preview/mspot-subscribe-btn.webp";
import { Loader2 } from "lucide-react";

const crafts = [
  {
    src: "/crafts/animetd-details-demo-website.mp4",
    posterImg: posterImg1,
    title: "Animating the HTML Details Element",
    bgColor: "#16181d",
  },
  {
    src: "/crafts/animated-button-demo.mp4",
    posterImg: posterImg2,
    title: "Subscribe Animation for Memberspot",
    bgColor: "#00010f",
  },
];

export function CraftsOverview() {
  return (
    <div className="flex grid-cols-2 flex-col items-start gap-4 md:grid">
      {crafts.map((craft) => (
        <div
          key={craft.src}
          className="relative h-auto overflow-hidden rounded-lg border pt-2 text-white/80"
          style={{ backgroundColor: craft.bgColor }}
        >
          <div
            id={`loader-${craft.src}`}
            className="motion-preset-fade absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin" />
          </div>
          <video
            autoPlay
            loop
            muted
            playsInline
            height={craft.posterImg.height}
            width={craft.posterImg.width}
            className="w-full max-w-[400px] md:max-w-none"
            poster={craft.posterImg.src}
            aria-label={craft.title}
            onLoadedData={() => {
              document.getElementById(`loader-${craft.src}`)?.remove();
            }}
          >
            <source src={craft.src} type="video/mp4" />
          </video>
          <div className="absolute inset-0 p-2 text-xs">{craft.title}</div>
        </div>
      ))}
    </div>
  );
}
