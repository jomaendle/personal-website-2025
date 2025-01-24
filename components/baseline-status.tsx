"use client";
import { useEffect } from "react";

const BaselineStatus = ({ featureId }) => {
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
    <baseline-status
      featureid={featureId}
      className="bg-neutral-950 pb-2"
    ></baseline-status>
  );
};

export default BaselineStatus;
