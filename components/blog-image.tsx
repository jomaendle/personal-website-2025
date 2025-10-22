import Image from "next/image";
import { cn } from "@/lib/utils";

export function BlogImage({
  src,
  caption,
  className,
  width = 800,
  height = 800,
}: {
  src: string;
  caption: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure>
      <Image
        src={src}
        loading="lazy"
        alt={caption}
        className={cn("h-auto w-full object-contain", className)}
        width={width}
        height={height}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        style={{ contain: "layout style paint" }}
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function BlogVideo({
  src,
  caption,
  className,
  posterSrc,
}: {
  src: string;
  caption: string;
  className?: string;
  posterSrc?: string;
}) {
  return (
    <figure className={cn("flex flex-col", className)}>
      <video
        controls
        loop={true}
        className="h-full max-h-[400px] w-full object-contain"
        poster={posterSrc}
        aria-label={caption || "Video content"}
      >
        <source src={src} type="video/mp4" />
      </video>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
