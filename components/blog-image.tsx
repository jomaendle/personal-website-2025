export function BlogImage({ src, caption }: { src: string; caption: string }) {
  return (
    <figure>
      <img src={src} loading="lazy" alt={caption} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
