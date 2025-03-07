import { Link } from "next-view-transitions";

const links = [
  {
    href: "https://www.linkedin.com/in/johannes-maendle/",
    text: "LinkedIn",
  },
  {
    href: "https://medium.com/@johannes.maendle",
    text: "Medium",
  },
  {
    href: "https://github.com/jomaendle",
    text: "GitHub",
  },
  {
    text: "Unsplash",
    href: "https://unsplash.com/@leonardo_64",
  },
  {
    text: "YouTube",
    href: "https://www.youtube.com/@jo.maendle/videos",
  },
];

export const MoreLinks = () => {
  return (
    <>
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="block text-muted-foreground transition-colors hover:text-primary"
          target={link.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={
            link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
          }
        >
          {link.text}
        </Link>
      ))}
    </>
  );
};
