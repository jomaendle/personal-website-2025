"use client";
import { useEffect, useState } from "react";
import { BaselineStatusSkeleton } from "@/components/ui/skeleton";

const BaselineStatus = ({ featureId }: { featureId: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import and define the custom element
    import("baseline-status").then((module) => {
      // Ensure the component is defined only once
      if (!customElements.get("baseline-status")) {
        customElements.define("baseline-status", module.default);
      }
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) {
    return <BaselineStatusSkeleton />;
  }

  return (
    <div className="relative mb-8 min-h-[200px] rounded-[.25rem] border border-border bg-card sm:min-h-[160px] md:min-h-[128px]">
      <div className="motion-translate-y-in-25 motion-opacity-in-50">
        <baseline-status
          featureid={featureId}
          className="bg-inherit pb-2"
        ></baseline-status>
      </div>
    </div>
  );
};

export default BaselineStatus;
