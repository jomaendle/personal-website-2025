"use client";
import { useEffect } from "react";

const BaselineStatus = ({ featureId }: { featureId: string }) => {
  useEffect(() => {
    // Dynamically import and define the custom element
    import("baseline-status").then((module) => {
      // Ensure the component is defined only once
      if (!customElements.get("baseline-status")) {
        customElements.define("baseline-status", module.default);
      }
    });
  }, []);

  return (
    <div className="min-h-[200px] sm:min-h-[160px]  md:min-h-[128px] bg-neutral-950 border rounded-[.25rem] border-neutral-800">
      <baseline-status
        featureid={featureId}
        className="bg-inherit pb-2"
      ></baseline-status>
    </div>
  );
};

export default BaselineStatus;
