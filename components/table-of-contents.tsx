"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";

// Generate slug from text (matching HeadingWithAnchor component)
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

export function MobileTableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const headings = document.querySelectorAll(".prose h2, .prose h3");
    const items: TocItem[] = [];

    headings.forEach((heading, index) => {
      const title = heading.textContent || "";
      // Use existing ID (from HeadingWithAnchor) or generate one as fallback
      const id = heading.id || generateSlug(title) || `heading-${index}`;
      const level = parseInt(heading.tagName.charAt(1));

      // Ensure heading has the ID
      if (!heading.id) {
        heading.id = id;
      }

      items.push({ id, title, level });
    });

    setTocItems(items);
  }, []);

  const handleTocClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative z-10 mb-6 motion-opacity-in xl:hidden">
      {tocItems.length > 0 && (
        <>
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between"
          >
            On This Page
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ↓
            </motion.span>
          </Button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-border bg-card p-4">
                  <div className="space-y-2 text-sm">
                    {tocItems.map((item) => (
                      <div key={item.id} className="flex w-full items-center">
                        <Link
                          href={`#${item.id}`}
                          onClick={handleTocClick}
                          className={`block w-full rounded-md px-2 py-1 text-left transition-colors hover:bg-accent hover:text-accent-foreground ${item.level === 3 ? "ml-4 text-muted-foreground" : "text-foreground"} `}
                        >
                          {item.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
