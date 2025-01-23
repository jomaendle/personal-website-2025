import Image from "next/image";

export function BlogImage({ src, caption }: { src: string; caption: string }) {
  return (
    <figure>
      <Image
        src={src}
        loading="lazy"
        alt={caption}
        className="w-full h-auto object-contain"
        width={800}
        height={800}
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
    <figure className={className}>
      <video
        controls
        loop={true}
        className="w-full h-auto max-h-[400px] object-contain"
      >
        <source src={src} type="video/mp4" />
      </video>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
