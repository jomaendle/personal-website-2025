import Link from "next/link";

const links = [
  {
    href: "https://www.linkedin.com/in/johannes-maendle/",
    text: "LinkedIn",
  },
  {
    href: "https://github.com/jomaendle",
    text: "GitHub",
  },
  {
    href: "mailto:hello@jomaendle.com",
    text: "Email",
  },
];

export const MoreLinks = () => {
  return (
    <>
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="block text-muted-foreground hover:text-primary transition-colors"
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
