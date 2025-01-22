export function BlogImage({ src, caption }: { src: string; caption: string }) {
  return (
    <figure>
      <img
        src={src}
        loading="lazy"
        alt={caption}
        className="w-full h-auto object-contain"
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
