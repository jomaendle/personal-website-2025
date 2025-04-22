"use client";
import posterImg1 from "../../public/crafts/preview/html-details.webp";
import posterImg2 from "../../public/crafts/preview/mspot-subscribe-btn.webp";
import posterImg3 from "../../public/crafts/preview/animated-button.webp";
import { Loader2 } from "lucide-react";
import { CounterCraft } from "@/components/crafts/counter";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";

const crafts: {
  src: string;
  link?: string;
  posterImg: { src: string; width: number; height: number };
  title: string;
  bgColor: string;
}[] = [
  {
    src: "/animated-sign-up-button/tease.mp4",
    posterImg: posterImg3,
    title: "Sign Up Button Animation",
    bgColor: "#060606",
    link: "/blog/animated-sign-up-button",
  },
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
      <CounterCraft />
      {crafts.map((craft) => (
        <CraftsContainer
          key={craft.src}
          style={{ backgroundColor: craft.bgColor }}
          title={craft.title}
          link={craft.link}
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
        </CraftsContainer>
      ))}
    </div>
  );
}
