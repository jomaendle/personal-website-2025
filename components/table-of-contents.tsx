"use client";

import { AnimatePresence, m } from "framer-motion";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDomHeadings } from "@/lib/hooks";

export function MobileTableOfContents() {
  const tocItems = useDomHeadings();
  const [isOpen, setIsOpen] = useState(false);

  const handleTocClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="motion-opacity-in relative z-10 mb-6 xl:hidden">
      {tocItems.length > 0 && (
        <>
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between"
          >
            On This Page
            <m.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ↓
            </m.span>
          </Button>

          <AnimatePresence>
            {isOpen ? (
              <m.div
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
              </m.div>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
