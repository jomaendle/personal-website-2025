import Image from "next/image";
import { cn } from "@/lib/utils";

export function BlogImage({
  src,
  caption,
  className,
}: {
  src: string;
  caption: string;
  className?: string;
}) {
  return (
    <figure>
      <Image
        src={src}
        loading="lazy"
        alt={caption}
        className={cn("h-auto w-full object-contain", className)}
        width={800}
        height={800}
        unoptimized
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function BlogVideo({
  src,
  caption,
  className,
}: {
  src: string;
  caption: string;
  className?: string;
}) {
  return (
    <figure className={cn("flex flex-col", className)}>
      <video
        controls
        loop={true}
        className="h-full max-h-[400px] w-full object-contain"
        autoPlay={true}
      >
        <source src={src} type="video/mp4" />
      </video>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
